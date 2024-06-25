from pydantic import BaseModel, ValidationError, validator, conint

def BoundedInt(min_value: int, max_value: int):
    return conint(ge=min_value, lt=max_value)

# Define a subclass of BaseModel using the custom type
class MyModel(BaseModel):
    my_bounded_int: BoundedInt(1, 10)  # Only allows integers between 1 (inclusive) and 10 (exclusive)

# Example usage
try:
    model = MyModel(my_bounded_int=5)
    print(model)
    model = MyModel(my_bounded_int=10)  # This should raise an exception
except ValidationError as e:
    print(e)
