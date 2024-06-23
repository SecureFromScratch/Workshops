from .pii_concat import PiiConcat

class Pii:
    def __init__(self, sensative_value):
        self._sensative_value = sensative_value

    def expose_unsecured(self):
        return self._sensative_value

    def replace_value(self, newValue):
        self._sensative_value = newValue;

    def __str__(self):
        return self.to_loggable()

    def __add__(self, string_or_pii):
        return PiiConcat(self, string_or_pii)

    def __radd__(self, string_or_pii):
        return PiiConcat(string_or_pii, self)

    def to_loggable(self):
        return "******"
    
    def apply_transform(self, transform_func):
        self._sensative_value = transform_func(self._sensative_value);

    def clone_with_transform(self, transform_func):
        return Pii(transform_func(self.expose_unsecured()))

class ObscuredPii(Pii):
    def __init__(self, sensative_value, alt_identifier_string_or_transform_func):
        super().__init__(sensative_value)
        if alt_identifier_string_or_transform_func is str:
            self.alt_identifier = alt_identifier_string_or_transform_func
        else:
            self.alt_identifier = alt_identifier_string_or_transform_func(self._sensative_value)

    def to_loggable(self):
        return self.alt_identifier

    def clone_with_transform(self, transform_func):
        return ObscuredPii(transform_func(self.expose_unsecured(), self.alt_identifier))
