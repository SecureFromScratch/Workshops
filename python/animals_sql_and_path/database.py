import typing
import uuid

import sqlalchemy
from sqlalchemy import create_engine, Column, String
from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy.orm import sessionmaker
#SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from initial_data import ANIMALS_DATA, ENGLISH_DATA, HEBREW_DATA

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///./sql_app.db"

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)

async_session_maker = async_sessionmaker(engine)
Base = declarative_base()

class Animal(Base):
    __tablename__ = "animals"
    animalId = Column(sqlalchemy.String, primary_key=True)
    animalName = Column(sqlalchemy.String, unique=True, nullable=False)
    imgName = Column(sqlalchemy.String, nullable=False)


class EnglishSaying(Base):
    __tablename__ = "english"
    _id = Column(sqlalchemy.Integer, primary_key=True)
    animalId = Column(sqlalchemy.String, unique=False, nullable=False, index=True)
    color = Column(sqlalchemy.String, unique=False, nullable=False, index=True)
    text = Column(sqlalchemy.String, nullable=False)


class HebrewSaying(Base):
    __tablename__ = "hebrew"
    _id = Column(sqlalchemy.Integer, primary_key=True)
    animalId = Column(sqlalchemy.String, unique=False, nullable=False, index=True)
    color = Column(sqlalchemy.String, unique=False, nullable=False, index=True)
    text = Column(sqlalchemy.String, nullable=False)


class Users(Base):
    __tablename__ = "Users"
    UserId   = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(sqlalchemy.String)
    password = Column(sqlalchemy.String)
    email = Column(sqlalchemy.String)

def fill_animal_data(session):
    for entry in ANIMALS_DATA:
        session.add(Animal(animalId=entry.get("animalId"),  animalName=entry.get("animalName"), imgName=entry.get("imgName")))


def fill_english_data(session):
    for entry in ENGLISH_DATA:
        session.add(EnglishSaying(animalId=entry.get("animalId"), color=entry.get("color"), text=entry.get("text")))


def fill_hebrew_data(session):
    for entry in HEBREW_DATA:
        session.add(HebrewSaying(animalId=entry.get("animalId"), color=entry.get("color"), text=entry.get("text")))


async def create_db_and_tables():
    async with engine.begin() as conn:
        # We drop all tables on startup just for demonstration purposes.
        # Don't do this in production!
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        session = async_session_maker()
        fill_animal_data(session)
        fill_english_data(session)
        fill_hebrew_data(session)
        #session.add(Animal(animalName="Lion", imgName="lion.webp"))
        #session.add(Animal(animalName="Monkey", imgName="monkey.webp"))
        #session.add(Animal(animalName="Rabbit", imgName="rabbit.webp"))
        session.add(Users(username="alice", password="alice_password",email="alice@alice.com" ))
        session.add(Users(username="bob", password="bob_password", email="bob@bob.com"))

        await session.commit()

async def get_async_session() -> typing.AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def execute_query(session, query, params=None):
    dicts_list = [item._asdict() for item in await session.execute(query, params)]
    return [
        { key: a[key] for key in a if not key.startswith("_") }
        for a in dicts_list
    ]
