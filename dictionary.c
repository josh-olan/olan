// Implements a dictionary's functionality

#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <strings.h>

#include "dictionary.h"

// Represents a node in a hash table
typedef struct node
{
    char word[LENGTH + 1];
    struct node *next;
}
node;

// Number of buckets in hash table
const unsigned int N = 50;

// keeps track of size
int t;

// Hash table
node *table[N];

// Returns true if word is in dictionary else false
bool check(const char *word)
{
    // hash word to obtain a hash value
    int num = hash(word);
    // Access linked list at that index in the hash table
    node *tmp = table[num];
    // Traverse linked list, looking for the word( strcasecmp)
    do
    {
        if (strcasecmp(word, tmp->word) == 0)
        {
            return true;
        }
        else if (strcasecmp(word, "a") == 0)
        {
            if(strcasecmp(word, tmp->word))
            {
                return true;
            }
        }
        else
        tmp = tmp->next;
    }
    while (tmp->next != NULL);
    return false;
}

// Hashes word to a number
unsigned int hash(const char *word)
{
    // Source: comment by SocratesSatisfied (https://www.reddit.com/r/cs50/comments/eo4zro/good_hash_function_for_speller/fn7grov/)
    // take a word and run a hash function, returning some number that corresponds to that word
    unsigned long hash = 5381;
    int c = *word;
    c = tolower(c);
    while (*word != 0)
    {
        hash = ((hash << 5) + hash) + c;
        c = *word++;
        c = tolower(c);
    }
    return hash % N;
}

// Loads dictionary into memory, returning true if successful else false
bool load(const char *dictionary)
{
    // open the dictionary file
    FILE *dic = fopen(dictionary, "r");
    // check if the return value is NULL
    if (dic == NULL)
    {
        return false;
    }

    char * n = malloc(sizeof(char *));
    char *new_word = n;
    free(n);
    // Read strings from file one at a time
    t = 1;
    while (fscanf(dic, "%s", new_word) != EOF)
    {
        //fscanf(dic, "%s", new_word);
        // Create a new node for each word that stores the word in the hashtable
        node *new_node = malloc(sizeof(node));
        // check if malloc returns NULL
        if (new_node == NULL)
        {
            return false;
        }

        // copy word into node
        strcpy(new_node->word, new_word);
        new_node->next = NULL;

        // Hash word to obtain a hash value
        int number = hash(new_node->word);

        // Insert node into hash table at that location
        // if the first word is NULL then set values
        if (table[number] == NULL)
        {
            table[number] = new_node;
        }
        else
        {
            // if not, join at the start of the list
            new_node->next = table[number];
            table[number] = new_node;
        }
        t++;
    }
    free(new_word);
    return true;
    //free(new_word);
}

// Returns number of words in dictionary if loaded else 0 if not yet loaded
unsigned int size(void)
{
    //returns number of words in the dictionary
    return t;
}

// Unloads dictionary from memory, returning true if successful else false
bool unload(void)
{
    // any of the memory you've had to allocate has to be freed and given back to the computer
    for (int i = 0; i < N; i++)
    {
        node *tmp = table[i];
        node *cursor = table[i];
        do
        {
            cursor = cursor->next;
            free(tmp);
            tmp = cursor;
        }
        while (cursor != NULL);
    }
    return true;
}
