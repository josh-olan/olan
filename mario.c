#include <cs50.h>
#include <stdio.h>

int main(void)
{
    int height;
    do 
    {
        height= get_int("Please enter number between 1 and 8: \n");
    } while(height<1 || height >8);
    
    printf("Stored: %i \n", height);
    
    for(int a=0; a<height; a++)
    {
        for(int c=1; c<height-a; c++)
        {
            printf(" ");
        }

        for(int b=0; b<a+1; b++)
        {
            printf("#");
        }
        
        printf("\n");
    }
}
