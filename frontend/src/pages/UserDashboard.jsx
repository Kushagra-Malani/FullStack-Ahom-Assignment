import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

export default function UserDashboard() {
  const { user, isAuthenticated, updateProfile, addToast } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('bookings');
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    role: 'user',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadBookings();
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        role: user.role || 'user',
      });
    }
  }, [isAuthenticated, user]);

  const loadBookings = async () => {
    try {
      const res = await bookingsAPI.list();
      setBookings(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await bookingsAPI.cancel(id);
      addToast('Booking cancelled');
      loadBookings();
    } catch (err) {
      addToast('Failed to cancel booking', 'error');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
    } catch {}
    setSaving(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const activeBookings = bookings.filter((b) => b.status === 'active');
  const pastBookings = bookings.filter((b) => b.status !== 'active');

  if (!user) return null;

  return (
    <div className="dashboard animate-fade-in-up">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`filter-chip ${tab === 'bookings' ? 'active' : ''}`}
            onClick={() => setTab('bookings')}
          >
            Bookings
          </button>
          <button
            className={`filter-chip ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon purple">&#128196;</div>
          <div className="stat-value">{bookings.length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">&#9989;</div>
          <div className="stat-value">{activeBookings.length}</div>
          <div className="stat-label">Active Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">&#128338;</div>
          <div className="stat-value">{pastBookings.length}</div>
          <div className="stat-label">Past / Cancelled</div>
        </div>
      </div>

      {tab === 'bookings' && (
        <>
          {/* Active Bookings */}
          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <h2>Active Bookings</h2>
            </div>
            {loading ? (
              <div className="loading-spinner"><div className="spinner" /></div>
            ) : activeBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">&#128197;</div>
                <h3>No active bookings</h3>
                <p>Browse sessions and book your first one!</p>
                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  Explore Sessions
                </Link>
              </div>
            ) : (
              <div className="booking-list">
                {activeBookings.map((b) => (
                  <div key={b.id} className="booking-item">
                    <div className="booking-item-image">
                      <img
                        src={b.session_detail?.image || FALLBACK_IMAGE}
                        alt={b.session_detail?.title}
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      />
                    </div>
                    <div className="booking-item-info">
                      <Link to={`/sessions/${b.session_detail?.id || b.session}`} className="booking-item-title">
                        {b.session_detail?.title || `Session #${b.session}`}
                      </Link>
                      <div className="booking-item-meta">
                        <span>{b.session_detail && formatDate(b.session_detail.date_time)}</span>
                        <span>{b.session_detail && formatTime(b.session_detail.date_time)}</span>
                        <span>{b.session_detail?.duration} min</span>
                      </div>
                    </div>
                    <div className="booking-item-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="status-badge active">Active</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(b.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="dashboard-section">
              <div className="dashboard-section-header">
                <h2>Past & Cancelled</h2>
              </div>
              <div className="booking-list">
                {pastBookings.map((b) => (
                  <div key={b.id} className="booking-item" style={{ opacity: 0.6 }}>
                    <div className="booking-item-image">
                      <img
                        src={b.session_detail?.image || FALLBACK_IMAGE}
                        alt={b.session_detail?.title}
                        onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                      />
                    </div>
                    <div className="booking-item-info">
                      <div className="booking-item-title">
                        {b.session_detail?.title || `Session #${b.session}`}
                      </div>
                      <div className="booking-item-meta">
                        <span>{b.session_detail && formatDate(b.session_detail.date_time)}</span>
                        <span>Booked: {formatDate(b.booked_at)}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${b.status}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'profile' && (
        <div className="dashboard-section">
          <div className="profile-card">
            <div className="profile-header">
              <img
                className="profile-avatar"
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                alt={user.username}
              />
              <div className="profile-info">
                <h2>{user.first_name} {user.last_name}</h2>
                <p>@{user.username} &middot; {user.email}</p>
                <span className={`role-badge ${user.role}`}>{user.role}</span>
              </div>
            </div>

            <form className="profile-form" onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="creator">Creator</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="form-group full-width" style={{ justifyContent: 'flex-end' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
