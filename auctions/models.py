from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"


class Listing(models.Model):
    """
    Details about each listing
    """
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=80)
    price = models.IntegerField()
    imageurl = models.URLField(blank=True)
    category = models.CharField(max_length=64, blank=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lister")
    active = models.BooleanField(default=True)
    when_added = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.title} (ID- {self.id}) - {self.category}"


class Bids(models.Model): 
    """
    Bids made on items
    """
    item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="biditem")
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bidders")
    bidcount = models.IntegerField()

    def __str__(self):
        return f"{self.bidcount} bid(s) for {self.item} so far."


class Comments(models.Model):
    """
    Comments made on listings
    """
    commenter = models.ForeignKey(User, on_delete=models.CASCADE)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE)
    comment = models.TextField()
    when = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.commenter.username} on {self.listing.title} : {self.comment}"


class Watchlist(models.Model):
    """
    Listings in the watchlist of each user
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user")
    item = models.ForeignKey(Listing, on_delete=models.CASCADE)
    itemcount = models.IntegerField(default=0)

    def __str__ (self):
        return f"{self.user.username} - {self.item.title}"
