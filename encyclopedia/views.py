from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from . import util
from django import forms
import markdown
import random

def index(request):
    if request.method == 'POST':
        name = request.POST.get("q")
        return HttpResponseRedirect(reverse("entry", args=(name,)))
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries(),
        "header": "All Pages"
    })

def entry(request, name):
    entries = util.list_entries()
    for i in range(len(entries)):
        if name.lower() == entries[i].lower():
            # gets content for the entry
            content = markdown.markdown(util.get_entry(name))
            return render(request, "encyclopedia/entry.html", {
                "content": content,
                "name": entries[i]
            })

    # check if any of the substrings match that of existing entries 
    sub = name[0:1].lower()
    # list of values with match
    vals = []

    # loop through each of the existing entries
    for i in range(len(entries)):
        if sub == entries[i][0:1].lower():
            vals.append(entries[i])

    # if the list is not empty
    if not vals == []:        
        return render(request, "encyclopedia/index.html", {
            "entries": vals,
            "header": "Search Results"
        })
    else:           
        return render(request, "encyclopedia/error.html", {
            "error": "Requested Page not found! 404"
        })        

def new(request):
    if request.method == 'POST':
        title = request.POST.get("title")
        content = request.POST.get("input")
        entries = util.list_entries()
        # looping through each title
        for entry in entries:
            if title.lower() == entry.lower():
                return render(request, "encyclopedia/error.html", {
                    "error": "Title already exists!"
                })
        # save the entry to disk
        util.save_entry(title, content)
        return HttpResponseRedirect(reverse("entry", args=(title,)))        
    return render(request, "encyclopedia/newpage.html")

def edit(request, val):
    if request.method == 'POST':
        # gets the content of the textarea
        content = request.POST.get("input")

        # update file with latest content
        util.save_entry(val, content)

        # redirect user to the page
        return HttpResponseRedirect(reverse("entry", args=(val,)))

    #  GET
    md = util.get_entry(val)
    return render(request, "encyclopedia/edit.html", {
        "md": md,
        "val": val
    })

def rand(request):
    entries = util.list_entries()
    return HttpResponseRedirect(reverse("entry", args=(random.choice(entries),)))
