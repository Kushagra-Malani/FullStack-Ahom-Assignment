from django.urls import path
from . import views

urlpatterns = [
    path('github/', views.GitHubOAuthView.as_view(), name='github-oauth'),
    path('google/', views.GoogleOAuthView.as_view(), name='google-oauth'),
    path('demo-login/', views.DemoLoginView.as_view(), name='demo-login'),
    path('me/', views.ProfileView.as_view(), name='profile'),
    path('refresh/', views.RefreshTokenView.as_view(), name='token-refresh'),
]
