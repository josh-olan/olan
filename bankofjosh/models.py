from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):

    is_setup = models.BooleanField(default=False)
    question = models.CharField(max_length=50)
    answer = models.CharField(max_length=50)

    def __str__(self):
        return self.username


class Saving(models.Model):
        
    """ Only one entry per user """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="has_savings")
    account_number = models.IntegerField(unique=True)
    sort_code = models.IntegerField(default=200000)
    balance = models.FloatField(default=5000.00)
    account_type = models.CharField(default="savings", editable=False, max_length=20)

    def __str__(self):
        return f"Acct-{self.account_number}, Sort-{self.sort_code}"


class Current(models.Model):
        
    """ Only one entry per user """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="has_current")
    account_number = models.IntegerField(unique=True)
    sort_code = models.IntegerField(default=200000)
    balance = models.FloatField(default=5000.00)
    account_type = models.CharField(default="current", editable=False, max_length=20)

    def __str__(self):
        return f"Acct-{self.account_number}, Sort-{self.sort_code}"


class Help_To_Buy(models.Model):

    """ Only one entry per user """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="has_htb")
    account_number = models.IntegerField(unique=True)
    sort_code = models.IntegerField(default=200000)
    balance = models.FloatField(default=5000.00)
    account_type = models.CharField(default="help-to-buy", editable=False, max_length=20)

    def __str__(self):
        return f"Acct-{self.account_number}, Sort-{self.sort_code}"


class Trading(models.Model):
    
    """ Stores trading account information """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="trading_account")
    balance = models.FloatField(default=0.00)
    account_type = models.CharField(default="trading", editable=False, max_length=20)

    def __str__(self):
        return f"{self.user.username}, balance-{self.balance}"
        

class Trades(models.Model):

    """ Stores user's trades """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="get_trades")
    symbol = models.CharField(max_length=20)
    company_name = models.CharField(max_length=70)
    purchase_price = models.FloatField()
    sell_price = models.FloatField(default=0.00)
    shares = models.IntegerField(default=1)
    active = models.BooleanField(default=True)
    total_in_dollars = models.FloatField(default=0.00)
    when = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}; {self.symbol}, {self.shares} - {self.active}"


class Watchlist(models.Model):

    """ Stores stocks in the watchlist """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="get_watchlist_stocks")
    symbol = models.CharField(max_length=20)
    company_name = models.CharField(max_length=70)
    when = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} is watching {self.symbol}"


class Transaction(models.Model):
        
    """ All transactions """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="transactions")
    from_or_to = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    account_type = models.CharField(max_length=15)
    action = models.BooleanField(default=False)
    description = models.CharField(max_length=15)
    when = models.DateTimeField(auto_now=True)
    bal_after_trans = models.FloatField()
    amount = models.FloatField()

    def __str__(self):
        if self.action == False:
            return f"{self.user.username} sent {self.amount}"
        else:
            return f"{self.user.username} received {self.amount}"
