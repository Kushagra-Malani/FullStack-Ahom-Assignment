import { Link } from 'react-router-dom';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

export default function SessionCard({ session }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <Link to={`/sessions/${session.id}`} className="session-card">
      <div className="session-card-image">
        <img
          src={session.image || FALLBACK_IMAGE}
          alt={session.title}
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <span className="session-card-category">{session.category}</span>
        <span className="session-card-price">
          {Number(session.price) === 0 ? 'Free' : `$${Number(session.price).toFixed(0)}`}
        </span>
      </div>
      <div className="session-card-body">
        <h3 className="session-card-title">{session.title}</h3>
        <p className="session-card-desc">{session.description}</p>
        <div className="session-card-meta">
          <span className="session-card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(session.date_time)}
          </span>
          <span className="session-card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {session.duration} min
          </span>
          <span className="session-card-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {session.capacity} seats
          </span>
        </div>
      </div>
      <div className="session-card-footer">
        <div className="session-card-creator">
          <img
            src={session.creator_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${session.creator_name}`}
            alt={session.creator_name}
          />
          <span>{session.creator_name}</span>
        </div>
        <span className={`session-card-spots ${session.is_fully_booked ? 'full' : ''}`}>
          {session.is_fully_booked ? 'Sold Out' : `${session.spots_left} spots left`}
        </span>
      </div>
    </Link>
  );
}
