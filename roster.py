# first import needed library
from cs50 import SQL
from sys import argv, exit
from csv import reader

db = SQL("sqlite:///students.db")

# check the number of command line arguments
if len(argv) != 2:
    print("ERROR!")
    exit(1)
# queries the db
d = []
d = db.execute("SELECT first, middle, last, birth FROM students WHERE house = ? GROUP BY first ORDER BY last", argv[1])

# prints
for row in d:
    if str(row['middle']) == 'None':
        row['middle'] = ''
    print("{} {} {}, born {}".format(row['first'], row['middle'], row['last'], row['birth']))