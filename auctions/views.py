from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.db.models import Sum

from .models import User, Listing, Bids, Watchlist, Comments


def index(request):
    listings = Listing.objects.filter(active=True)
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))

    return render(request, "auctions/index.html", {
        "listings" : listings,
        "watchlist": watchlist['itemcount__sum']
    })

@login_required(login_url='login')
def wonlistings(request):
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))
    wonlistings = Bids.objects.filter(bidder=User.objects.get(id=request.session["id"]))
    bid = []
    for listing in wonlistings:
        bid.append(listing)
    
    wonlistings = []
    for items in bid:
        if items.item.active == False:
            wonlistings.append(items.item)
    
    return render(request, "auctions/wonlistings.html", {
        "wonlistings": wonlistings,
        "watchlist": watchlist['itemcount__sum']
    })

@login_required(login_url='login')
def listingclosed(request, id):
    """
    Renders a closed auction's page
    """
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))
    listing = Listing.objects.get(id=id)
    winner = Bids.objects.get(item=listing).bidder

    # Get the comments if object has been commented on
    try:
        itemcomments = Comments.objects.filter(listing=listing)
    except ObjectDoesNotExist:
        itemcomments = None

    return render(request, 'auctions/listingclosed.html', {
        "listing": listing,
        "watchlist": watchlist['itemcount__sum'],
        "winner": winner,
        "allcomments": itemcomments
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)

            # Save the user id in the session
            request.session["id"] = User.objects.get(username=username).id

            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    request.session.clear()
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)

        # Save the user id in the session
        request.session["id"] = User.objects.get(username=username).id

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required(login_url='login')
def create(request):
    if request.method == 'POST':
        title = request.POST["title"]
        description = request.POST["description"]
        price = request.POST["bid"]
        imageurl = request.POST["imgurl"]
        category = request.POST["category"]
        
        listing = Listing(title=title, description=description, price=price, imageurl=imageurl, category=category.capitalize(), creator=User.objects.get(id=request.session["id"]))
        listing.save()
        return HttpResponseRedirect(reverse("index"))
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount")) 
    return render(request, "auctions/createlisting.html", {
        "watchlist": watchlist['itemcount__sum']
    })

@login_required(login_url='login')
def listing(request, id):
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))
    listing = Listing.objects.get(id=id)
    itemprice = listing.price
    w_items = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"]))
    temp = [] 
    # Get the comments if object has been commented on
    try:
        itemcomments = Comments.objects.filter(listing=listing)
    except ObjectDoesNotExist:
        itemcomments = None
                
    # have all objects in a list
    for item in w_items:
        temp.append(item.item)

    try:
        bid = Bids.objects.get(item=listing)
        bidcount = bid.bidcount
        minbid = itemprice + 1
    except ObjectDoesNotExist:
        bidcount = '0'
        minbid = itemprice

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "bidcount": bidcount,
        "watchlist": watchlist['itemcount__sum'],
        "w_items" : temp,
        "minbid": minbid,
        "allcomments": itemcomments
    })

@login_required(login_url='login')
def comment(request, id):

    """ Adds comment """
    if request.POST["comment"]:
        comment = Comments(commenter=User.objects.get(id=request.session["id"]), 
                listing=Listing.objects.get(id=id), comment=request.POST["comment"])
        comment.save()
        return HttpResponseRedirect(reverse("listing", args=(id,)))
    else:
        return render(request, "auctions/test.html", {
            "text": "Enter text in the comment field!"
        })


@login_required(login_url="login")
def bid(request, id):
    item = Listing.objects.get(id=id)

    # verifying if the user input an empty number
    if request.POST["bid"]:
        userbid = int(request.POST["bid"])
        user = User.objects.get(id=request.session["id"])
        # if there is already an entry in the Bids table
        try:
            biditem = Bids.objects.get(item=item)

            # update the price
            item.price = userbid
            item.save()
            # update the bidcount
            biditem.bidcount += 1
            biditem.save()
            # update the bidder
            biditem.bidder = user
            biditem.save()

            return HttpResponseRedirect(reverse('listing', args=(id,)))

        except ObjectDoesNotExist:
            # insert an entry in Bids
            entry = Bids(item=item, bidder=user, bidcount=1)
            entry.save()
            return HttpResponseRedirect(reverse('listing', args=(id,)))

    else:
        return render(request, "auctions/test.html", {
                    "text": "Input bid!"
                })

@login_required(login_url='login') 
def watchlist(request):
    items = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"]))
    watchlist = items.aggregate(Sum("itemcount"))
    return render(request, "auctions/watchlist.html", {
        "items": items,
        "watchlist": watchlist['itemcount__sum']
    })  

@login_required(login_url='login')
def add_w(request, id):
    # add an item to the watchlist
    user = User.objects.get(id=request.session["id"])
    item = Listing.objects.get(id=id)
    itemcount = 1

    watchlist = Watchlist(user=user, item=item, itemcount=itemcount)
    watchlist.save()

    return HttpResponseRedirect(reverse("listing", args=(id,)))

@login_required(login_url='login')
def del_w(request, id):
    # remove an item from the watchlist
    item = Watchlist.objects.get(item=Listing.objects.get(id=id), user=User.objects.get(id=request.session["id"]))
    item.delete()
    return HttpResponseRedirect(reverse("listing", args=(id,)))

@login_required(login_url="login")
def close(request, id):
    # make an item inactive

    item = Listing.objects.get(id=id)
    item.active = False
    item.save()
    return HttpResponseRedirect(reverse('index'))

@login_required(login_url='login')
def categories(request):
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))

    """ Get all categories """
    cats = []
    listings = Listing.objects.all()
    size = len(listings)
    """ Loop through the categories """

    for i in range(size):
        j = i + 1
        if not j == size:
            category = listings[i].category
            next_category = listings[j].category
            if not category == next_category and not category in cats:
                # append the category
                cats.append(category)
        else:
            continue

    return render(request, 'auctions/categories.html', {
        "categories": cats,
        "watchlist": watchlist['itemcount__sum']
    })

@login_required(login_url='login')
def category(request, category):
    watchlist = Watchlist.objects.filter(user=User.objects.get(id=request.session["id"])).aggregate(Sum("itemcount"))

    """ Search for listings in a certain category """

    items = Listing.objects.filter(category=category)
    return render(request, 'auctions/category.html', {
        "items": items,
        "watchlist": watchlist['itemcount__sum']
    })