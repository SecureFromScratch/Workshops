from contextlib import asynccontextmanager
from typing import Any
from pathlib import Path
import re
import sqlalchemy
from fastapi import FastAPI, Request, HTTPException, status, Depends, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, table
from sqlalchemy.ext.asyncio import AsyncSession

from database import Animal, EnglishSaying, create_db_and_tables, get_async_session, execute_query, HebrewSaying
import os
import logging

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def on_startup(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=on_startup)
app.mount("/public", StaticFiles(directory="../public"), name="public")

ANIMALS_COLLECTION = Animal.__tablename__
ENGLISH_COLLECTION = EnglishSaying.__tablename__
HEBREW_COLLECTION = HebrewSaying.__tablename__


# (GET) request handler to fetch animals from MongoDB. No query arguments.
@app.get("/api/animals")
async def get_animals(session: AsyncSession = Depends(get_async_session)):
    animals_query = sqlalchemy.text(f"select * from {ANIMALS_COLLECTION}")
    animals = await execute_query(session, animals_query)
    logging.info(f'animals returns: {animals}')
    return animals


# (GET) Fetch animal image. Query parameters are: color=<color>&imgName=<imgNameWithExtension>
@app.get("/api/myanimal")
async def get_animal_image(color: str, imgName: str):
    logging.info(f'myanimal received: {color}, {imgName}')

    # Validate color and imgName to contain only alphanumeric characters and underscores/dashes
    if not re.match(r'^[a-zA-Z0-9_-]+$', color) or not re.match(r'^[a-zA-Z0-9._-]+$', imgName):
        logging.error(f"Invalid characters in color or imgName: {color}, {imgName}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid input")

    # Build a secure path
    base_directory = Path('..', 'public').resolve()
    safe_path = base_directory / color / imgName

    # Ensure the path is still within the intended directory
    if not base_directory in safe_path.resolve().parents:
        logging.error(f"Detected directory traversal attempt: {color}, {imgName}")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    if not safe_path.exists():
        logging.error(f"myanimal couldn't find: {safe_path}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    logging.info(f'myanimal returns: {safe_path}')
    return FileResponse(str(safe_path))


@app.get("/api/languages")
async def get_languages():
    return [
        {"name": "English", "table": ENGLISH_COLLECTION},
        {"name": "עברית", "table": HEBREW_COLLECTION}
    ]


# (POST) Fetch animal saying. req.body structure: { langTable: <languageTable>, color: <color>, animalId: <animalId> }
@app.post("/api/animalsays")
async def get_animal_saying(request: Request, session: AsyncSession = Depends(get_async_session)):
    body = await request.json()
    logging.info(f'animalsays received: {body}')

    # Validate body content or use default values
    langTable = body.get("langTable", ENGLISH_COLLECTION)
    color = body.get("color", "blue")  # Example default value
    animalId = body.get("animalId", "lion")  # Example default value

    valid_tables = {ENGLISH_COLLECTION, HEBREW_COLLECTION}  # Define your valid tables
    if langTable not in valid_tables:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid table name")

    # Use bound parameters for security
    query_str = f"SELECT * FROM {langTable} WHERE color=:color AND animalId=:animalId"
    sayings_query = sqlalchemy.text(query_str)
    found = await execute_query(session, sayings_query, {"langTable": langTable, "color": color, "animalId": animalId})
    logging.info(f'found variable contains: {found}')

    # Assuming 'found' is a list of dictionaries
    to_send = found if found else [{"text": "I'm speechless!"}, {"text": "Nothing to say, yet..."}]

    logging.info(f'animalsays returns: {to_send}')
    return to_send


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
