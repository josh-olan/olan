from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required


from .models import User, Post, Follower, Like

@login_required(login_url="login")
def index(request):
    return render(request, "network/index.html")

@login_required(login_url="login")
def load_following_page(request):
    return render(request, "network/following.html")

#@csrf_exempt
def edit(request):

    """ Edit existing posts """
    if request.method == 'PUT':

        # Update post content
        data = json.loads(request.body)
        post_id = data.get("post_id")
        post_content = data.get("post_content")

        post = Post.objects.get(id=post_id)
        post.post = post_content
        post.save()

        # Return new post content
        return JsonResponse({"content" : post.post })
    else:
        return JsonResponse({"error": "Request method must be PUT!"})

#@csrf_exempt
def like(request):

    """ For all liking functions """

    if request.method == 'PUT':

        data = json.loads(request.body)
        post_id = data.get("post_id")
        action = data.get("action")
        post = Post.objects.get(id=post_id)
        liker = User.objects.get(id=request.session["id"])

        if action == 'like':

            # Like the post

            like = Like(post=post, liker=liker)
            like.save()

        else:

            # Unlike the post
            unlike = Like.objects.get(post=post, liker=liker)
            unlike.delete()

        new_likes_count = post.likes.all().count()

        return JsonResponse({"likes_count": new_likes_count})

    else:
        return JsonResponse({"error": "Request method must be PUT!"})


def following_page(request, pagenumber):

    """ Posts of users the current user follows """

    current_user = User.objects.get(id=request.session["id"])
    followers = current_user.isfollowing.all()
    temp = []

    # Get all the users the user follows
    for follower in followers:
        temp.append(follower.followed)

    # Get all posts
    posts = Post.objects.filter(poster__in=temp).order_by("-posttime")
    current_user = User.objects.get(id=request.session["id"])
    allPosts = []

    for post in posts:
        likes_count = post.likes.all().count()

        # Check if current user has liked a post
        try:
            liked = Like.objects.get(post=post, liker=current_user)
            liked = True
        except ObjectDoesNotExist:
            liked = False

        p = {
            "liked": liked,
            "likes_count": likes_count,
            "post_id": post.id,
            "current_user": User.objects.get(id=request.session["id"]).username,
            "poster": post.poster.username,
            "post": post.post,
            "time": post.posttime.strftime("%I:%M%p - %d %b, %Y.")
        }
        allPosts.append(p)

    p = Paginator(allPosts, 10)
    page = p.page(pagenumber) 
    
    temp = []
    temp.append(page.object_list)
    temp.append({"has_next": page.has_next()})
    temp.append({"has_previous" : page.has_previous()})    
        
    return JsonResponse({"posts" : temp})


#@csrf_exempt
def post(request):

    """ Gets new post from the user and inputs in the db """

    data = json.loads(request.body)
    post = data.get("post")

    # Insert into db
    new_post = Post(
        poster=User.objects.get(id=request.session["id"]),
        post=post
    )
    new_post.save()

    # Get all posts
    posts = Post.objects.all().order_by("-posttime")
    allPosts = []
    for post in posts:
        p = {
            "current_user": User.objects.get(id=request.session["id"]).username,
            "poster": post.poster.username,
            "post": post.post,
            "time": post.posttime.strftime("%I:%M%p - %d %b, %Y.")
        }
        allPosts.append(p)
        
    return JsonResponse({"posts" : allPosts})

def load_posts(request, pagenumber):

    """ Returns all posts """

    posts = Post.objects.all().order_by("-posttime")
    current_user = User.objects.get(id=request.session["id"])
    allPosts = []

    for post in posts:
        likes_count = post.likes.all().count()

        # Check if current user has liked a post
        try:
            liked = Like.objects.get(post=post, liker=current_user)
            liked = True
        except ObjectDoesNotExist:
            liked = False

        p = {
            "liked": liked,
            "likes_count": likes_count,
            "post_id": post.id,
            "current_user": current_user.username,
            "poster": post.poster.username,
            "post": post.post,
            "time": post.posttime.strftime("%I:%M%p - %d %b, %Y.")
        }
        allPosts.append(p)

    p = Paginator(allPosts, 10)
    page = p.page(pagenumber) 
    
    temp = []
    temp.append(page.object_list)
    temp.append({"has_next": page.has_next()})
    temp.append({"has_previous" : page.has_previous()})

    return JsonResponse({"posts" : temp})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)

            # Get the user's id
            userid = User.objects.get(username=username)
            request.session["id"] = userid.id

            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    request.session.clear()
    return HttpResponseRedirect(reverse("login"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)

        # Get the user's id
        userid = User.objects.get(username=username)
        request.session["id"] = userid.id

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

def profile(request, username):

    """ Loads the Profile page """
    user = User.objects.get(id=request.session["id"])
    return render(request, "network/profile.html", {
        "user_clicked": username,
        "current_user": user.username
    })

def profile_page(request, username, pagenumber):

    """ Loads the Json elements """

    user = User.objects.get(username=username)

    # Check for the followers and following count
    followers_count = user.followers.all().count() 
    following_count = user.isfollowing.all().count()

    allPosts = Post.objects.filter(poster=User.objects.get(username=username)).order_by("-posttime")
    current_user = User.objects.get(id=request.session["id"])
    posts = []

    for post in allPosts:
        likes_count = post.likes.all().count()

        # Check if current user has liked a post
        try:
            liked = Like.objects.get(post=post, liker=current_user)
            liked = True
        except ObjectDoesNotExist:
            liked = False

        p = {
            "liked": liked,
            "likes_count":likes_count,
            "post_id": post.id,
            "current_user": current_user.username,
            "post": post.post,
            "time": post.posttime.strftime("%I:%M%p - %d %b, %Y.")
        }
        posts.append(p)
    
    # Check if the current user follows the clicked user
    try:
        if_follow = Follower.objects.get(follower=User.objects.get(id=request.session["id"]), 
                    followed=User.objects.get(username=username))
        follows = True
    except ObjectDoesNotExist:
        follows = False

    p = Paginator(posts, 10)
    page = p.page(pagenumber) 
    
    temp = []
    temp.append(page.object_list)
    temp.append({"has_next": page.has_next()})
    temp.append({"has_previous" : page.has_previous()})

    return JsonResponse({
        "followers": followers_count,
        "following": following_count,
        "posts": temp,
        "follows": follows
    })

def follow(request):

    """ Follow another user """

    if request.method == 'PUT':

        data = json.loads(request.body)
        username = data.get("username")
        user_viewed = User.objects.get(username=username)
        action = data.get("action")

        if action == 'follow':

            # Follow a user
            follow = Follower(follower=User.objects.get(id=request.session["id"]), followed=user_viewed)
            follow.save()

            followers_count = user_viewed.followers.all().count() 
            following_count = user_viewed.isfollowing.all().count()

            return JsonResponse({
                "followers": followers_count,
                "following": following_count,
                "message": "Followed!"
            })

        else: 

            # Unfollow a user
            unfollow = Follower.objects.get(follower=User.objects.get(id=request.session["id"]), 
                                        followed=user_viewed)
            unfollow.delete()

            followers_count = user_viewed.followers.all().count() 
            following_count = user_viewed.isfollowing.all().count()

            return JsonResponse({
                "followers": followers_count,
                "following": following_count,
                "message": "User unfollowed!"
            })

    else:
        return JsonResponse({"error": "Request method must be PUT!"})