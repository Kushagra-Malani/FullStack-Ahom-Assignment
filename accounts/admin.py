from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email', 'role', 'provider', 'date_joined']
    list_filter = ['role', 'provider']
    search_fields = ['username', 'email']
