from document import currentDiv, getElementById
from hello import hello

gameDiv = getElementById(currentDiv())

if gameDiv:
    gameDiv.innerHTML = hello('user')