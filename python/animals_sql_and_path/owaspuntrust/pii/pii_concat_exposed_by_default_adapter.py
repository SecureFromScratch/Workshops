from .pii_concat import PiiConcat

class PiiConcatExposedByDefaultAdapter():
    def __init__(self, pii_concat):
        self.pii_concat = pii_concat

    def __str__(self):
        return self.expose_unsecured()
