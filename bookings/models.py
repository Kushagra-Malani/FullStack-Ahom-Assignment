from django.db import models
from django.conf import settings


class Booking(models.Model):
    """A booking made by a User for a Session."""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    session = models.ForeignKey(
        'sessions_app.Session',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    booked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'
        ordering = ['-booked_at']
        unique_together = ['user', 'session']

    def __str__(self):
        return f"{self.user.username} → {self.session.title}"
