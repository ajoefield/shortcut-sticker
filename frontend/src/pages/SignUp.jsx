import { useDarkMode } from '../shell/AppShell';

export default function SignUp(){
  const { isDarkMode } = useDarkMode();

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
          }}>Create Account</h2>
          <p style={{
            color: isDarkMode ? '#9ca3af' : '#64748b',
            margin: '0'
          }}>Join HandsOnKeyboard today</p>
        </div>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a'
            }}>First Name</label>
            <input 
              type="text"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="First name"
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a'
            }}>Last Name</label>
            <input 
              type="text"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="Last name"
            />
          </div>
          
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
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
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
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="Create a password"
            />
          </div>
          
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Create Account
          </button>
        </form>
        
        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: isDarkMode ? '#9ca3af' : '#64748b',
          marginTop: '24px',
          margin: '24px 0 0 0'
        }}>
          Already have an account?{' '}
          <a href="/signin" style={{
            color: isDarkMode ? '#ffffff' : '#0f172a',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}