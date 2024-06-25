from pydantic import BaseModel, validator

class BoundedInt(BaseModel):
    value: int

    min_bound: int  # To be set in subclasses
    max_bound: int  # To be set in subclasses

    @validator('value', allow_reuse=True)
    @classmethod
    def check_bounds(cls, v):
        if cls.min_bound is not None and v < cls.min_bound:
            raise ValueError(f'Value must be greater than or equal to {cls.min_bound}')
        if cls.max_bound is not None and v >= cls.max_bound:
            raise ValueError(f'Value must be less than {cls.max_bound}')
        return v
