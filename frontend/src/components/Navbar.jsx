import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isCreator, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="logo-icon">S</div>
        <span>SessionHub</span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Explore</Link>

        {isAuthenticated ? (
          <>
            {isCreator ? (
              <Link to="/creator" className={isActive('/creator')}>Creator Studio</Link>
            ) : (
              <Link to="/dashboard" className={isActive('/dashboard')}>My Bookings</Link>
            )}

            <div className="navbar-user" ref={menuRef}>
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`}
                alt={user.username}
                className="navbar-avatar"
                onClick={() => setMenuOpen(!menuOpen)}
              />

              {menuOpen && (
                <div className="navbar-user-menu">
                  <div style={{ padding: '0.5rem 1rem', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {user.first_name} {user.last_name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      @{user.username}
                    </div>
                  </div>
                  <div className="menu-divider" />
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  {isCreator && (
                    <Link to="/creator" onClick={() => setMenuOpen(false)}>
                      Creator Studio
                    </Link>
                  )}
                  <div className="menu-divider" />
                  <button className="logout-btn" onClick={handleLogout}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
