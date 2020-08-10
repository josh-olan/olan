#include <stdio.h>
#include <cs50.h>
#include <math.h>

int main(void)
{
    float dollars;
    do 
    {
        //prompt the user for input
        dollars = get_float("Change owed: \n");
    }
    //checks for negative inputs
    while (dollars < 0);

    printf("Change owed: %.2f\n", dollars);

    int cents = round(dollars * 100);
   
    //initialization of integer to count number of coins
    int i = 0;
    //a while loop to check if 25 cents can be gotten from the leftover change
    while (cents >= 25)
    {
        cents = cents - 25;
        i++;
    }
    //a while loop to check if 10 cents can be gotten from the leftover change
    while (cents >= 10)
    {
        cents = cents - 10;
        i++;
    }
    //a while loop to check if 5 cents can be gotten from the leftover change
    while (cents >= 5)
    {
        cents = cents - 5;
        i++;
    }
    //a while loop to check if 1 cent can be gotten from the leftover change
    while (cents >= 1)
    {
        cents = cents - 1;
        i++;
    }

    printf("%i\n", i);
}
