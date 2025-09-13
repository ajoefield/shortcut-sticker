import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../shell/AppShell';

export default function Profile() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    password: '',
    confirmPassword: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);
  const myInfoRef = useRef(null);
  const myLayoutsRef = useRef(null);
  const myShortcutsRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div style={{
      background: isDarkMode ? '#0f172a' : 'radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), linear-gradient(to bottom, #ffffff, transparent 40%), #ffffff',
      minHeight: '100vh',
      minWidth: '1400px',
      color: isDarkMode ? '#ffffff' : '#0f172a'
    }}>
      <div style={{
        maxWidth: '1200px',
        padding: '0 20px',
        margin: '0 auto',
        paddingTop: '40px',
        paddingBottom: '40px'
      }}>


        {/* Floating Navigation Menu */}
        <div style={{
          position: 'fixed',
          top: '100px',
          left: '20px',
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={() => setIsMenuCollapsed(!isMenuCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '4px',
              alignSelf: 'flex-end',
              color: isDarkMode ? '#ffffff' : '#0f172a'
            }}
          >
            {isMenuCollapsed ? '▼' : '▲'}
          </button>
          {!isMenuCollapsed && (<>
          <button
            onClick={() => scrollToSection(myInfoRef)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            My Info
          </button>
          <button
            onClick={() => scrollToSection(myLayoutsRef)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            My Layouts
          </button>
          <button
            onClick={() => scrollToSection(myShortcutsRef)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              color: isDarkMode ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            My Favorite Shortcuts
          </button>
          </>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>

          {/* Main Content */}
          <div style={{
            background: isDarkMode ? '#1f2937' : '#ffffff',
            border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
            maxWidth: '1000px',
            width: '100%'
          }}>
            <div style={{
              maxWidth: '800px',
              margin: '0 auto'
            }}>
            {/* My Info Section */}
            <div ref={myInfoRef} style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: isDarkMode ? '#ffffff' : '#0f172a',
                margin: '0 0 24px 0'
              }}>My Info</h2>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#0f172a' }}>First Name:</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#0f172a' }}>Last Name:</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#0f172a' }}>Email Address:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#0f172a' }}>Change Password:</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#0f172a' }}>Confirm Password:</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                  >
                    SUBMIT
                  </button>
                </div>
              </form>
            </div>

            {/* My Layouts Section */}
            <div ref={myLayoutsRef} style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 24px 0'
              }}>My Layouts</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {/* Layout thumbnails */}
                {[1, 2, 3].map((layout) => (
                  <div key={layout} style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    background: '#f8fafc',
                    textAlign: 'center',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: '1.4'
                    }}>
                      Thumbnail<br/>
                      image of<br/>
                      saved<br/>
                      layout
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* My Favorite Shortcuts Section */}
            <div ref={myShortcutsRef}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#0f172a',
                margin: '0 0 24px 0'
              }}>My Favorite Shortcuts</h2>
              
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                background: '#f8fafc'
              }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                
                <div style={{
                  marginTop: '20px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  Your favorite shortcuts will appear here
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}