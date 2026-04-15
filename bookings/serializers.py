from rest_framework import serializers
from .models import Booking
from sessions_app.serializers import SessionListSerializer


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for booking data with session details."""
    session_detail = SessionListSerializer(source='session', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'session', 'session_detail', 'status', 'booked_at', 'updated_at']
        read_only_fields = ['id', 'status', 'booked_at', 'updated_at']


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a booking."""

    class Meta:
        model = Booking
        fields = ['session']

    def validate_session(self, value):
        if value.status != 'active':
            raise serializers.ValidationError("This session is not available for booking.")
        if value.is_fully_booked:
            raise serializers.ValidationError("This session is fully booked.")
        return value

    def validate(self, data):
        user = self.context['request'].user
        session = data['session']

        if session.creator == user:
            raise serializers.ValidationError("You cannot book your own session.")

        if Booking.objects.filter(user=user, session=session, status='active').exists():
            raise serializers.ValidationError("You have already booked this session.")

        return data


class CreatorBookingSerializer(serializers.ModelSerializer):
    """Serializer for creator to view bookings on their sessions."""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    session_title = serializers.CharField(source='session.title', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'user_name', 'user_email', 'user_avatar',
            'session', 'session_title', 'status', 'booked_at',
        ]

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
