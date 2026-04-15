from django.db import models
from django.conf import settings


class Session(models.Model):
    """A session created by a Creator that users can book."""

    CATEGORY_CHOICES = [
        ('technology', 'Technology'),
        ('business', 'Business'),
        ('design', 'Design'),
        ('marketing', 'Marketing'),
        ('health', 'Health & Wellness'),
        ('education', 'Education'),
        ('finance', 'Finance'),
        ('arts', 'Arts & Culture'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    date_time = models.DateTimeField()
    duration = models.IntegerField(help_text='Duration in minutes')
    capacity = models.IntegerField(default=10)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.URLField(max_length=500, blank=True, default='')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sessions'
        ordering = ['-date_time']

    def __str__(self):
        return self.title

    @property
    def spots_left(self):
        booked = self.bookings.filter(status='active').count()
        return max(0, self.capacity - booked)

    @property
    def is_fully_booked(self):
        return self.spots_left == 0
