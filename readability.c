#include <stdio.h>
#include <cs50.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

int count_letters(string text);
int count_words(string text);
int count_sentences(string text);

int main(void)
{
    string input = get_string("Text: ");
    //function call of the letters count function
    int l = count_letters(input);
    //function call of the words count function
    int w = count_words(input);
    //function call of the sentences count function
    int s = count_sentences(input);
    float L = (float)l / w * 100;
    float S = (float)s / w * 100;
    float index = 0.0588 * L - 0.296 * S - 15.8;
    //function to round the float value and to an integer variable
    int grade = round(index);

    if (grade < 1)
    {
        printf("Before Grade 1\n");
    }
    else if (grade >= 16)
    {
        printf("Grade 16+\n");
    }
    else
    {
        printf("Grade %i\n", grade);
    }

}

int count_letters(string text)
{
    //instantiation and assignment of a value to an int variable b that keeps track of sentences count
    int b = 0;
    for (int a = 0 ; a < strlen(text) ; a++)
    {
        if (isalpha(text[a]))
        {
            b++;
        }
    }
    return b;
}

int count_words(string text)
{
    int i = 0;

    //checks if the first element is not space
    if (!isspace(text[0]))
    {
        i++;
    }

    for (int j = 1; j < strlen(text); j++)
    {
        //if the first element of the string array is not space, the count is added
        if (!isspace(text[j]))
        {
            i = i + 0;
        }

        //if condition that checks if the next string character is space and after that; is not space
        if (isspace(text[j]) && !isspace(text[j] + 1))
        {
            i++;
        }
        else
        {
            i = i + 0;
        }
    }
    return i;
}

int count_sentences(string text)
{
    //instantiation and asssignment of a value to an int variable x that keeps track of sentences count
    int x = 0;
    char exclamationMark = '!';
    char period = '.';
    char questionMark = '?';

    for (int y = 0; y < strlen(text); y++)
    {
        //checks the presence of periods, exclamation marks and questioin marks and records the count
        if (text[y] == period || text[y] == exclamationMark || text[y] == questionMark)
        {
            x++;
        }
    }
    return x;
}