#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
typedef uint8_t BYTE;

int main(int argc, char *argv[])
{
    if (argc > 2)
    {
        //checks cmd line args count
        printf("Enter one command line argument\n");
        return 1;
    }
    //opens memory card
    FILE *f = fopen(argv[1], "r");
    //check if the return value is null
    if (f == NULL)
    {
        printf("File cannot be read\n");
        return 1;
    }

    // create an array from the heap
    BYTE * buffer = malloc(512 * sizeof(BYTE));
    int mem = fread(buffer, sizeof(BYTE), 512, f);

    //space for the filename
    char * filename = malloc(sizeof(char *));
    FILE *img;
    int i = 0;
    // while it's not the end of the file
    while (mem/512 == 1)
    {
        //check if the 512 byte chunk is the start of a jpeg file or not
        if (buffer[0] == 0xff && buffer[1] == 0xd8 && buffer[2] == 0xff)
        {
            i++;
            if ((buffer[3] & 0xf0) == 0xe0)
            {
                //if first jpeg
                if (i == 1)
                {
                    sprintf(filename, "%03i.jpg", 0);
                    img = fopen(filename, "w");
                    fwrite(buffer, sizeof(BYTE), 512, img);
                }
                else
                {
                    fclose(img);
                    sprintf(filename, "%03i.jpg", i);
                    img = fopen(filename, "w");
                    fwrite(buffer, sizeof(BYTE), 512, img);
                }
            }
        }
            //not the start of a new jpeg
        else if (img != NULL)
        {
            //keep writing to it
            fwrite(buffer, sizeof(BYTE), 512, img);
        }
    }
    fclose(img);
    //close any remaining files
    free(filename);
    free(buffer);
}
