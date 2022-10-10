from document import currentDiv, getElementById
from hello import hello

gameDiv = getElementById(currentDiv())
gameDiv.innerHTML = hello('user')