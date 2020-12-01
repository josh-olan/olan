from django.contrib import admin
from .models import User, Current, Help_To_Buy, Saving, Transaction, Trades, Trading, Watchlist

# Register your models here.
admin.site.register(User)
admin.site.register(Current)
admin.site.register(Saving)
admin.site.register(Help_To_Buy)
admin.site.register(Transaction)
admin.site.register(Trades)
admin.site.register(Trading)
admin.site.register(Watchlist)