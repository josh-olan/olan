from cs50 import get_float

dollars = -1
# checks for negative inputs
while dollars < 0:
    dollars = get_float("Change owed: ")

cents = dollars * 100

# initialization of integer to count number of coins
i = 0

# a while loop to check if 25 cents can be gotten from the leftover change
while cents >= 25:
    cents -= 25
    i += 1

# a while loop to check if 10 cents can be gotten from the leftover change
while cents >= 10:
    cents -= 10
    i += 1

# a while loop to check if 5 cents can be gotten from the leftover change
while cents >= 5:
    cents -= 5
    i += 1

# a while loop to check if 1 cent can be gotten from the leftover change
while cents >= 1:
    cents -= 1
    i += 1

print(f"{i}")