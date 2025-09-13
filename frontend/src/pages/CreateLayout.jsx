import { useState } from 'react';
import { useDarkMode } from '../shell/AppShell';

export default function CreateLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { isDarkMode } = useDarkMode();

  const shortcuts = [
    { app: 'VS Code', command: 'Copy', key: '⌘C' },
    { app: 'VS Code', command: 'Paste', key: '⌘V' },
    { app: 'VS Code', command: 'Undo', key: '⌘Z' },
    { app: 'Photoshop', command: 'New Layer', key: '⌘⇧N' },
    { app: 'Figma', command: 'Duplicate', key: '⌘D' },
  ];

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
        
        {/* Main Container */}
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
          overflow: 'hidden'
        }}>
          
          <div style={{ display: 'flex', height: '600px' }}>
            
            {/* Left Sidebar */}
            <div style={{
              width: '300px',
              borderRight: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column'
            }}>
              
              {/* Search Bar */}
              <div style={{
                padding: '16px',
                borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0'
              }}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>
              
              {/* Tabs */}
              <div style={{
                display: 'flex',
                padding: '16px',
                gap: '16px',
                borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setActiveTab('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: activeTab === 'all' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 0',
                    borderBottom: activeTab === 'all' ? '2px solid #0f172a' : 'none'
                  }}
                >
                  All apps
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: activeTab === 'favorites' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 0',
                    borderBottom: activeTab === 'favorites' ? '2px solid #0f172a' : 'none'
                  }}
                >
                  Favorites
                </button>
              </div>

              {/* App List */}
              <div style={{
                flex: 1,
                overflow: 'auto'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: isDarkMode ? '#374151' : '#f8fafc'
                }}>
                  <div>App Name</div>
                  <div>Command</div>
                </div>
                
                {shortcuts.map((shortcut, index) => (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#0f172a' }}>{shortcut.app}</div>
                    <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b' }}>{shortcut.command}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas Area */}
            <div style={{
              flex: 1,
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#e97316',
              fontSize: '36px',
              fontWeight: '800'
            }}>
              Sticker Layout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}