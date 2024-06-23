class PositiveInt(int):
    def __new__(cls, value):
        if not isinstance(value, int):
            raise TypeError("Value must be an integer")

        if value <= 0:
            raise ValueError("Value must be a positive integer")

        return super().__new__(cls, value)
