import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { isAuthenticated, isCreator, demoLogin, githubLogin, googleLogin, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isCreator ? '/creator' : '/dashboard');
    }
  }, [isAuthenticated, isCreator, navigate]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code) {
      if (state === 'google') {
        const redirectUri = window.location.origin + '/login';
        googleLogin(code, redirectUri).then(() => {
          navigate('/dashboard');
        }).catch(() => {});
      } else {
        githubLogin(code).then(() => {
          navigate('/dashboard');
        }).catch(() => {});
      }
    }
  }, [searchParams]);

  const handleGitHubLogin = () => {
    if (!GITHUB_CLIENT_ID) {
      alert('GitHub OAuth is not configured. Use Demo Login instead.');
      return;
    }
    const redirectUri = window.location.origin + '/login';
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email&state=github`;
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      alert('Google OAuth is not configured. Use Demo Login instead.');
      return;
    }
    const redirectUri = window.location.origin + '/login';
    const scope = encodeURIComponent('email profile');
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=google`;
  };

  const handleDemoLogin = async (role) => {
    try {
      await demoLogin(role);
      navigate(role === 'creator' ? '/creator' : '/dashboard');
    } catch {}
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="logo-large">S</div>
        <h1>Welcome to SessionHub</h1>
        <p>Sign in to discover, book, and create expert sessions</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', gap: '0.75rem' }}
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
          
          <button
            className="btn btn-secondary btn-lg"
            style={{ width: '100%', gap: '0.75rem', backgroundColor: 'var(--bg-primary)' }}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="auth-divider">or try a demo account</div>

        <div className="demo-buttons">
          <button
            className="btn btn-secondary"
            onClick={() => handleDemoLogin('user')}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Demo User
          </button>
          <button
            className="btn btn-primary"
            onClick={() => handleDemoLogin('creator')}
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Demo Creator
          </button>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Demo accounts let you explore without configuring OAuth credentials
        </p>
      </div>
    </div>
  );
}
