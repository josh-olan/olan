from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"

class Listing(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=80)
    price = models.IntegerField()
    imageurl = models.URLField(blank=True)
    category = models.CharField(max_length=64, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lister")
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} (ID- {self.id}) - {self.category}"

class Bids(models.Model):  
    item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="biditem")
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bidders")
    # amount of the bid: check updated price in Listing
    bidcount = models.IntegerField()

    def __str__(self):
        return f"{self.bidcount} bid(s) for {self.item} so far."

class Comments(models.Model):
    # who commented
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    # what listing
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    # comment made
    comment = models.TextField()

    def __str__(self):
        return f"{self.commenter.username} on {self.listing.title} : {self.comment}"

class Watchlist(models.Model):
    # the user id 
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    # the item id; foreign key of Listing
    item = models.ForeignKey(Listing, on_delete=models.CASCADE)
    itemcount = models.IntegerField(default=0)

    def __str__ (self):
        return f"{self.user.username} - {self.item.title}"
