import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsAPI, bookingsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreatorDashboard() {
  const { user, isAuthenticated, isCreator, addToast } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sessions');
  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    date_time: '',
    duration: 60,
    capacity: 20,
    price: 0,
    image: '',
    category: 'technology',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isCreator) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [isAuthenticated, isCreator]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessRes, bookRes] = await Promise.all([
        sessionsAPI.creatorList(),
        bookingsAPI.creatorList(),
      ]);
      setSessions(sessRes.data.results || sessRes.data);
      setBookings(bookRes.data.results || bookRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingSession(null);
    const now = new Date();
    now.setDate(now.getDate() + 7);
    const dateStr = now.toISOString().slice(0, 16);
    setSessionForm({
      title: '',
      description: '',
      date_time: dateStr,
      duration: 60,
      capacity: 20,
      price: 0,
      image: '',
      category: 'technology',
    });
    setShowModal(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description,
      date_time: session.date_time.slice(0, 16),
      duration: session.duration,
      capacity: session.capacity,
      price: Number(session.price),
      image: session.image || '',
      category: session.category,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...sessionForm,
        date_time: new Date(sessionForm.date_time).toISOString(),
      };
      if (editingSession) {
        await sessionsAPI.creatorUpdate(editingSession.id, data);
        addToast('Session updated!');
      } else {
        await sessionsAPI.creatorCreate(data);
        addToast('Session created!');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'object') {
        const errors = Object.entries(msg).map(([k, v]) => `${k}: ${v}`).join(', ');
        addToast(errors, 'error');
      } else {
        addToast('Save failed', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionsAPI.creatorDelete(id);
      addToast('Session deleted');
      loadData();
    } catch {
      addToast('Delete failed', 'error');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const totalRevenue = sessions.reduce((sum, s) => {
    const activeBookings = bookings.filter((b) => b.session === s.id && b.status === 'active');
    return sum + (Number(s.price) * activeBookings.length);
  }, 0);

  if (!user || !isCreator) return null;

  return (
    <div className="dashboard animate-fade-in-up">
      <div className="dashboard-header">
        <h1>Creator Studio</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`filter-chip ${tab === 'sessions' ? 'active' : ''}`}
            onClick={() => setTab('sessions')}
          >
            Sessions
          </button>
          <button
            className={`filter-chip ${tab === 'bookings' ? 'active' : ''}`}
            onClick={() => setTab('bookings')}
          >
            Bookings
          </button>
          <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
            + New Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon purple">&#127891;</div>
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Your Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan">&#128176;</div>
          <div className="stat-value">{bookings.filter(b => b.status === 'active').length}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">&#128181;</div>
          <div className="stat-value">${totalRevenue.toFixed(0)}</div>
          <div className="stat-label">Est. Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">&#11088;</div>
          <div className="stat-value">{sessions.filter(s => s.status === 'active').length}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : tab === 'sessions' ? (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Your Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#127891;</div>
              <h3>No sessions yet</h3>
              <p>Create your first session and start sharing your expertise!</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreateModal}>
                Create Session
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Bookings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const sessionBookings = bookings.filter(b => b.session === s.id && b.status === 'active');
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{s.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {s.duration} min &middot; {s.capacity} seats
                          </div>
                        </td>
                        <td>
                          <span className="filter-chip" style={{ cursor: 'default', fontSize: '0.7rem' }}>
                            {s.category}
                          </span>
                        </td>
                        <td>
                          <div>{formatDate(s.date_time)}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(s.date_time)}</div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {Number(s.price) === 0 ? 'Free' : `$${Number(s.price).toFixed(0)}`}
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                            {sessionBookings.length}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}> / {s.capacity}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${s.status}`}>{s.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(s)}>
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Booking Overview</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#128203;</div>
              <h3>No bookings yet</h3>
              <p>Share your sessions to get your first bookings!</p>
            </div>
          ) : (
            <div className="booking-list">
              {bookings.map((b) => (
                <div key={b.id} className="booking-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <img
                      src={b.user_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${b.user_name}`}
                      alt={b.user_name}
                      style={{ width: 36, height: 36, borderRadius: '50%' }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.user_email}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{b.session_title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Booked: {formatDate(b.booked_at)}
                    </div>
                  </div>
                  <span className={`status-badge ${b.status}`}>{b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSession ? 'Edit Session' : 'Create New Session'}</h2>
            <form onSubmit={handleSave}>
              <div className="profile-form">
                <div className="form-group full-width">
                  <label>Title</label>
                  <input
                    type="text"
                    required
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    placeholder="e.g. Mastering React Hooks"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    required
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    placeholder="Describe what attendees will learn..."
                  />
                </div>
                <div className="form-group">
                  <label>Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={sessionForm.date_time}
                    onChange={(e) => setSessionForm({ ...sessionForm, date_time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={sessionForm.category}
                    onChange={(e) => setSessionForm({ ...sessionForm, category: e.target.value })}
                  >
                    <option value="technology">Technology</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="health">Health & Wellness</option>
                    <option value="education">Education</option>
                    <option value="finance">Finance</option>
                    <option value="arts">Arts & Culture</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration (min)</label>
                  <input
                    type="number"
                    min="15"
                    required
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) || 60 })}
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sessionForm.capacity}
                    onChange={(e) => setSessionForm({ ...sessionForm, capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={sessionForm.price}
                    onChange={(e) => setSessionForm({ ...sessionForm, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Image URL (Optional)</label>
                  <input
                    type="url"
                    value={sessionForm.image}
                    onChange={(e) => setSessionForm({ ...sessionForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingSession ? 'Update Session' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
