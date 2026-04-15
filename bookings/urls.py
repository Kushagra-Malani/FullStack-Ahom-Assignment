from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.BookingViewSet, basename='booking')

creator_router = DefaultRouter()
creator_router.register(r'', views.CreatorBookingViewSet, basename='creator-booking')

urlpatterns = [
    path('creator/', include(creator_router.urls)),
    path('', include(router.urls)),
]
