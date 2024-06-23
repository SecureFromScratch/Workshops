from ast import Pass
from typing import Generator
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, PositiveInt, ValidationInfo, validator
import uvicorn
import secrets as random # <---- Cryptographically secure random
import logging


###################START BOUNDED INT DEFINITION
# This should normally be in a separate package
# This class uses "pydantic" magic methods (i.e,. __get_validators__)
class BoundedInt:
    min_bound: int
    max_bound: int

    @classmethod
    def __get_validators__(cls) -> Generator:
        yield cls.validate

    @classmethod
    def validate(cls, v: int|str, context: ValidationInfo):
        if isinstance(v, str):
            # needs conversion
            try:
                v = int(v)
            except:
                raise ValueError(f'Value must be an integer')
        if not isinstance(v, int):
            raise ValueError(f'Value must be an integer')
        if v < cls.min_bound or v >= cls.max_bound:
            raise ValueError(f'Value must be between {cls.min_bound} and {cls.max_bound} (exclusive)')
        return v
###################END BOUNDED INT DEFINITION


VALID_LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*-+=_'
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 50

app = FastAPI()


class PasswordLength(BoundedInt):
    min_bound = MIN_PASSWORD_LENGTH
    max_bound = MAX_PASSWORD_LENGTH


def generate_password(length: PasswordLength) -> str:
    result = ''.join(
        random.choice(VALID_LETTERS) for _ in range(0, length)
    )

    return result


@app.get("/genpwd")
async def genpwd_route(length: PasswordLength):	
    password = generate_password(length)
    return { "password": password }


def generate_http_exception(error_desc: str, status_code: int = 422):
    raise HTTPException(status_code=status_code, detail=error_desc)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
