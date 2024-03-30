class _getitem:
    def __getitem__(self, name):
        return name


Optional = _getitem()
Union = _getitem()
Literal = _getitem()
List = _getitem()


def cast(_typ, val):
    return val
