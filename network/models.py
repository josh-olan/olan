from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass 

    def __str__(self):
        return f"{self.username}"


class Post(models.Model):
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    post = models.TextField(blank=False, null=False)
    posttime = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.poster} posted {self.post} at {self.posttime}"

class Follower(models.Model):
    # Who the user is
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="isfollowing")
    # Who the user follows
    followed = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers")

    def __str__(self):
        return f"{self.follower} is following {self.followed}"

class Like(models.Model):
    # The post
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    # Who liked the post
    liker = models.ForeignKey(User, on_delete=models.CASCADE, related_name="liked_posts")

    def __str__(self):
        return f"{self.liker} likes {self.post.post}"