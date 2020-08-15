#include <stdio.h>
#include <cs50.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

string encipher(int key, string text);

int main(int argc, string argv[])
{
    //if there are more than two values in the array, print an error message
    if (argc > 2 || argc == 1)
    {
        printf("Usage: ./caesar key\n");
        return 1;
    }

    //if the value is not a number, print an error message

    for (int j = 0; j < strlen(argv[1]); j++)
    {
        if (!isdigit(argv[1][j]))
        {
            printf("Usage: ./caesar key\n");
            return 1;
        }
    }

    //convert the string to integer
    int key = atoi(argv[1]);

    //get plain text
    string plainText= get_string ("plaintext: ");
    string cipher= encipher(key, plainText);
    printf("ciphertext: %s\n", cipher);

}

//pass it on to a method that will change it to an encrypted text
string encipher(int key, string text)
{
    for (int i = 0; i < strlen(text); i++)
    {
        //if text is lowercase
        if (islower(text[i]))
        {
            char l;
            l= text[i] - 97;
            char formula = (l + key) % 26;
            l= formula + 97;
            text[i]= l;
        }
        //if text is uppercase
        if (isupper(text[i]))
        {
            char u;
            u = text[i] - 65;
            char formula = (u + key) % 26;
            u= formula + 65;
            text[i]= u;
        }
        //if text is not alphabet
        else
        {
            text[i]= text[i];
        }
    }
    return text;
}