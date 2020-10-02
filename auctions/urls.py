from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create, name="create"),
    path("<int:id>", views.listing, name="listing"),
    path("<int:id>/closed", views.listingclosed, name="listingclosed"),
    path("<int:id>/comment", views.comment, name="comment"),
    path("add/<int:id>", views.add_w, name="addwatch"),
    path("delete/<int:id>", views.del_w, name="delwatch"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("bid/<int:id>", views.bid, name="bid"),
    path("close/<int:id>", views.close, name="close"),
    path("wonlistings", views.wonlistings, name="wonlistings"), 
    path("categories", views.categories, name="categories"),
    path("categories/<str:category>", views.category, name="category")
]
