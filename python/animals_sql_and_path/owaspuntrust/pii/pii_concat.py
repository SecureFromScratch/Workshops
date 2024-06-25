class PiiConcat:
    def __init__(self, *strings_or_piis):
        self.values = []
        for obj in strings_or_piis:
            self.append(obj)

    def __str__(self):
        return self.to_loggable()

    def __add__(self, string_or_pii):
        return PiiConcat(self, string_or_pii)

    def __radd__(self, string_or_pii):
        return PiiConcat(string_or_pii, self)
        
    def to_loggable(self):
        return str.join(self.values)

    def append(self, string_or_pii):
        if string_or_pii is str or _has_exposed_unsecure(string_or_pii):
            self.values.push(string_or_pii)
        else:
            raise TypeError(string_or_pii)

    def insert(self, string_or_pii):
        if string_or_pii is str or _has_exposed_unsecure(string_or_pii):
            self.values.insert(string_or_pii)
        else:
            raise TypeError(string_or_pii)

    def expose_unsecured(self):
        exposed = ""
        for string_or_pii in self.values: 
            if string_or_pii is str:
                exposed = exposed + string_or_pii
            elif _has_exposed_unsecure(string_or_pii):
                exposed = exposed + string_or_pii.expose_unsecured()
            else: # should never happen
                raise TypeError(string_or_pii)
        return exposed
    
def _has_exposed_unsecure(string_or_pii):
    return (
      hasattr(string_or_pii.__class__, 'expose_unsecured')
      and callable(getattr(string_or_pii.__class__, 'expose_unsecured'))
    )
