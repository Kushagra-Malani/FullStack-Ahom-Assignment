from django.contrib import admin
from .models import Session


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'creator', 'category', 'date_time', 'price', 'capacity', 'status']
    list_filter = ['category', 'status']
    search_fields = ['title', 'description']
