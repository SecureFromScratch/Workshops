class BoundedIntMeta(type):
    def __new__(cls, name, bases, dct):
        # Check if we are defining an abstract base class or a concrete subclass
        if bases != () and bases !=(object,):  # Not creating the base class itself
            if 'min_bound' not in dct or 'max_bound' not in dct:
                raise TypeError("Must define min_bound and max_bound")
            if dct['min_bound'] >= dct['max_bound']:
                raise ValueError("min_bound must be less than max_bound")
        return super().__new__(cls, name, bases, dct)

class BoundedInt(metaclass=BoundedIntMeta):
    min_bound = None
    max_bound = None

    def __init__(self, value):
        if not (self.min_bound <= value < self.max_bound):
            raise ValueError(f"Value must be between {self.min_bound} and {self.max_bound}")
        self.value = value

    def __repr__(self):
        return f"{self.__class__.__name__}({self.value})"

# Subclass with specific bounds
#class ZeroToTen(BoundedInt):
#    min_bound = 0
#    max_bound = 10
