from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.db.models import Sum
import json
from django.db.models import Q

from .models import User, Listing, Bids, Watchlist, Comments

@login_required(login_url='login')
def index(request):
    """
    Renders the index template
    """
    listings = Listing.objects.filter(active=True)
    if request.method == 'POST':
        sort = request.POST["sort"]
        if sort == "ascending":
            listings = listings.order_by("price")
        elif sort == "descending":
            listings = listings.order_by("-price")
        elif sort == "oldest":
            listings = listings.order_by("id")
        else:
            listings = listings.order_by("-id")
    else:
        listings = listings.order_by("-id")

    return render(request, "auctions/index.html", {
        "listings" : listings,
        "watchlist": get_watchlist_count(request)
    })


def get_watchlist_count(request):
    """ 
    Returns the count of watchlist items
    """ 
    watchlist = Watchlist.objects.filter(
    user=User.objects.get(
        id=request.session["id"])
        ).aggregate(Sum("itemcount"))
    return watchlist['itemcount__sum']


def get_recommended(request):
    """
    Returns items recommended for the user
    """
    listings = Listing.objects.filter(active=True).values()
    return JsonResponse(list(listings), safe=False)


@login_required(login_url='login')
def wonlistings(request):
    """
    Renders won listings template
    """
    wonlistings = Bids.objects.filter(
        bidder=User.objects.get(
            id=request.session["id"]
            )
        )
    bid = []
    for listing in wonlistings:
        bid.append(listing)
    
    wonlistings = []
    for items in bid:
        if items.item.active == False:
            wonlistings.append(items.item)
    
    return render(request, "auctions/wonlistings.html", {
        "wonlistings": wonlistings,
        "watchlist": get_watchlist_count(request)
    })


def login_view(request):
    """
    Render the Login view
    """
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
    logout(request)
    return HttpResponseRedirect(reverse("login"))


def register(request):
    """
    Register a new user
    """
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        firstname = request.POST["firstname"]
        lastname = request.POST["lastname"]

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
            user.first_name = firstname
            user.last_name = lastname
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Please select another username."
            })
        login(request, user)

        # Save the user id in the session
        request.session["id"] = User.objects.get(username=username).id

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required(login_url='login')
def create(request):
    """
    Create a new lising
    """
    if request.method == 'POST':
        title = request.POST["title"]
        description = request.POST["description"]
        price = request.POST["bid"]
        imageurl = request.POST["imgurl"]
        category = request.POST["category"]
        
        listing = Listing(
            title=title, 
            description=description, 
            price=price, 
            imageurl=imageurl, 
            category=category, 
            creator=User.objects.get(id=request.session["id"]))
        listing.save()
        return HttpResponseRedirect(reverse("index"))

    return render(request, "auctions/createlisting.html", {
        "watchlist": get_watchlist_count(request)
    })


@login_required(login_url='login')
def listing(request, id):
    """
    Renders each listing's template
    """
    listing = Listing.objects.get(id=id)
    itemprice = listing.price
    w_items = Watchlist.objects.filter(
        user=User.objects.get(id=request.session["id"])
        )
    temp = [] 

    # Get the comments if object has been commented on
    try:
        itemcomments = Comments.objects.filter(listing=listing)
    except ObjectDoesNotExist:
        itemcomments = None
                
    # Have all objects in a list
    for item in w_items:
        temp.append(item.item)

    try:
        bid = Bids.objects.get(item=listing)
        bidcount = bid.bidcount
        minbid = itemprice + 1
    except ObjectDoesNotExist:
        bidcount = '0'
        minbid = itemprice
    
    try:
        winner = listing.biditem.all()[0].bidder
    except IndexError:
        winner = None

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "winner": winner,
        "bidcount": bidcount,
        "watchlist": get_watchlist_count(request),
        "w_items" : temp,
        "minbid": minbid,
        "allcomments": itemcomments
    })


@login_required(login_url='login')
def comment(request, id):
    """ 
    Adds comment 
    """
    if request.POST["comment"]:
        comment = Comments(commenter=User.objects.get(id=request.session["id"]), 
                listing=Listing.objects.get(id=id), comment=request.POST["comment"])
        comment.save()
        return HttpResponseRedirect(reverse("listing", args=(id,)))


@login_required(login_url="login")
def bid(request, id):
    """
    Bid on an item
    """
    item = Listing.objects.get(id=id)

    if request.POST["bid"]:
        userbid = int(request.POST["bid"])
        user = User.objects.get(id=request.session["id"])
        # if there is already an entry in the Bids table
        try:
            biditem = Bids.objects.get(item=item)

            # Update the price
            item.price = userbid
            item.save()
            # Update the bidcount
            biditem.bidcount += 1
            biditem.save()
            # Update the bidder
            biditem.bidder = user
            biditem.save()

            return HttpResponseRedirect(reverse('listing', args=(id,)))

        except ObjectDoesNotExist:
            # Insert an entry in Bids
            entry = Bids(item=item, bidder=user, bidcount=1)
            entry.save()
            return HttpResponseRedirect(reverse('listing', args=(id,)))
            

@login_required(login_url='login') 
def watchlist(request):
    """
    Renders the watchlist template
    """
    items = Watchlist.objects.filter(
        user=User.objects.get(id=request.session["id"])
        )
    return render(request, "auctions/watchlist.html", {
        "items": items,
        "watchlist": get_watchlist_count(request)
    })  


@login_required(login_url='login')
def add_w(request, id):
    
    """
    Adds an item to the watchlist
    """
    user = User.objects.get(id=request.session["id"])
    item = Listing.objects.get(id=id)
    itemcount = 1

    watchlist = Watchlist(
                user=user, 
                item=item, 
                itemcount=itemcount
                )
    watchlist.save()

    return HttpResponseRedirect(reverse("listing", args=(id,)))


@login_required(login_url='login')
def del_w(request, id):
    """
    Remove an item from the watchlist
    """
    item = Watchlist.objects.get(
        item=Listing.objects.get(id=id), 
        user=User.objects.get(id=request.session["id"])
        )
    item.delete()
    return HttpResponseRedirect(reverse("listing", args=(id,)))


@login_required(login_url="login")
def close(request, id):
    """
    Close a listing
    """
    item = Listing.objects.get(id=id)
    item.active = False
    item.save()
    return HttpResponseRedirect(reverse("index"))


@login_required(login_url='login')
def categories(request):
    """ 
    Get all categories 
    """
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
                # Append the category
                cats.append(category)
        else:
            continue

    return render(request, 'auctions/categories.html', {
        "categories": cats,
        "watchlist": get_watchlist_count(request)
    })


@login_required(login_url='login')
def category(request, category):

    """ 
    Search for listings in a certain category 
    """
    watchlist = Watchlist.objects.filter(
        user=User.objects.get(id=request.session["id"])
        ).aggregate(Sum("itemcount"))

    items = Listing.objects.filter(category=category, active=True)

    return render(request, 'auctions/category.html', {
        "category": category,
        "items": items,
        "watchlist": watchlist['itemcount__sum']
    })


@login_required(login_url="login")
def get_category_items(request, category):
    """
    Returns items in a category in Json format
    """
    items = Listing.objects.filter(category=category, active=True)
    return JsonResponse(list(items.values()), safe=False)


@require_POST
@login_required(login_url='login')
def search(request):
    """
    Search listings
    """
    data = json.loads(request.body)
    parameter = data.get("parameter")
    # Check if parameter in title or description
    items = Listing.objects.filter(
        Q(title__contains=parameter) | Q(description__contains=parameter)
        , active=True).values()
    return JsonResponse(list(items), safe=False)
