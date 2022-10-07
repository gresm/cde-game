# Mine .pyi implementation of https://github.com/skulpt/skulpt/blob/master/src/lib/document.js
from typing import Any


def getElementById(id: str) -> Element | None:
    pass

def createElement(eName: str) -> Element:
    pass

def getElementsByTagName(tag: str) -> list[Element]:
    pass

def getElementsByClassName(cname: str) -> list[Element]:
    pass

def getElementsByName(cname: str) -> list[Element]:
    pass

def currentDiv() -> str:
    pass

class Element:
    innerHTML: str
    innerText: str
    value: str
    checked: bool | None

    def appendChild(self, ch: Element):
        pass

    def removeChild(self, node: Element):
        pass

    def getCSS(self, key: str) -> str:
        pass

    def setCSS(self, attr: str, value: str):
        pass

    def getAttribute(self, key: str) -> str | None:
        pass

    def setAttribute(self, attr: str, value: str):
        pass

    def getProperty(self, key: str) -> str | None:
        pass
