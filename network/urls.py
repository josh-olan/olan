
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user/<str:username>", views.profile, name="profile"),
    path("load/following", views.load_following_page, name="load_following_page"),

    path("edit", views.edit, name="edit"),
    path("like", views.like, name="like"),
    path("follow", views.follow, name="follow"),
    path("user/profile/<str:username>/<int:pagenumber>", views.profile_page, name="profile-page"),
    path("loadposts/<int:pagenumber>", views.load_posts, name="loadposts"),
    path("following/<int:pagenumber>", views.following_page, name="following_page"),
    path("post", views.post, name="post")
]
