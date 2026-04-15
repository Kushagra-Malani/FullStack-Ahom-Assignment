import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import SessionCard from '../components/SessionCard';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'arts', label: 'Arts' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadSessions();
  }, [category]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const params = { page_size: 50 };
      if (category) params.category = category;
      const res = await sessionsAPI.list(params);
      setSessions(res.data.results || res.data);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span>&#9889;</span> The Future of Learning
          </div>
          <h1>
            Discover & Book<br />
            <span className="gradient-text">Expert Sessions</span>
          </h1>
          <p>
            Connect with industry leaders, learn cutting-edge skills, and accelerate
            your career through live, interactive sessions curated by top creators.
          </p>
          <div className="hero-actions">
            <a href="#catalog" className="btn btn-primary btn-lg">
              Browse Sessions
            </a>
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-secondary btn-lg">
                Get Started
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{sessions.length}+</div>
              <div className="hero-stat-label">Live Sessions</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">3</div>
              <div className="hero-stat-label">Expert Creators</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">9</div>
              <div className="hero-stat-label">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Session Catalog */}
      <section className="catalog" id="catalog">
        <div className="catalog-header">
          <h2 className="catalog-title">Explore Sessions</h2>
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog-filters" style={{ marginBottom: '1.5rem' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`filter-chip ${category === cat.value ? 'active' : ''}`}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#128269;</div>
            <h3>No sessions found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="sessions-grid stagger">
            {filtered.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
