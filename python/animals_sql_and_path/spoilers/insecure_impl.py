from contextlib import asynccontextmanager
from typing import Any

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

    # TODO: Build path to image according to parameters in req.query, which client sends as:
    #       { color: <color>, imgName: <imgNameWithExtension> }
    image_path = os.path.join('..', 'public', color, imgName)

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


# (POST) Fetch animal saying. req.body structure: { langTable: <languageTable>, color: <color>, animalId: <animalId> }
@app.post("/api/animalsays")
async def get_animal_saying(body: Any = Body(...), session: AsyncSession = Depends(get_async_session)):
    #body = await request.json()
    logging.info(f'animalsays received: {body}')

    # TODO: Query according to actual req.body which the client sends as
    #       { color: <color>, animal: <animalName> }
    langTable = body.get("langTable")
    found = select(table(langTable)).where(animal = body.get("animal"))
    sayings_query = sqlalchemy.text(
        f"select * from {langTable} "
        f"where animalId=:animalId and color=:color")
    found = await execute_query(session, sayings_query, body)
    logging.info(f'found variable contains: {found}');

    # TODO: assign to 'toSend' from the entries in 'found'
    to_send = found

    logging.info(f'animalsays returns: {to_send}')
    return to_send


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)
