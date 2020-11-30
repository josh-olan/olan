from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    background_color = models.CharField(max_length=17)


class Email(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="emails")
    sender = models.ForeignKey("User", on_delete=models.PROTECT, related_name="emails_sent")
    recipients = models.ManyToManyField("User", related_name="emails_received")
    subject = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "sender": self.sender.email,
            "sender_name": f"{self.sender.first_name} {self.sender.last_name}",
            "recipients_names": [f"{user.first_name} {user.last_name}" for user in self.recipients.all()],
            "recipients": [user.email for user in self.recipients.all()],
            "subject": self.subject,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%I:%M %p, %b %d %Y"),
            "read": self.read,
            "archived": self.archived,
            "background_color": self.sender.background_color
        }
