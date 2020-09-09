from cs50 import get_string

def main():
    input = get_string("Text: ")
    # function call of the letters count function
    l = count_letters(input)
    #print(f"Letters count is {l}")
    # function call of the words count function
    w = count_words(input)
    #print(f"Word count is {w}")
    # function call of the sentences count function
    s = count_sentences(input)

    L = float(l / w * 100)
    #print(f"L is {L}")

    S = s / w * 100
    #print(f"S is {S}")

    index = 0.0588 * L - 0.296 * S - 15.8
    #print(f"Index is {index}")
    # function to round the float value and to an integer variable
    grade = round(index)
    #print(f"Grade is {grade}")
    if grade < 1:
        print("Before Grade 1")
    elif grade >= 16:
        print("Grade 16+")
    else:
        print(f"Grade {grade}")

def count_letters(text):
    # instantiation and assignment of a value to an int variable b that keeps track of sentences count
    b = 0
    for i in range(len(text)):
        if text[i].isalpha():
            b += 1
    return b

def count_words(text):
    i = 0
    # checks if the first element is not space
    if not text[0].isspace:
        i += 1
    c = 2
    for j in range(1, len(text) - 1, 1):
        # if the first element of the string array is not space, the count is added
        if not text[j].isspace:
            i += 0
        # if condition that checks if the next string character is space and after that; is not space
        if text[j].isspace and not text[c] != " ":
            i += 1
        else:
            i += 0
        c += 1
    return i + 1

def count_sentences(text):
    # instantiation and asssignment of a value to an int variable x that keeps track of sentences count
    x = 0
    exclamationMark = '!'
    period = '.'
    questionMark = '?'
    for y in range(len(text)):
        # checks the presence of periods, exclamation marks and questioin marks and records the count
        if text[y] in [period, exclamationMark, questionMark]:
            x += 1
    return x

main()