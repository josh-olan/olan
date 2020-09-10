from sys import argv, exit
from csv import reader, DictReader

def main():
    if not (len(argv)) == 3:
        print("Error!")
        exit(1)

    # csv file
    f = argv[1]
    # open csv file and read contents into memory
    with open(f) as cf:
        read = reader(cf)
        cfile = []
        large = 'large'
        for row in read:
            if large in argv[1]:
                cfile.append(row)
            else:
                cfile.append(row)
        #print("{}".format(cfile))

    # reading text file into memory
    x = argv[2]
    with open(x) as f:
        txt = f.read()
        #print('{}'.format(txt))

    # holds max counts
    maxcounts = []
    maxcounts.insert(0, 'name')
    # check the max count of each str
    for l in range(1, len(cfile[0]), 1):
        mc = strcount(txt, cfile[0][l])
        maxcounts.insert(l, mc)

    # check if each str count matches
    # each row
    # for j in range(1, len(cfile[i]), 1)
    for i in range(1, len(cfile), 1):
        # each element in the row
        if int(cfile[i][1]) == maxcounts[1] and int(cfile[i][2]) == maxcounts[2]:
            if int(cfile[i][3]) == maxcounts[3] and int(cfile[i][len(maxcounts) - 1]) == maxcounts[len(maxcounts) - 1]:
                # print name
                print(f"{cfile[i][0]}")
                exit(0)
    print("No match")

def strcount(text, strval):
    # counter
    # holding the number of times an str occurs
    countnums = []
    countnums.clear()
    for x in range(len(text)):
        c = 0
        # for substring
        y = x + len(strval)
        while text[x : y] == strval:
            c += 1
            x += len(strval)
            y = x + len(strval)
            # adds the count to the list
        if c != 0:
            countnums.append(c)

    cnum = len(countnums) - 1

    if cnum == -1:
        highestCount = 0
        print("No match")
        exit()
    else:
        # to get the highest number of count times
        for a in range(cnum):
            b = a + 1
            if countnums[a] > countnums[b]:
                # move a right
                countnums[a], countnums[b] = countnums[b], countnums[a]
            elif countnums[b] > countnums[a]:
                # leave as is
                countnums[a], countnums[b] = countnums[a], countnums[b]
            else:
                # move a right
                countnums[a], countnums[b] = countnums[b], countnums[a]

        highestCount = countnums[cnum]
        return highestCount;


main()