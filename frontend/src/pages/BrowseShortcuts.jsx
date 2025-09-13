import { useState, useEffect } from 'react';
import { useDarkMode } from '../shell/AppShell';

export default function BrowseShortcuts() {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [focusedApp, setFocusedApp] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    filterApps();
  }, [apps, searchTerm]);

  const fetchApps = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/shortcuts/apps');
      const data = await response.json();
      setApps(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching apps:', error);
      setLoading(false);
    }
  };

  const filterApps = () => {
    if (!searchTerm) {
      setFilteredApps(apps.map(app => ({ ...app, matchingShortcuts: [] })));
    } else {
      const filtered = apps.map(app => {
        const matchingShortcuts = app.shortcuts.filter(shortcut => 
          shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const appNameMatches = app.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (matchingShortcuts.length > 0 || appNameMatches) {
          return { ...app, matchingShortcuts };
        }
        return null;
      }).filter(Boolean);
      setFilteredApps(filtered);
    }
  };

  const getAppIcon = (appName) => {
    const name = appName.toLowerCase();
    if (name.includes('vscode') || name.includes('vs code')) return { bg: 'bg-blue-600', text: 'VS' };
    if (name.includes('vim')) return { bg: 'bg-green-600', text: 'VI' };
    if (name.includes('figma')) return { bg: 'bg-purple-600', text: 'F' };
    if (name.includes('chrome')) return { bg: 'bg-red-600', text: 'C' };
    return { bg: 'bg-slate-600', text: appName.charAt(0).toUpperCase() };
  };

  const toggleFavorite = (shortcutId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(shortcutId)) {
        newFavorites.delete(shortcutId);
      } else {
        newFavorites.add(shortcutId);
      }
      return newFavorites;
    });
  };

  const handleTileClick = (app) => {
    setFocusedApp(app);
  };

  const closeFocus = () => {
    setFocusedApp(null);
    setModalSearchTerm('');
  };

  const getFilteredShortcuts = () => {
    if (!focusedApp) return [];
    
    const shortcuts = focusedApp.matchingShortcuts && focusedApp.matchingShortcuts.length > 0 
      ? focusedApp.matchingShortcuts 
      : focusedApp.shortcuts;
    
    if (!modalSearchTerm) return shortcuts;
    
    return shortcuts.filter(shortcut => 
      shortcut.description.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      shortcut.keys.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-5 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading shortcuts...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div style={{
      background: isDarkMode ? '#0f172a' : 'radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), linear-gradient(to bottom, #ffffff, transparent 40%), #ffffff',
      minHeight: '100vh',
      color: isDarkMode ? '#ffffff' : '#0f172a'
    }}>
      <div 
        style={{
          maxWidth: '1200px',
          padding: '0 20px',
          margin: '0 auto',
          paddingTop: '40px',
          paddingBottom: '40px',
          filter: focusedApp ? 'blur(5px)' : 'none',
          pointerEvents: focusedApp ? 'none' : 'auto'
        }}
        onClick={focusedApp ? closeFocus : undefined}
      >
      {/* Page header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 4.2vw, 46px)',
          lineHeight: '1.05',
          margin: '0',
          fontWeight: '900',
          letterSpacing: '-0.02em',
          marginBottom: '14px'
        }}>
          Browse{' '}
          <span style={{
            background: 'linear-gradient(90deg, #0f172a, #64748b)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent'
          }}>
            keyboard shortcuts
          </span>
        </h1>
        <p style={{
          fontSize: '18px',
          color: '#475569',
          margin: '0 auto',
          maxWidth: '60ch'
        }}>
          Search through our library of shortcuts from popular applications. Click any app to explore all available shortcuts.
        </p>
      </div>

      {/* Search bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <div style={{ maxWidth: '520px', width: '100%' }}>
          <input 
            type="text" 
            placeholder="Search shortcuts or apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#0f172a',
              fontSize: '16px',
              outline: 'none',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}
          />
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px', textAlign: 'center' }}>
            Search by app name, shortcut keys, or description
          </p>
        </div>
      </div>

      {/* Apps grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {filteredApps.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)'
          }}>
            <p style={{ color: '#475569', fontSize: '18px', margin: 0 }}>No shortcuts found matching your search.</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>Try searching for "VS Code", "Vim", or browse all available apps.</p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const icon = getAppIcon(app.name);
            const iconBg = icon.bg.includes('blue') ? '#2563eb' : 
                          icon.bg.includes('green') ? '#16a34a' :
                          icon.bg.includes('purple') ? '#9333ea' :
                          icon.bg.includes('red') ? '#dc2626' : '#475569';
            
            return (
              <div 
                key={app.id} 
                onClick={() => handleTileClick(app)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '200px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 20px 40px rgba(2, 6, 23, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 24px rgba(2, 6, 23, 0.08)';
                }}>
                {/* App header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: iconBg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '20px'
                  }}>
                    {icon.text}
                  </div>
                  <div>
                    <h3 style={{
                      fontWeight: '700',
                      color: '#0f172a',
                      margin: '0',
                      fontSize: '18px',
                      lineHeight: '1.2'
                    }}>{app.name}</h3>
                    <p style={{
                      color: '#475569',
                      margin: '4px 0 0',
                      fontSize: '14px'
                    }}>
                      {app.shortcuts?.length || 0} shortcuts
                    </p>
                  </div>
                </div>
                
                {/* Preview shortcuts */}
                <div style={{
                  flex: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {(app.matchingShortcuts && app.matchingShortcuts.length > 0 
                    ? app.matchingShortcuts.slice(0, 3) 
                    : app.shortcuts?.slice(0, 3) || []
                  ).map((shortcut) => (
                    <div key={shortcut.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9'
                    }}>
                      <div style={{
                        flex: '1',
                        minWidth: 0
                      }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#0f172a', 
                          fontSize: '12px',
                          marginBottom: '2px'
                        }}>{shortcut.keys}</div>
                        <div style={{ 
                          color: '#475569', 
                          fontSize: '11px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{shortcut.description}</div>
                      </div>
                      {searchTerm && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(shortcut.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: favorites.has(shortcut.id) ? '#ef4444' : '#d1d5db',
                            padding: '4px',
                            marginLeft: '8px'
                          }}
                        >
                          {favorites.has(shortcut.id) ? '♥' : '♡'}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {/* Click to explore more */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: 'auto',
                    paddingTop: '12px'
                  }}>
                    <span style={{
                      color: '#64748b',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Click to explore all shortcuts →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>
    </div>
    
    {/* App focus modal */}
    {focusedApp && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={closeFocus}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '80vh',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(2, 6, 23, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeFocus}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '8px',
              borderRadius: '8px',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#f1f5f9'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            ×
          </button>
          
          {/* App header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px',
            paddingRight: '40px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              backgroundColor: getAppIcon(focusedApp.name).bg.includes('blue') ? '#2563eb' : 
                              getAppIcon(focusedApp.name).bg.includes('green') ? '#16a34a' :
                              getAppIcon(focusedApp.name).bg.includes('purple') ? '#9333ea' :
                              getAppIcon(focusedApp.name).bg.includes('red') ? '#dc2626' : '#475569',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px'
            }}>
              {getAppIcon(focusedApp.name).text}
            </div>
            <div>
              <h2 style={{
                fontWeight: '800',
                color: '#0f172a',
                margin: '0',
                fontSize: '28px',
                lineHeight: '1.1'
              }}>{focusedApp.name}</h2>
              <p style={{
                color: '#475569',
                margin: '4px 0 0',
                fontSize: '16px'
              }}>
                {getFilteredShortcuts().length} shortcuts available
              </p>
            </div>
          </div>
            
          {/* Modal search bar - only show when no main search is active */}
          {!searchTerm && (
            <input 
              type="text" 
              placeholder={`Search ${focusedApp.name} shortcuts...`}
              value={modalSearchTerm}
              onChange={(e) => setModalSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                marginBottom: '20px',
                background: '#f8fafc'
              }}
            />
          )}
            
          {/* Shortcuts list */}
          <div style={{
            flex: '1',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {getFilteredShortcuts().map((shortcut) => (
              <div key={shortcut.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #f1f5f9',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
              >
                <div style={{
                  flex: '1'
                }}>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#0f172a', 
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>{shortcut.keys}</div>
                  <div style={{ 
                    color: '#475569', 
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>{shortcut.description}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(shortcut.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    color: favorites.has(shortcut.id) ? '#ef4444' : '#d1d5db',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  {favorites.has(shortcut.id) ? '♥' : '♡'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
