import requests
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, UserUpdateSerializer


class GitHubOAuthView(APIView):
    """Handle GitHub OAuth callback — exchange code for user + JWT."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Exchange code for access token
        token_response = requests.post(
            'https://github.com/login/oauth/access_token',
            data={
                'client_id': settings.GITHUB_CLIENT_ID,
                'client_secret': settings.GITHUB_CLIENT_SECRET,
                'code': code,
            },
            headers={'Accept': 'application/json'},
            timeout=10,
        )

        if token_response.status_code != 200:
            return Response(
                {'error': 'Failed to obtain access token from GitHub'},
                status=status.HTTP_400_BAD_REQUEST
            )

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return Response(
                {'error': token_data.get('error_description', 'Failed to get access token')},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch user info from GitHub
        user_response = requests.get(
            'https://api.github.com/user',
            headers={
                'Authorization': f'Bearer {access_token}',
                'Accept': 'application/json',
            },
            timeout=10,
        )

        if user_response.status_code != 200:
            return Response(
                {'error': 'Failed to fetch user info from GitHub'},
                status=status.HTTP_400_BAD_REQUEST
            )

        github_user = user_response.json()

        # Fetch email if not public
        email = github_user.get('email')
        if not email:
            emails_response = requests.get(
                'https://api.github.com/user/emails',
                headers={
                    'Authorization': f'Bearer {access_token}',
                    'Accept': 'application/json',
                },
                timeout=10,
            )
            if emails_response.status_code == 200:
                emails = emails_response.json()
                primary = next((e for e in emails if e.get('primary')), None)
                email = primary['email'] if primary else emails[0]['email']

        # Find or create user
        github_id = str(github_user['id'])
        try:
            user = User.objects.get(provider='github', provider_id=github_id)
            # Update avatar on each login
            user.avatar = github_user.get('avatar_url', '')
            user.save(update_fields=['avatar'])
        except User.DoesNotExist:
            username = github_user.get('login', f'github_{github_id}')
            # Ensure unique username
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            name = github_user.get('name', '') or ''
            parts = name.split(' ', 1)
            first_name = parts[0] if parts else ''
            last_name = parts[1] if len(parts) > 1 else ''

            user = User.objects.create(
                username=username,
                email=email or f'{username}@github.local',
                first_name=first_name,
                last_name=last_name,
                avatar=github_user.get('avatar_url', ''),
                bio=github_user.get('bio', '') or '',
                provider='github',
                provider_id=github_id,
                role='user',
            )

        # Issue JWT
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['username'] = user.username

        serializer = UserSerializer(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serializer.data,
        })


class GoogleOAuthView(APIView):
    """Handle Google OAuth callback — exchange code for user + JWT."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri', getattr(settings, 'FRONTEND_URL', 'http://localhost:5173') + '/login')
        
        if not code:
            return Response({'error': 'Authorization code is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Exchange code for access token
        token_response = requests.post(
            'https://oauth2.googleapis.com/token',
            data={
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': redirect_uri,
            },
            timeout=10,
        )

        if token_response.status_code != 200:
            return Response({'error': 'Failed to obtain access token from Google'}, status=status.HTTP_400_BAD_REQUEST)

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return Response({'error': 'Failed to get access token from Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch user info
        user_response = requests.get(
            'https://www.googleapis.com/oauth2/v1/userinfo',
            headers={'Authorization': f'Bearer {access_token}', 'Accept': 'application/json'},
            timeout=10,
        )

        if user_response.status_code != 200:
            return Response({'error': 'Failed to fetch user info from Google'}, status=status.HTTP_400_BAD_REQUEST)

        google_user = user_response.json()
        google_id = str(google_user['id'])
        email = google_user.get('email', f'google_{google_id}@google.local')
        
        # Find or create user
        try:
            user = User.objects.get(provider='google', provider_id=google_id)
            user.avatar = google_user.get('picture', '')
            user.save(update_fields=['avatar'])
        except User.DoesNotExist:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User.objects.create(
                username=username,
                email=email,
                first_name=google_user.get('given_name', ''),
                last_name=google_user.get('family_name', ''),
                avatar=google_user.get('picture', ''),
                provider='google',
                provider_id=google_id,
                role='user',
            )

        # Issue JWT
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['username'] = user.username

        serializer = UserSerializer(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serializer.data,
        })


class DemoLoginView(APIView):
    """Demo login for testing without OAuth credentials.
    Creates/retrieves a demo user and issues JWT."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        role = request.data.get('role', 'user')
        if role not in ['user', 'creator']:
            role = 'user'

        username = f'demo_{role}'
        email = f'demo_{role}@sessions.local'

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'first_name': 'Demo',
                'last_name': role.capitalize(),
                'role': role,
                'provider': 'local',
                'avatar': '',
                'bio': f'This is a demo {role} account for testing.',
            }
        )

        if not created:
            user.role = role
            user.save(update_fields=['role'])

        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['username'] = user.username

        serializer = UserSerializer(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': serializer.data,
        })


class ProfileView(APIView):
    """Get or update the current user's profile."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class RefreshTokenView(APIView):
    """Refresh JWT access token."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'Refresh token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            refresh = RefreshToken(refresh_token)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        except Exception:
            return Response(
                {'error': 'Invalid refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
