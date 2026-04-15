from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer, CreatorBookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """User bookings — create, list, and cancel."""
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return BookingCreateSerializer
        return BookingSerializer

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('session', 'session__creator').order_by('-booked_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a booking."""
        booking = self.get_object()
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data)

    def list(self, request, *args, **kwargs):
        """List bookings with optional status filter."""
        queryset = self.get_queryset()
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CreatorBookingViewSet(viewsets.ReadOnlyModelViewSet):
    """Bookings on creator's sessions — read-only for the creator."""
    serializer_class = CreatorBookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            session__creator=self.request.user
        ).select_related('user', 'session').order_by('-booked_at')
