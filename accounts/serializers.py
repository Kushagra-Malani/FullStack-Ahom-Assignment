from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'role', 'avatar', 'bio', 'provider', 'date_joined']
        read_only_fields = ['id', 'username', 'email', 'provider', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar', 'bio', 'role']

    def validate_role(self, value):
        if value not in ['user', 'creator']:
            raise serializers.ValidationError("Role must be 'user' or 'creator'.")
        return value


class AuthResponseSerializer(serializers.Serializer):
    """Serializer for auth response with tokens."""
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
