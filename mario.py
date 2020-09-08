from cs50 import get_int

height = 0
while height < 1 or height > 8:
    height = get_int("Height: ")

b = height - 1
a = 1
for i in range(height):
    # prints spaces
    if not b == 0:
        for f in range(b):
            print(" ", end = "")
    # prints the hashes
    if a < height + 1:
        for h in range(a):
            print("#", end = "")
    a += 1
    b -= 1
    print()