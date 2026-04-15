from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model with OAuth and role support."""

    ROLE_CHOICES = [
        ('user', 'User'),
        ('creator', 'Creator'),
    ]

    PROVIDER_CHOICES = [
        ('github', 'GitHub'),
        ('google', 'Google'),
        ('local', 'Local'),
    ]

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.URLField(max_length=500, blank=True, default='')
    bio = models.TextField(max_length=500, blank=True, default='')
    provider = models.CharField(max_length=10, choices=PROVIDER_CHOICES, default='local')
    provider_id = models.CharField(max_length=255, blank=True, default='')

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.role})"

    @property
    def is_creator(self):
        return self.role == 'creator'
