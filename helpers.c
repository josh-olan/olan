#include "helpers.h"
#include <math.h>
#include <stdlib.h>

// Convert image to grayscale
void grayscale(int height, int width, RGBTRIPLE image[height][width])
{
    //for loop to loop through each row
    for (int i = 0; i < height ; i++)
    {
        //another for loop to loop through each column/ each pixel
        for (int j = 0; j < width; j++)
        {
            BYTE *red = &image[i][j].rgbtRed;
            BYTE *green = &image[i][j].rgbtGreen;
            BYTE *blue = &image[i][j].rgbtBlue;
            float addition = *red + *green + *blue;
            //use a float variable to divide all the 3 variables by 3
            float averager = addition / 3;
            //round it to a whole number
            int average = round(averager);
            //set the three rgb values to the average value
            image[i][j].rgbtRed = average;
            image[i][j].rgbtGreen = average;
            image[i][j].rgbtBlue = average;
        }
    }
    return;
}

// Convert image to sepia
void sepia(int height, int width, RGBTRIPLE image[height][width])
{
    //for loop to loop through each row
    for (int i = 0; i < height ; i++)
    {
        //another for loop to loop through each column/ each pixel
        for (int j = 0; j < width; j++)
        {
            BYTE *red = &image[i][j].rgbtRed;
            BYTE *green = &image[i][j].rgbtGreen;
            BYTE *blue = &image[i][j].rgbtBlue;

            float sepiaRed = .393 * *red + .769 * *green + .189 * *blue;
            int sred = round(sepiaRed);
            // caps the red value at 255 if greater than 255
            if (sred > 255)
            {
                sred = 255;
            }
            float sepiaGreen = .349 * *red + .686 * *green + .168 * *blue;
            int sgreen = round(sepiaGreen);
            // caps the green value at 255 if greater than 255
            if (sgreen > 255)
            {
                sgreen = 255;
            }
            float sepiaBlue = .272 * *red + .534 * *green + .131 * *blue;
            int sblue = round(sepiaBlue);
            // caps the blue value at 255 if greater than 255
            if (sblue > 255)
            {
                sblue = 255;
            }
            image[i][j].rgbtRed = sred;
            image[i][j].rgbtGreen = sgreen;
            image[i][j].rgbtBlue = sblue;
        }
    }
    return;
}

// Reflect image horizontally
void reflect(int height, int width, RGBTRIPLE image[height][width])
{
    RGBTRIPLE *holder = malloc(3 * sizeof(BYTE));

    //for loop to loop through each row
    int k = width / 2;
    for (int i = 0; i < height ; i++)
    {
        //another for loop to loop through each column/ each pixel
        int r = width - 1;
        for (int j = 0; j < k; j++)
        {
            *holder = * &image[i][j];
            image[i][j] = image[i][r];
            image[i][r] = *holder;
            r--;
        }
    }
    free(holder);
    return;
}

// Blur image
void blur(int height, int width, RGBTRIPLE image[height][width])
{
    //for loop to loop through each row
    for (int r = 0; r < height; r++)
    {
        //for loop to loop through each column
        for (int c = 0; c < width; c++)
        {
            int r_minus_one = r - 1;
            if (r_minus_one < 0)
            {
                r_minus_one = (int)NULL;
            }

            int c_minus_one = c - 1;
            if (c_minus_one < 0)
            {
                c_minus_one = (int)NULL;
            }

            int r_plus_one = r + 1;
            if (r_plus_one >= height)
            {
                r_plus_one = (int)NULL;
            }

            int c_plus_one = c + 1;
            if (c_plus_one >= width)
            {
                c_plus_one = (int)NULL;
            }

            // top left
            //== (int)NULL
            int tl = 1;
            if (r - 1 < 0 || c - 1 < 0)
            {
                tl = 0;
                image[r_minus_one][c_minus_one].rgbtBlue = (BYTE)NULL;
                image[r_minus_one][c_minus_one].rgbtGreen = (BYTE)NULL;
                image[r_minus_one][c_minus_one].rgbtRed = (BYTE)NULL;
            }

            // top middle
            int tm = 1;
            if (r - 1 < 0)
            {
                tm = 0;
                image[r_minus_one][c].rgbtBlue = (BYTE)NULL;
                image[r_minus_one][c].rgbtGreen = (BYTE)NULL;
                image[r_minus_one][c].rgbtRed = (BYTE)NULL;
            }

            // top right
            int tr = 1;
            if (r - 1 < 0 || c + 1 >= width)
            {
                tr = 0;
                image[r_minus_one][c_plus_one].rgbtBlue = (BYTE)NULL;
                image[r_minus_one][c_plus_one].rgbtGreen = (BYTE)NULL;
                image[r_minus_one][c_plus_one].rgbtRed = (BYTE)NULL;
            }

            // middle left
            int ml = 1;
            if (c - 1 < 0)
            {
                ml = 0;
                image[r][c_minus_one].rgbtBlue = (BYTE)NULL;
                image[r][c_minus_one].rgbtGreen = (BYTE)NULL;
                image[r][c_minus_one].rgbtRed = (BYTE)NULL;
            }

            //image[r][c]

            // middle right
            int mr = 1;
            if (c + 1 >= width)
            {
                mr = 0;
                image[r][c_plus_one].rgbtBlue = (BYTE)NULL;
                image[r][c_plus_one].rgbtGreen = (BYTE)NULL;
                image[r][c_plus_one].rgbtRed = (BYTE)NULL;
            }

            // bottom left
            int bl = 1;
            if (r + 1 >= height || c - 1 < 0)
            {
                bl = 0;
                image[r_plus_one][c_minus_one].rgbtBlue = (BYTE)NULL;
                image[r_plus_one][c_minus_one].rgbtGreen = (BYTE)NULL;
                image[r_plus_one][c_minus_one].rgbtRed = (BYTE)NULL;
            }

            // bottom middle
            int bm = 1;
            if (r + 1 >= height)
            {
                bm = 0;
                image[r_plus_one][c].rgbtBlue = (BYTE)NULL;
                image[r_plus_one][c].rgbtGreen = (BYTE)NULL;
                image[r_plus_one][c].rgbtRed = (BYTE)NULL;
            }

            // bottom right
            int br = 1;
            if (r + 1 >= height || c + 1 >= width)
            {
                br = 0;
                image[r_plus_one][c_plus_one].rgbtBlue = (BYTE)NULL;
                image[r_plus_one][c_plus_one].rgbtGreen = (BYTE)NULL;
                image[r_plus_one][c_plus_one].rgbtRed = (BYTE)NULL;
            }

            //add all the blue values
            int bluenum = image[r_minus_one][c_minus_one].rgbtBlue + image[r_minus_one][c].rgbtBlue + image[r_minus_one][c_plus_one].rgbtBlue +
                          image[r][c_minus_one].rgbtBlue + image[r][c].rgbtBlue + image[r][c_plus_one].rgbtBlue + image[r_plus_one][c_minus_one].rgbtBlue +
                          image[r_plus_one][c].rgbtBlue + image[r_plus_one][c_plus_one].rgbtBlue;

            int denom = tr + tm + tl + ml + 1 + mr + bl + bm + br;

            //add all the red values
            int rednum = image[r_minus_one][c_minus_one].rgbtRed + image[r_minus_one][c].rgbtRed + image[r_minus_one][c_plus_one].rgbtRed +
                         image[r][c_minus_one].rgbtRed + image[r][c].rgbtRed + image[r][c_plus_one].rgbtRed + image[r_plus_one][c_minus_one].rgbtRed +
                         image[r_plus_one][c].rgbtRed + image[r_plus_one][c_plus_one].rgbtRed;

            //add all the green values
            int greennum = image[r_minus_one][c_minus_one].rgbtGreen + image[r_minus_one][c].rgbtGreen +
                           image[r_minus_one][c_plus_one].rgbtGreen + image[r][c_minus_one].rgbtGreen + image[r][c].rgbtGreen +
                           image[r][c_plus_one].rgbtGreen + image[r_plus_one][c_minus_one].rgbtGreen + image[r_plus_one][c].rgbtGreen +
                           image[r_plus_one][c_plus_one].rgbtGreen;

            int avgblue = bluenum / denom;
            int avgred = rednum / denom;
            int avggreen = greennum / denom;

            image[r][c].rgbtBlue = avgblue;
            image[r][c].rgbtRed = avgred;
            image[r][c].rgbtGreen = avggreen;
        }
    }
    return;
}