""" BoundedInt is a base class for types that represent an integer with minimum and maximum values.
    The subclasses are responsible to define *constant* MIN_BOUND & MAX_BOUND values.
    Attempting to create a BoundedInt that is not within the defined range raises an exception. """

from abc import ABC, abstractmethod


class BoundedInt(ABC, int):
    @property
    @abstractmethod
    def MIN_BOUND(self) -> int:
        pass

    @property
    @abstractmethod
    def MAX_BOUND(self) -> int:
        pass

    def __init__(self, value):
        try:
            value = int(value)
        except:
            raise ValueError(f'Value must be convertible to integer')
        if not (self.MIN_BOUND <= value < self.MAX_BOUND):
            raise ValueError(f"Value must be between {self.MIN_BOUND} and {self.MAX_BOUND}")
        self.value = value

    def __repr__(self):
        return f"{self.__class__.__name__}({self.value})"
