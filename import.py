# first import needed library
from cs50 import SQL
from sys import argv, exit
from csv import reader

db = SQL("sqlite:///students.db")

# check the number of command line arguments
if len(argv) != 2:
    print("ERROR!")
    exit(1)

# open csv file
with open(argv[1]) as csv:
    read = reader(csv)
    hold = []
    for row in read:
        hold.append(row)
    # each row in holder
    for ev in range(1, len(hold), 1):
        # if name count is 3
        split = []
        split.clear()
        split = hold[ev][0].split()
        if len(split) == 3:
            #insert into all 3 name columns
            db.execute("INSERT INTO students(first, middle, last, house, birth) VALUES(?, ?, ?, ?, ?)", split[0], split[1], split[2], hold[ev][1], hold[ev][2])
        else:
            #insert None into middlename
            db.execute("INSERT INTO students(first, middle, last, house, birth) VALUES(?, ?, ?, ?, ?)", split[0], None, split[1], hold[ev][1], hold[ev][2])