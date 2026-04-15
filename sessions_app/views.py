from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Session
from .serializers import (
    SessionListSerializer,
    SessionDetailSerializer,
    SessionCreateUpdateSerializer,
)


class IsCreator(permissions.BasePermission):
    """Only allow users with 'creator' role."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'creator'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only allow the creator of a session to edit/delete it."""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.creator == request.user


class SessionViewSet(viewsets.ModelViewSet):
    """
    Public catalog of sessions.
    - GET list/detail: anyone
    - POST: creators only
    - PUT/PATCH/DELETE: session owner only
    """
    queryset = Session.objects.filter(status='active').select_related('creator')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['date_time', 'price', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SessionListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return SessionCreateUpdateSerializer
        return SessionDetailSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [IsCreator()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs


class CreatorSessionViewSet(viewsets.ModelViewSet):
    """Creator's own sessions — full CRUD including cancelled/completed."""
    serializer_class = SessionDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsCreator]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SessionCreateUpdateSerializer
        return SessionDetailSerializer

    def get_queryset(self):
        return Session.objects.filter(
            creator=self.request.user
        ).select_related('creator').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
