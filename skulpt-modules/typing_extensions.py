class _getitem:
    def __getitem__(self, name):
        return name


NotRequired = _getitem()


class TypedDict(dict):
    pass
