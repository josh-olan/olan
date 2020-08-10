#include <cs50.h>
#include <stdio.h>

int main(void)
{
    //declaring positive height to be input by the user
    int height;
    do 
    {
        height = get_int("Please enter number between 1 and 8: \n");
    } 
    while (height < 1 || height > 8);
    
    for (int a = 0; a < height; a++)
    {
        // for loop displaying the number of dots after row count is taken from height
        for (int c = 1; c < height - a; c++)
        {
            printf(" ");
        }
        // for loop displaying the hashes according to height input in an ascending order
        for (int b = 0; b < a + 1; b++)
        {
            printf("#");
        }

        printf("\n");
    }
}
