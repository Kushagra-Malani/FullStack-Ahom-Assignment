from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from sessions_app.models import Session
from bookings.models import Booking


class Command(BaseCommand):
    help = 'Seed the database with sample data for development'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database...')

        # Create creators
        creator1, _ = User.objects.get_or_create(
            username='sarah_tech',
            defaults={
                'email': 'sarah@example.com',
                'first_name': 'Sarah',
                'last_name': 'Johnson',
                'role': 'creator',
                'provider': 'local',
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                'bio': 'Senior software engineer with 10+ years of experience. Passionate about teaching web development and cloud technologies.',
            }
        )

        creator2, _ = User.objects.get_or_create(
            username='alex_design',
            defaults={
                'email': 'alex@example.com',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'role': 'creator',
                'provider': 'local',
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
                'bio': 'UX/UI designer and design thinking facilitator. Helping teams build better products through great design.',
            }
        )

        creator3, _ = User.objects.get_or_create(
            username='priya_biz',
            defaults={
                'email': 'priya@example.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': 'creator',
                'provider': 'local',
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya',
                'bio': 'Business strategist and startup mentor. Former VP at a Fortune 500 company.',
            }
        )

        # Create regular users
        user1, _ = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'john@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'role': 'user',
                'provider': 'local',
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            }
        )

        user2, _ = User.objects.get_or_create(
            username='emily_chen',
            defaults={
                'email': 'emily@example.com',
                'first_name': 'Emily',
                'last_name': 'Chen',
                'role': 'user',
                'provider': 'local',
                'avatar': 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
            }
        )

        now = timezone.now()

        # Create sessions
        sessions_data = [
            {
                'title': 'Mastering React Hooks & State Management',
                'description': 'Deep dive into React Hooks — useState, useEffect, useContext, and custom hooks. Learn advanced patterns for state management including useReducer and how to avoid common pitfalls. We will build a real-time dashboard together.',
                'creator': creator1,
                'date_time': now + timedelta(days=3, hours=2),
                'duration': 90,
                'capacity': 30,
                'price': 49.99,
                'image': 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
                'category': 'technology',
            },
            {
                'title': 'Django REST Framework: From Zero to API',
                'description': 'Build production-ready REST APIs with Django. Covers serializers, viewsets, authentication, permissions, pagination, and testing. By the end, you will have a fully functional API with documentation.',
                'creator': creator1,
                'date_time': now + timedelta(days=5, hours=4),
                'duration': 120,
                'capacity': 25,
                'price': 59.99,
                'image': 'https://images.unsplash.com/photo-1515879218367-8466d910adef?w=800',
                'category': 'technology',
            },
            {
                'title': 'Design Systems That Scale',
                'description': 'Learn how to create and maintain design systems that grow with your product. We cover tokens, component libraries, documentation, and governance. Includes hands-on Figma workshop.',
                'creator': creator2,
                'date_time': now + timedelta(days=2, hours=1),
                'duration': 75,
                'capacity': 20,
                'price': 39.99,
                'image': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
                'category': 'design',
            },
            {
                'title': 'UX Research Methods for Product Teams',
                'description': 'Master user research techniques — interviews, usability testing, surveys, and analytics. Learn how to synthesize findings into actionable insights that drive product decisions.',
                'creator': creator2,
                'date_time': now + timedelta(days=7, hours=3),
                'duration': 60,
                'capacity': 15,
                'price': 34.99,
                'image': 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800',
                'category': 'design',
            },
            {
                'title': 'Startup Fundraising Masterclass',
                'description': 'Everything you need to know about raising your first round. Covers pitch decks, valuation, term sheets, investor relations, and common mistakes founders make.',
                'creator': creator3,
                'date_time': now + timedelta(days=4, hours=5),
                'duration': 90,
                'capacity': 40,
                'price': 79.99,
                'image': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
                'category': 'business',
            },
            {
                'title': 'Personal Finance for Tech Professionals',
                'description': 'Optimize your finances — stock options, tax strategies, investment portfolios, and retirement planning specifically tailored for tech industry professionals.',
                'creator': creator3,
                'date_time': now + timedelta(days=6, hours=2),
                'duration': 60,
                'capacity': 50,
                'price': 29.99,
                'image': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
                'category': 'finance',
            },
            {
                'title': 'Cloud Architecture with AWS',
                'description': 'Design scalable, resilient cloud architectures. Covers EC2, Lambda, S3, DynamoDB, API Gateway, and Infrastructure as Code with Terraform. Real-world case studies included.',
                'creator': creator1,
                'date_time': now + timedelta(days=8, hours=3),
                'duration': 120,
                'capacity': 20,
                'price': 69.99,
                'image': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
                'category': 'technology',
            },
            {
                'title': 'Mindfulness & Productivity for Developers',
                'description': 'Combat burnout and boost productivity with evidence-based mindfulness techniques. Learn focus strategies, deep work scheduling, and stress management tailored for developers.',
                'creator': creator2,
                'date_time': now + timedelta(days=1, hours=6),
                'duration': 45,
                'capacity': 35,
                'price': 19.99,
                'image': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
                'category': 'health',
            },
            {
                'title': 'Growth Marketing Strategies',
                'description': 'Data-driven marketing techniques for startups and scale-ups. Covers acquisition channels, conversion optimization, retention strategies, and growth experimentation frameworks.',
                'creator': creator3,
                'date_time': now + timedelta(days=9, hours=1),
                'duration': 90,
                'capacity': 30,
                'price': 54.99,
                'image': 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800',
                'category': 'marketing',
            },
            {
                'title': 'Introduction to Machine Learning',
                'description': 'Demystify ML concepts — supervised vs unsupervised learning, neural networks, model training, and deployment. Hands-on projects using Python and scikit-learn.',
                'creator': creator1,
                'date_time': now + timedelta(days=10, hours=4),
                'duration': 120,
                'capacity': 25,
                'price': 64.99,
                'image': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
                'category': 'technology',
            },
            {
                'title': 'Creative Problem Solving Workshop',
                'description': 'Structured creativity techniques for breakthrough solutions. Learn lateral thinking, design sprints, SCAMPER method, and collaborative ideation frameworks.',
                'creator': creator2,
                'date_time': now + timedelta(days=11, hours=2),
                'duration': 60,
                'capacity': 18,
                'price': 44.99,
                'image': 'https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?w=800',
                'category': 'education',
            },
            {
                'title': 'Building Your Personal Brand Online',
                'description': 'Stand out in the digital world. Covers content strategy, LinkedIn optimization, thought leadership, speaking opportunities, and monetizing your expertise.',
                'creator': creator3,
                'date_time': now + timedelta(days=12, hours=5),
                'duration': 75,
                'capacity': 45,
                'price': 24.99,
                'image': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
                'category': 'marketing',
            },
        ]

        created_sessions = []
        for data in sessions_data:
            session, created = Session.objects.get_or_create(
                title=data['title'],
                creator=data['creator'],
                defaults=data,
            )
            created_sessions.append(session)
            if created:
                self.stdout.write(f'  Created session: {session.title}')

        # Create some bookings
        bookings_data = [
            (user1, created_sessions[0]),
            (user1, created_sessions[2]),
            (user1, created_sessions[4]),
            (user2, created_sessions[0]),
            (user2, created_sessions[1]),
            (user2, created_sessions[7]),
        ]

        for user, session in bookings_data:
            booking, created = Booking.objects.get_or_create(
                user=user,
                session=session,
                defaults={'status': 'active'}
            )
            if created:
                self.stdout.write(f'  Created booking: {user.username} -> {session.title}')

        self.stdout.write(self.style.SUCCESS('Database seeded successfully!'))
