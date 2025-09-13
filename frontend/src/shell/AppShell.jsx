import { useEffect, useState, createContext, useContext } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within DarkModeProvider');
  }
  return context;
};

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = isDarkMode ? '#0f172a' : '#ffffff';
    document.body.style.color = isDarkMode ? '#ffffff' : '#0f172a';
  }, [isDarkMode]);

  return (
    <>
      {/* Navbar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(8px)',
        background: isDarkMode ? 'color-mix(in oklab, #0f172a 70%, transparent)' : 'color-mix(in oklab, #ffffff 70%, transparent)',
        borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
        color: isDarkMode ? '#ffffff' : '#0f172a'
      }}>
        <div style={{
          maxWidth: '1200px',
          padding: '0 20px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          padding: '12px 20px'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '700',
            textDecoration: 'none',
            color: 'inherit'
          }}>
            <span style={{
              width: '32px',
              height: '32px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background: '#0f172a',
              color: '#fff'
            }}>SD</span>
            <span>Shortcut Designer</span>
            <span style={{
              display: 'inline-block',
              border: '1px solid #e2e8f0',
              borderRadius: '999px',
              padding: '3px 8px',
              fontSize: '12px'
            }}>Beta</span>
          </Link>
          
          <div style={{
            display: window.innerWidth >= 768 ? 'flex' : 'none',
            alignItems: 'center',
            gap: '24px'
          }}>
            <nav style={{
              display: 'flex',
              gap: '24px',
              fontSize: '14px'
            }}>
              <Link to="/browse" style={{ color: 'inherit', textDecoration: 'none' }}>Browse Shortcuts</Link>
              <Link to="/create" style={{ color: 'inherit', textDecoration: 'none' }}>Create Layout</Link>
              <Link to="/profile" style={{ color: 'inherit', textDecoration: 'none' }}>Profile</Link>
            </nav>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  padding: '8px',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#ffffff' : '#0f172a',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link to="/signin" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: '12px',
                border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}>Sign in</Link>
              <Link to="/signup" style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 14px',
                borderRadius: '12px',
                background: isDarkMode ? '#ffffff' : '#0f172a',
                color: isDarkMode ? '#0f172a' : '#fff',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease'
              }}>Sign up</Link>
            </div>
          </div>
          
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="primary-menu"
            onClick={() => setOpen((o) => !o)}
            style={{
              display: window.innerWidth >= 768 ? 'none' : 'block',
              padding: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M3 12h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {open && (
          <nav style={{
            position: 'absolute',
            left: '20px',
            right: '20px',
            top: '100%',
            zIndex: 50,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
            padding: '8px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link
                to="/browse"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Browse Shortcuts
              </Link>
              <Link
                to="/create"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Create Layout
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Profile
              </Link>
              <div style={{
                borderTop: '1px solid #e2e8f0',
                margin: '8px 0',
                paddingTop: '8px',
                display: 'flex',
                gap: '8px'
              }}>
                <Link
                  to="/signin"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    color: '#fff',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <div style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0f172a' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#0f172a',
        width: '100%'
      }}>
        <main style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px 40px',
          background: isDarkMode ? '#0f172a' : '#ffffff',
          minHeight: '100vh'
        }}>
          <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
            <Outlet />
          </DarkModeContext.Provider>
        </main>
        <footer style={{
          borderTop: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
          marginTop: '40px',
          padding: '24px 0',
          textAlign: 'center',
          fontSize: '14px',
          color: isDarkMode ? '#9ca3af' : '#475569'
        }}>
          © {new Date().getFullYear()} Shortcut Designer
        </footer>
      </div>
    </>
  );
}


