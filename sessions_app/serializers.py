from rest_framework import serializers
from .models import Session
from accounts.serializers import UserSerializer


class SessionListSerializer(serializers.ModelSerializer):
    """Serializer for session list view (lightweight)."""
    creator_name = serializers.SerializerMethodField()
    creator_avatar = serializers.SerializerMethodField()
    spots_left = serializers.ReadOnlyField()
    is_fully_booked = serializers.ReadOnlyField()

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'description', 'date_time', 'duration',
            'capacity', 'price', 'image', 'category', 'status',
            'creator_name', 'creator_avatar', 'spots_left',
            'is_fully_booked', 'created_at',
        ]

    def get_creator_name(self, obj):
        return f"{obj.creator.first_name} {obj.creator.last_name}".strip() or obj.creator.username

    def get_creator_avatar(self, obj):
        return obj.creator.avatar


class SessionDetailSerializer(serializers.ModelSerializer):
    """Serializer for session detail view (full info)."""
    creator = UserSerializer(read_only=True)
    spots_left = serializers.ReadOnlyField()
    is_fully_booked = serializers.ReadOnlyField()
    total_bookings = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'description', 'date_time', 'duration',
            'capacity', 'price', 'image', 'category', 'status',
            'creator', 'spots_left', 'is_fully_booked',
            'total_bookings', 'created_at', 'updated_at',
        ]

    def get_total_bookings(self, obj):
        return obj.bookings.filter(status='active').count()


class SessionCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sessions."""

    class Meta:
        model = Session
        fields = [
            'title', 'description', 'date_time', 'duration',
            'capacity', 'price', 'image', 'category', 'status',
        ]

    def validate_duration(self, value):
        if value < 15:
            raise serializers.ValidationError("Duration must be at least 15 minutes.")
        return value

    def validate_capacity(self, value):
        if value < 1:
            raise serializers.ValidationError("Capacity must be at least 1.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        return value
