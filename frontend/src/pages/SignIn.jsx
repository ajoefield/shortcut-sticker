import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../shell/AppShell';

export default function SignIn() {
  const { isDarkMode } = useDarkMode();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/profile');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={{
      background: isDarkMode ? '#0f172a' : 'radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), linear-gradient(to bottom, #ffffff, transparent 40%), #ffffff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      color: isDarkMode ? '#ffffff' : '#0f172a'
    }}>
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: isDarkMode ? '#ffffff' : '#0f172a',
            margin: '0 0 8px 0'
          }}>Sign In</h2>
          <p style={{
            color: isDarkMode ? '#9ca3af' : '#64748b',
            margin: '0'
          }}>Welcome back to HandsOnKeyboard</p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a'
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#0f172a'
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a'
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#0f172a'
              }}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: loading ? '#9ca3af' : '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s ease',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = '0.9')}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: isDarkMode ? '#9ca3af' : '#64748b',
          marginTop: '24px',
          margin: '24px 0 0 0'
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}