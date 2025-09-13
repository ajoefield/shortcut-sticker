import { useState, useEffect } from 'react';

export default function BrowseShortcuts() {
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [focusedApp, setFocusedApp] = useState(null);
  const [modalSearchTerm, setModalSearchTerm] = useState('');

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
    <div 
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        filter: focusedApp ? 'blur(5px)' : 'none',
        pointerEvents: focusedApp ? 'none' : 'auto'
      }}
      onClick={focusedApp ? closeFocus : undefined}
    >
      {/* Centered search bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '40px'
      }}>
        <input 
          type="text" 
          placeholder="Search shortcuts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '400px',
            height: '48px',
            padding: '0 16px',
            border: '4px solid #1e1e1e',
            borderRadius: '8px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
      </div>

      {/* Shortcuts Content */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '40px',
        justifyContent: 'center'
      }}>
        {filteredApps.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 0',
            color: '#64748b'
          }}>
            <p>No shortcuts found matching your search.</p>
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
                  minWidth: '100px',
                  width: 'max-content',
                  height: '100px',
                  backgroundColor: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                {/* App logo and name - always centered */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: app.matchingShortcuts && app.matchingShortcuts.length > 0 ? '8px' : '0'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: iconBg,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {icon.text}
                  </div>
                  <h3 style={{
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0',
                    fontSize: '10px',
                    lineHeight: '1.2',
                    textAlign: 'center'
                  }}>{app.name}</h3>
                </div>
                
                {/* Matching shortcuts with heart icons */}
                {app.matchingShortcuts && app.matchingShortcuts.length > 0 && (
                  <div style={{
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {app.matchingShortcuts.slice(0, 2).map((shortcut) => (
                      <div key={shortcut.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '8px',
                        lineHeight: '1.2'
                      }}>
                        <div style={{
                          textAlign: 'left',
                          whiteSpace: 'nowrap'
                        }}>
                          <div style={{ fontWeight: '500', color: '#64748b' }}>{shortcut.keys}</div>
                          <div style={{ color: '#94a3b8' }}>{shortcut.description}</div>
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
                            fontSize: '12px',
                            color: favorites.has(shortcut.id) ? '#ef4444' : '#d1d5db',
                            padding: '2px',
                            marginLeft: '8px'
                          }}
                        >
                          {favorites.has(shortcut.id) ? '♥' : '♡'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
    
    {/* Zoom overlay */}
    {focusedApp && (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        onClick={closeFocus}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            minWidth: '300px',
            width: 'max-content',
            maxWidth: '80vw',
            backgroundColor: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}
        >
          {/* Close button */}
          <button
            onClick={closeFocus}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#64748b',
              padding: '5px'
            }}
          >
            ×
          </button>
          
          {/* Focused app content */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            {/* App header */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: getAppIcon(focusedApp.name).bg.includes('blue') ? '#2563eb' : 
                                getAppIcon(focusedApp.name).bg.includes('green') ? '#16a34a' :
                                getAppIcon(focusedApp.name).bg.includes('purple') ? '#9333ea' :
                                getAppIcon(focusedApp.name).bg.includes('red') ? '#dc2626' : '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                {getAppIcon(focusedApp.name).text}
              </div>
              <h2 style={{
                fontWeight: '600',
                color: '#1e293b',
                margin: '0',
                fontSize: '24px'
              }}>{focusedApp.name}</h2>
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
                  height: '36px',
                  padding: '0 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            )}
            
            {/* All shortcuts with scrollbar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
              maxHeight: '60vh',
              overflowY: 'auto',
              paddingRight: '8px'
            }}>
              {getFilteredShortcuts().map((shortcut) => (
                <div key={shortcut.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{shortcut.keys}</div>
                    <div style={{ color: '#64748b', fontSize: '12px' }}>{shortcut.description}</div>
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
                      fontSize: '18px',
                      color: favorites.has(shortcut.id) ? '#ef4444' : '#d1d5db',
                      padding: '4px'
                    }}
                  >
                    {favorites.has(shortcut.id) ? '♥' : '♡'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
