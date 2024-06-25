import re
from pydantic import validator, BaseModel

class Word(BaseModel):
    value: str

    @validator('value', allow_reuse=True)
    @classmethod
    def check_chars(cls, v):
        if not re.match(r'^[a-zA-Z]+$', v):
            raise ValueError(f'Value must be greater than or equal to {cls.min_bound}')
        return v

    def __eq__(self, other):
        return self.value.__eq__(other)

    def __str__(self):
        return self.value

    def __eq__(self, other):
        return self.value.__eq__(other)

    def __hash__(self):
        return self.value.__hash__()


class Filename(BaseModel):
    value: str

    @validator('value', allow_reuse=True)
    @classmethod
    def check_chars(cls, v):
        if not re.match(r'^[a-zA-Z0-9._-]+$', v):
            raise ValueError(f'Value must be greater than or equal to {cls.min_bound}')
        return v

    def __str__(self):
        return self.value

    def __eq__(self, other):
        return self.value.__eq__(other)

    def __hash__(self):
        return self.value.__hash__()


class UnderscoredWords(BaseModel):
    value: str

    @validator('value', allow_reuse=True)
    @classmethod
    def check_chars(cls, v):
        if not re.match(r'^[a-zA-Z_]+$', v):
            raise ValueError(f'Value must be greater than or equal to {cls.min_bound}')
        return v

    def __str__(self):
        return self.value

    def __eq__(self, other):
        return self.value.__eq__(other)

    def __hash__(self):
        return self.value.__hash__()
