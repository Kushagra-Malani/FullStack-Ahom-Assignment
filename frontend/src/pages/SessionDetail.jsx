import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI, bookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, addToast } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const res = await sessionsAPI.get(id);
      setSession(res.data);
    } catch (err) {
      addToast('Session not found', 'error');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBooking(true);
    try {
      await bookingsAPI.create(session.id);
      addToast('Session booked successfully!');
      loadSession(); // Refresh spots
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        const firstError = Object.values(msg).flat()[0];
        addToast(typeof firstError === 'string' ? firstError : 'Booking failed', 'error');
      } else {
        addToast('Booking failed', 'error');
      }
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (!session) return null;

  const creator = session.creator;
  const isOwnSession = user?.id === creator?.id;

  return (
    <div className="session-detail animate-fade-in-up">
      <div className="session-detail-hero">
        <img
          src={session.image || FALLBACK_IMAGE}
          alt={session.title}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="session-detail-hero-overlay" />
      </div>

      <div className="session-detail-content">
        <div className="session-detail-main">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="filter-chip active" style={{ cursor: 'default' }}>
              {session.category}
            </span>
            <span className="status-badge active">{session.status}</span>
          </div>

          <h1>{session.title}</h1>
          <p className="description">{session.description}</p>

          {creator && (
            <div className="session-detail-creator">
              <img
                src={creator.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${creator.username}`}
                alt={creator.username}
              />
              <div className="session-detail-creator-info">
                <h3>{creator.first_name} {creator.last_name}</h3>
                <p>@{creator.username} &middot; {creator.role}</p>
              </div>
            </div>
          )}
        </div>

        <div className="session-detail-sidebar">
          <div className="booking-card">
            <div className="booking-card-price">
              {Number(session.price) === 0 ? (
                'Free'
              ) : (
                <>${Number(session.price).toFixed(2)} <small>per seat</small></>
              )}
            </div>

            <div className="booking-card-details">
              <div className="booking-card-detail">
                <span className="label">Date</span>
                <span className="value">{formatDate(session.date_time)}</span>
              </div>
              <div className="booking-card-detail">
                <span className="label">Time</span>
                <span className="value">{formatTime(session.date_time)}</span>
              </div>
              <div className="booking-card-detail">
                <span className="label">Duration</span>
                <span className="value">{session.duration} minutes</span>
              </div>
              <div className="booking-card-detail">
                <span className="label">Capacity</span>
                <span className="value">{session.capacity} seats</span>
              </div>
              <div className="booking-card-detail">
                <span className="label">Available</span>
                <span className="value" style={{ color: session.is_fully_booked ? 'var(--accent-danger)' : 'var(--accent-success)' }}>
                  {session.is_fully_booked ? 'Sold Out' : `${session.spots_left} spots left`}
                </span>
              </div>
              <div className="booking-card-detail">
                <span className="label">Bookings</span>
                <span className="value">{session.total_bookings}</span>
              </div>
            </div>

            {isOwnSession ? (
              <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                This is your session
              </button>
            ) : session.is_fully_booked ? (
              <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                Sold Out
              </button>
            ) : (
              <button
                className="btn btn-primary btn-lg"
                onClick={handleBook}
                disabled={booking}
                style={{ width: '100%' }}
              >
                {booking ? 'Booking...' : 'Book Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
