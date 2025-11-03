import { useState, useEffect } from 'react';
import { useDarkMode } from '../shell/AppShell';

export default function CreateLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [shortcuts, setShortcuts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [textSize, setTextSize] = useState('medium');
  const [selectedShortcuts, setSelectedShortcuts] = useState({});
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedApps, setSelectedApps] = useState([]);
  const [layoutType, setLayoutType] = useState(''); // 'single' or 'multi'
  const [layoutSize, setLayoutSize] = useState('');
  const [showLayout, setShowLayout] = useState(false);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const { isDarkMode } = useDarkMode();

  const sizes = [
    { id: '3.75', name: '3.75" Square', shortcuts: 42 }
  ];

  const getShortcutCount = () => {
    const size = sizes.find(s => s.id === layoutSize);
    const baseCount = size ? size.shortcuts : 42;
    return textSize === 'large' ? Math.floor(baseCount * 0.7) : baseCount;
  };

  const [customSections, setCustomSections] = useState([
    { id: 0, name: 'Section 1' },
    { id: 1, name: 'Section 2' }
  ]);
  const [editingSection, setEditingSection] = useState(null);


  const MAX_SHORTCUTS_PER_SECTION = 12;
  const MAX_TOTAL_SHORTCUTS = 50;

  const getTotalShortcuts = () => {
    return Object.values(selectedShortcuts).reduce((total, section) => 
      total + (section || []).filter(s => s).length, 0
    );
  };

  const addSection = () => {
    // Calculate if new section would interfere with border
    const currentRows = Math.ceil(customSections.length / 2);
    const newRows = Math.ceil((customSections.length + 1) / 2);
    const sectionHeight = 120; // approximate height per section
    const requiredHeight = newRows * sectionHeight + 60; // sections + padding
    const maxSafeHeight = 600; // keep within safe border area
    
    if (requiredHeight > maxSafeHeight) {
      alert('Cannot add more sections - would interfere with sticker border. Maximum sections reached for legible layout.');
      return;
    }
    
    const newId = Math.max(...customSections.map(s => s.id)) + 1;
    setCustomSections([...customSections, { id: newId, name: `Section ${newId + 1}` }]);
  };

  const removeSection = (sectionId) => {
    if (customSections.length > 1) {
      setCustomSections(customSections.filter(s => s.id !== sectionId));
      setSelectedShortcuts(prev => {
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      });
    }
  };

  const updateSectionName = (sectionId, newName) => {
    setCustomSections(customSections.map(s => 
      s.id === sectionId ? { ...s, name: newName } : s
    ));
  };

  const fetchShortcuts = async (search = '') => {
    if (!selectedApp) return;
    setLoading(true);
    try {
      const url = `http://localhost:3001/api/shortcuts?search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();
      // Filter by selected app(s) on frontend
      const appsToFilter = layoutType === 'single' ? [selectedApp] : selectedApps;
      let filteredData = data.filter(shortcut => appsToFilter.includes(shortcut.app));
      
      // Filter by platform if platforms are selected
      if (selectedPlatforms.length > 0) {
        filteredData = filteredData.filter(shortcut => 
          selectedPlatforms.includes(shortcut.platform) || !shortcut.platform
        );
      }
      
      setShortcuts(filteredData);
    } catch (error) {
      console.error('Error fetching shortcuts:', error);
      setShortcuts([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPlatforms = async (appName) => {
    if (!appName) return;
    try {
      const url = `http://localhost:3001/api/shortcuts`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('All shortcuts data sample:', data.slice(0, 3)); // Debug log
      
      // Filter by app name on frontend since API doesn't support app filter
      const appShortcuts = data.filter(s => s.app === appName);
      console.log(`Shortcuts for ${appName}:`, appShortcuts.slice(0, 3)); // Debug log
      console.log(`Total ${appName} shortcuts:`, appShortcuts.length); // Debug log
      
      // Log all unique platform values
      const allPlatformValues = appShortcuts.map(s => s.platform);
      console.log('All platform values:', allPlatformValues.slice(0, 10)); // Debug log
      
      const platforms = [...new Set(appShortcuts.map(s => s.platform).filter(Boolean))];
      console.log('Available platforms:', platforms); // Debug log
      setAvailablePlatforms(platforms);
      if (platforms.length > 0) {
        setSelectedPlatforms(platforms); // Select all by default
      } else {
        // If no platforms found, don't show platform selection
        setSelectedPlatforms([]);
      }
    } catch (error) {
      console.error('Error checking platforms:', error);
      setAvailablePlatforms([]);
    }
  };

  useEffect(() => {
    if (selectedApp && showLayout) {
      fetchShortcuts();
    }
  }, [selectedApp, selectedPlatforms, showLayout]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      fetchShortcuts('');
    } else {
      const debounceTimer = setTimeout(() => {
        fetchShortcuts(searchTerm);
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, selectedPlatforms]);

  const getAppIcon = (appName) => {
    const name = appName.toLowerCase();
    if (name.includes('vscode') || name.includes('vs code')) return { bg: '#2563eb', text: 'VS' };
    if (name.includes('vim')) return { bg: '#16a34a', text: 'VI' };
    if (name.includes('figma')) return { bg: '#9333ea', text: 'F' };
    if (name.includes('chrome')) return { bg: '#dc2626', text: 'C' };
    if (name.includes('photoshop')) return { bg: '#31A8FF', text: 'PS' };
    return { bg: '#475569', text: appName.charAt(0).toUpperCase() };
  };

  const toggleFavorite = (index) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const filteredShortcuts = activeTab === 'favorites' 
    ? shortcuts.filter((_, index) => favorites.has(index))
    : shortcuts;

  // Get all shortcuts used in layout
  const getUsedShortcuts = () => {
    const used = new Set();
    Object.values(selectedShortcuts).forEach(sectionShortcuts => {
      sectionShortcuts.forEach(shortcut => {
        if (shortcut) {
          used.add(`${shortcut.key}-${shortcut.command}`);
        }
      });
    });
    return used;
  };

  const usedShortcuts = getUsedShortcuts();

  const isShortcutUsed = (shortcut) => {
    return usedShortcuts.has(`${shortcut.key}-${shortcut.command}`);
  };

  const removeShortcutFromLayout = (shortcutToRemove) => {
    setSelectedShortcuts(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(sectionIndex => {
        newState[sectionIndex] = newState[sectionIndex].map(shortcut => 
          shortcut && shortcut.key === shortcutToRemove.key && shortcut.command === shortcutToRemove.command 
            ? null 
            : shortcut
        );
      });
      return newState;
    });
  };

  const fetchApps = async () => {
    setLoadingApps(true);
    try {
      const response = await fetch('http://localhost:3001/api/shortcuts/apps');
      const data = await response.json();
      setApps(data);
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoadingApps(false);
    }
  };

  const startLayout = () => {
    const hasValidApps = layoutType === 'single' ? selectedApp : selectedApps.length > 0;
    if (hasValidApps && layoutSize) {
      setShowLayout(true);
    }
  };

  const toggleAppSelection = (appName) => {
    setSelectedApps(prev => 
      prev.includes(appName) 
        ? prev.filter(name => name !== appName)
        : [...prev, appName]
    );
  };

  useEffect(() => {
    fetchApps();
  }, []);

  if (!showLayout) {
    return (
      <div style={{
        background: isDarkMode ? '#0f172a' : 'radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), linear-gradient(to bottom, #ffffff, transparent 40%), #ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isDarkMode ? '#ffffff' : '#0f172a'
      }}>
        <div style={{
          background: isDarkMode ? '#1f2937' : '#ffffff',
          border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 10px 24px rgba(2, 6, 23, 0.08)',
          maxWidth: '600px',
          width: '100%'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '24px', fontWeight: '700' }}>Create Shortcut Layout</h2>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Layout Type:</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setLayoutType('single')}
                style={{
                  padding: '12px 20px',
                  border: layoutType === 'single' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: layoutType === 'single' ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Single App
              </button>
              <button
                onClick={() => setLayoutType('multi')}
                style={{
                  padding: '12px 20px',
                  border: layoutType === 'multi' ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: layoutType === 'multi' ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Multi App
              </button>
            </div>
          </div>

          {layoutType && (
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              {layoutType === 'single' ? 'Choose Application:' : 'Choose Applications:'}
            </label>
            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading apps...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {apps.map(app => {
                  const isSelected = layoutType === 'single' 
                    ? selectedApp === app.name 
                    : selectedApps.includes(app.name);
                  return (
                    <button
                      key={app.id}
                      onClick={() => {
                        if (layoutType === 'single') {
                          setSelectedApp(app.name);
                          checkPlatforms(app.name);
                        } else {
                          toggleAppSelection(app.name);
                          if (!selectedApps.includes(app.name)) {
                            checkPlatforms(app.name);
                          }
                        }
                      }}
                      style={{
                        padding: '16px',
                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        background: isSelected ? '#eff6ff' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#3b82f6',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {app.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{app.name}</span>
                      {layoutType === 'multi' && isSelected && (
                        <span style={{ marginLeft: 'auto', color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {availablePlatforms.length > 0 && (layoutType === 'single' ? selectedApp : selectedApps.length > 0) && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Choose Platform(s):</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {availablePlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => {
                      setSelectedPlatforms(prev => 
                        prev.includes(platform)
                          ? prev.filter(p => p !== platform)
                          : [...prev, platform]
                      );
                    }}
                    style={{
                      padding: '8px 16px',
                      border: selectedPlatforms.includes(platform) ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: selectedPlatforms.includes(platform) ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}
                  >
                    {platform}
                    {selectedPlatforms.includes(platform) && (
                      <span style={{ marginLeft: '8px', color: '#3b82f6', fontWeight: 'bold' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Choose Layout Size:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sizes.map(size => (
                <button
                  key={size.id}
                  onClick={() => setLayoutSize(size.id)}
                  style={{
                    padding: '12px 16px',
                    border: layoutSize === size.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: layoutSize === size.id ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>{size.name}</span>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>~{size.shortcuts} shortcuts</span>
                </button>
              ))}
            </div>
          </div>



          <button
            onClick={startLayout}
            disabled={!(layoutType === 'single' ? selectedApp : selectedApps.length > 0) || !layoutSize}
            style={{
              width: '100%',
              padding: '16px',
              background: (layoutType === 'single' ? selectedApp : selectedApps.length > 0) && layoutSize ? '#3b82f6' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (layoutType === 'single' ? selectedApp : selectedApps.length > 0) && layoutSize ? 'pointer' : 'not-allowed'
            }}
          >
            Create Layout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: isDarkMode ? '#0f172a' : 'radial-gradient(80% 60% at 50% -20%, #e2f2ff 0%, transparent 60%), linear-gradient(to bottom, #ffffff, transparent 40%), #ffffff',
      minHeight: '100vh',
      minWidth: '1400px',
      color: isDarkMode ? '#ffffff' : '#0f172a'
    }}>
      <div style={{
        maxWidth: '1600px',
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
          
          <div style={{ display: 'flex', height: '800px' }}>
            
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
                    width: '80%',
                    margin: '0 auto',
                    display: 'block',
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
                overflow: 'auto',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 80px 1fr 30px',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: isDarkMode ? '#374151' : '#f8fafc'
                }}>
                  <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 8px', textAlign: 'center' }}>App</div>
                  <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 8px' }}>Key</div>
                  <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 8px' }}>Description</div>
                  <div style={{ textAlign: 'center', padding: '0 8px' }}>♥</div>
                </div>
                
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
) : filteredShortcuts.map((shortcut, index) => {
                  const isUsed = isShortcutUsed(shortcut);
                  return (
                  <div key={index} style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 80px 1fr 30px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    alignItems: 'center',
                    background: isUsed ? '#f0f9ff' : 'transparent',
                    opacity: isUsed ? 0.7 : 1
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify(shortcut));
                    
                    // Create custom drag image
                    const dragElement = document.createElement('div');
                    dragElement.style.cssText = `
                      position: absolute;
                      top: -1000px;
                      background: white;
                      border: 1px solid #3b82f6;
                      border-radius: 4px;
                      padding: 4px 8px;
                      font-size: 10px;
                      font-weight: 600;
                      color: #1e40af;
                      white-space: nowrap;
                      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                    `;
                    dragElement.innerHTML = `
                      <div style="font-weight: 700; margin-bottom: 2px;">${shortcut.key}</div>
                      <div style="font-size: 8px; color: #64748b;">${shortcut.command.substring(0, 20)}...</div>
                    `;
                    
                    document.body.appendChild(dragElement);
                    e.dataTransfer.setDragImage(dragElement, 50, 20);
                    
                    setTimeout(() => document.body.removeChild(dragElement), 0);
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 8px', display: 'flex', justifyContent: 'center' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: getAppIcon(shortcut.app).bg,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}>
                        {getAppIcon(shortcut.app).text}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: isUsed ? '#3b82f6' : (isDarkMode ? '#ffffff' : '#0f172a'), borderRight: '1px solid #e2e8f0', padding: '0 8px', fontWeight: '600', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {shortcut.key}
                      {isUsed && (
                        <span 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeShortcutFromLayout(shortcut);
                          }}
                          style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', fontSize: '10px' }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: isUsed ? '#3b82f6' : (isDarkMode ? '#9ca3af' : '#64748b'), borderRight: '1px solid #e2e8f0', padding: '0 8px' }}>
                      {shortcut.command}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(index);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '16px',
                        cursor: 'pointer',
                        color: favorites.has(index) ? '#ef4444' : '#9ca3af',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    >
                      ♥
                    </button>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Canvas Area */}
            <div style={{
              flex: 1,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Layout Controls */}
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#ffffff' : '#0f172a'
                }}>Text Size:</label>
                <select 
                  value={textSize}
                  onChange={(e) => setTextSize(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="medium">Standard Text (42 shortcuts)</option>
                  <option value="large">Large Text (28 shortcuts)</option>
                </select>
                <div style={{
                  fontSize: '12px',
                  color: '#64748b'
                }}>3.75" Sticker</div>
                <button
                  onClick={addSection}
                  disabled={Math.ceil((customSections.length + 1) / 2) * 120 + 60 > 600}
                  style={{
                    padding: '6px 12px',
                    background: Math.ceil((customSections.length + 1) / 2) * 120 + 60 > 600 ? '#ccc' : '#00aaff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: Math.ceil((customSections.length + 1) / 2) * 120 + 60 > 600 ? 'not-allowed' : 'pointer'
                  }}
                >
                  + Add Section
                </button>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b'
                }}>
                  {getTotalShortcuts()}/{MAX_TOTAL_SHORTCUTS} shortcuts
                </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedShortcuts({});
                      setCustomSections([
                        { id: 0, name: 'Section 1' },
                        { id: 1, name: 'Section 2' }
                      ]);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Layout
                  </button>
                  <button
                    onClick={() => {
                      setShowLayout(false);
                      setSelectedApp('');
                      setSelectedApps([]);
                      setLayoutType('');
                      setLayoutSize('');
                      setSelectedShortcuts({});
                      setCustomSections([
                        { id: 0, name: 'Section 1' },
                        { id: 1, name: 'Section 2' }
                      ]);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Start Over
                  </button>
                </div>
              </div>
              
              {/* Layout Grid */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  width: '600px',
                  minHeight: '600px',
                  padding: '30px',
                  background: '#ffffff',
                  border: '3px solid #00aaff',
                  borderRadius: '20px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    {customSections.map((section) => (
                      <div key={section.id} style={{
                        background: '#ffffff',
                        border: '2px solid #00aaff',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}>
                        <input
                          value={section.name}
                          onChange={(e) => updateSectionName(section.id, e.target.value)}
                          style={{
                            margin: '0 0 8px 0',
                            fontSize: textSize === 'large' ? '14px' : '12px',
                            fontWeight: '700',
                            color: '#000000',
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            width: '100%'
                          }}
                        />
                        {customSections.length > 1 && (
                          <button
                            onClick={() => removeSection(section.id)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              fontSize: '10px',
                              cursor: 'pointer'
                            }}
                          >
                            ×
                          </button>
                        )}
                        <div 
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}
                          onDoubleClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                        >
                          {Array.from({ length: editingSection === section.id ? (selectedShortcuts[section.id] || []).filter(s => s).length + 1 : Math.max((selectedShortcuts[section.id] || []).filter(s => s).length + 1, section.id < 2 ? 3 : 1) }, (_, slotIndex) => {
                            const shortcut = (selectedShortcuts[section.id] || [])[slotIndex];
                            const sectionShortcuts = (selectedShortcuts[section.id] || []).filter(s => s).length;
                            // Calculate character limit based on actual available space in section
                            const sectionWidth = (600 - 60 - 12) / 2; // (total width - padding - gap) / 2 columns
                            const availableWidth = sectionWidth - 24 - 50; // section width - section padding - key width
                            const charWidth = textSize === 'large' ? 6 : 5; // approximate character width in pixels
                            const maxChars = Math.max(15, Math.floor(availableWidth / charWidth)); // minimum 15 chars
                            return (
                              <div 
                                key={slotIndex}
                                style={{
                                  background: '#ffffff',
                                  border: 'none',
                                  borderRadius: '0px',
                                  height: 'auto',
                                  minHeight: textSize === 'large' ? '28px' : '24px',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'flex-start',
                                  padding: '2px 0px',
                                  fontSize: textSize === 'large' ? '10px' : '9px',
                                  color: shortcut ? '#000000' : '#cccccc',
                                  fontWeight: '400',
                                  lineHeight: '1.2'
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const droppedShortcut = JSON.parse(e.dataTransfer.getData('text/plain'));
                                  
                                  // Check limits
                                  if (sectionShortcuts >= MAX_SHORTCUTS_PER_SECTION) {
                                    alert(`Maximum ${MAX_SHORTCUTS_PER_SECTION} shortcuts per section`);
                                    return;
                                  }
                                  if (getTotalShortcuts() >= MAX_TOTAL_SHORTCUTS) {
                                    alert(`Maximum ${MAX_TOTAL_SHORTCUTS} total shortcuts`);
                                    return;
                                  }
                                  
                                  setSelectedShortcuts(prev => {
                                    const newShortcuts = [...(prev[section.id] || [])];
                                    newShortcuts[slotIndex] = droppedShortcut;
                                    return {
                                      ...prev,
                                      [section.id]: newShortcuts
                                    };
                                  });
                                }}
                                onDragOver={(e) => e.preventDefault()}
                              >
                                {shortcut ? (
                                  <>
                                    <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                                      <div style={{ fontWeight: '700', fontSize: textSize === 'large' ? '10px' : '9px', minWidth: '50px' }}>{shortcut.key}</div>
                                      <div style={{ fontSize: textSize === 'large' ? '10px' : '9px', color: '#000000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                        {shortcut.command.substring(0, maxChars)}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ display: 'flex', width: '100%', gap: '8px' }}>
                                    <div style={{ fontWeight: '700', fontSize: textSize === 'large' ? '10px' : '9px', minWidth: '50px', color: '#cccccc' }}>Key</div>
                                    <div style={{ fontSize: textSize === 'large' ? '10px' : '9px', color: '#cccccc', flex: 1 }}>Description</div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Bottom spacer to ensure padding */}
                    <div style={{ gridColumn: '1 / -1', height: '1px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}