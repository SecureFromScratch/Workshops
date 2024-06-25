from contextlib import asynccontextmanager
from typing import Any
from pathlib import Path
import re
import sqlalchemy
from fastapi import FastAPI, Request, HTTPException, status, Depends, Body
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy import select, table
from sqlalchemy.ext.asyncio import AsyncSession

from database import Animal, EnglishSaying, create_db_and_tables, get_async_session, execute_query, HebrewSaying
import os
import logging

from owaspuntrust.boxedpath import Sandbox
from owaspuntrust.pydantic.texttypes import Word, Filename, UnderscoredWords

logging.basicConfig(level=logging.INFO)

@asynccontextmanager
async def on_startup(app: FastAPI):
    await create_db_and_tables()
    yield


app = FastAPI(lifespan=on_startup)
app.mount("/public", StaticFiles(directory="../public"), name="public")
sandbox = Sandbox('..', 'public')

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
async def get_animal_image(color: Word, imgName: Filename):
    logging.info(f'myanimal received: {color}, {imgName}')

    # Build a secure path
    image_path = sandbox.join('..', 'public', color, imgName)

    if not os.path.exists(image_path):
        logging.error(f"myanimal couldn't find: {image_path}")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    logging.info(f'myanimal returns: {image_path}')
    return FileResponse(image_path)


@app.get("/api/languages")
async def get_languages():
    return [
        {"name": "English", "table": ENGLISH_COLLECTION},
        {"name": "עברית", "table": HEBREW_COLLECTION}
    ]


class AnimalSayingRequest(BaseModel):
    langTable: UnderscoredWords
    color: Word
    animalId: Word


# (POST) Fetch animal saying. req.body structure: { langTable: <languageTable>, color: <color>, animalId: <animalId> }
@app.post("/api/animalsays")
async def get_animal_saying(request: AnimalSayingRequest, session: AsyncSession = Depends(get_async_session)):
    logging.info(f'animalsays received: {request}')

    valid_tables = {ENGLISH_COLLECTION, HEBREW_COLLECTION}  # Define your valid tables
    if request.langTable not in valid_tables:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid table name")

    # Use bound parameters for security
    query_str = f"SELECT * FROM {request.langTable} WHERE color=:color AND animalId=:animalId"
    sayings_query = sqlalchemy.text(query_str)
    found = await execute_query(session, sayings_query, {"color": str(request.color), "animalId": str(request.animalId)})
    logging.info(f'found variable contains: {found}')

    # Assuming 'found' is a list of dictionaries
    to_send = ([{ "text": entry.get("text") } for entry in found ]) if found \
        else [{"text": "I'm speechless!"}, {"text": "Nothing to say, yet..."}]

    logging.info(f'animalsays returns: {to_send}')
    return to_send


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
