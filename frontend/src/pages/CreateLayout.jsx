import { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../shell/AppShell';
import {
  COLOR_PALETTES,
  TYPOGRAPHY,
  IMAGE_SIZES,
  TEXT_SIZES,
  getSpacing,
  formatShortcutKey,
  getMaxShortcuts,
  getMaxSections
} from '../constants/designSystem';
import { exportToPNG } from '../utils/exportCanvas';
import '../styles/print.css';

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
  const [imageSize, setImageSize] = useState('3.75'); // '3.75' or '3'
  const [colorPalette, setColorPalette] = useState('classic');
  const [showLayout, setShowLayout] = useState(false);
  const [apps, setApps] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const { isDarkMode } = useDarkMode();
  const canvasRef = useRef(null);

  // Get current palette
  const palette = COLOR_PALETTES[colorPalette] || COLOR_PALETTES.classic;

  // Get current spacing
  const spacing = getSpacing(imageSize);

  // Get current typography
  const typography = TYPOGRAPHY.sizes[textSize];

  const [customSections, setCustomSections] = useState([
    { id: 0, name: 'Section 1' },
    { id: 1, name: 'Section 2' }
  ]);
  const [editingSection, setEditingSection] = useState(null);
  const [layoutTitle, setLayoutTitle] = useState('');


  const MAX_SHORTCUTS_PER_SECTION = 12;
  const MAX_TOTAL_SHORTCUTS = getMaxShortcuts(imageSize, textSize);

  const getTotalShortcuts = () => {
    return Object.values(selectedShortcuts).reduce((total, section) =>
      total + (section || []).filter(s => s).length, 0
    );
  };

  const addSection = () => {
    // Check if we've reached the max sections for current text size
    const maxSections = getMaxSections(textSize);
    if (customSections.length >= maxSections) {
      alert(`Maximum ${maxSections} sections for ${textSize} text size. Maximum sections reached for legible layout.`);
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
    // For canvas tab, we don't need to fetch - we use local state
    if (activeTab === 'canvas') return;

    // Check if we have any apps selected based on layout type
    const hasSelectedApps = layoutType === 'single' ? selectedApp : selectedApps.length > 0;
    if (!hasSelectedApps) return;

    setLoading(true);
    try {
      const url = `http://localhost:3001/api/shortcuts?search=${encodeURIComponent(search)}`;
      const response = await fetch(url);
      const data = await response.json();

      let filteredData;

      // For "All Apps" tab or when searching, show results from all apps
      if (activeTab === 'all' || search.trim()) {
        // Show all matching shortcuts from any app
        filteredData = data;
      } else {
        // For other tabs when not searching, only show shortcuts from selected apps
        const appsToFilter = layoutType === 'single' ? [selectedApp] : selectedApps;
        filteredData = data.filter(shortcut => appsToFilter.includes(shortcut.app));
      }

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

  const checkPlatforms = async (appNames) => {
    // Handle both single app (string) and multiple apps (array)
    const appsToCheck = Array.isArray(appNames) ? appNames : [appNames];
    if (appsToCheck.length === 0) return;

    try {
      const url = `http://localhost:3001/api/shortcuts`;
      const response = await fetch(url);
      const data = await response.json();
      console.log('All shortcuts data sample:', data.slice(0, 3)); // Debug log

      // Filter by app names on frontend since API doesn't support app filter
      const appShortcuts = data.filter(s => appsToCheck.includes(s.app));
      console.log(`Shortcuts for ${appsToCheck.join(', ')}:`, appShortcuts.slice(0, 3)); // Debug log
      console.log(`Total shortcuts for selected apps:`, appShortcuts.length); // Debug log

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
    const hasSelectedApps = layoutType === 'single' ? selectedApp : selectedApps.length > 0;
    if (hasSelectedApps && showLayout) {
      if (searchTerm.trim() === '') {
        fetchShortcuts('');
      } else {
        const debounceTimer = setTimeout(() => {
          fetchShortcuts(searchTerm);
        }, 300);
        return () => clearTimeout(debounceTimer);
      }
    }
  }, [searchTerm, selectedApp, selectedApps, selectedPlatforms, showLayout, layoutType, activeTab]);

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

  // Get all shortcuts currently placed on canvas
  const getCanvasShortcuts = () => {
    const canvasShortcuts = [];
    Object.values(selectedShortcuts).forEach(sectionShortcuts => {
      sectionShortcuts.forEach(shortcut => {
        if (shortcut) {
          canvasShortcuts.push(shortcut);
        }
      });
    });
    return canvasShortcuts;
  };

  const filteredShortcuts = activeTab === 'favorites'
    ? shortcuts.filter((_, index) => favorites.has(index))
    : activeTab === 'canvas'
      ? getCanvasShortcuts()
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
    if (hasValidApps && imageSize) {
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

  const handleExportPNG = async () => {
    if (!canvasRef.current) {
      alert('Canvas not found');
      return;
    }

    setIsExporting(true);

    // Wait for React to re-render and hide empty slots
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const appNames = layoutType === 'single' ? selectedApp : selectedApps.join('-');
      const filename = `sticker-${appNames}-${imageSize}-${textSize}-${colorPalette}.png`;
      await exportToPNG(canvasRef.current, imageSize, filename);
      alert('PNG exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
                            const newSelectedApps = selectedApps.includes(app.name)
                              ? selectedApps.filter(name => name !== app.name)
                              : [...selectedApps, app.name];
                            setSelectedApps(newSelectedApps);
                            // Check platforms for all selected apps
                            if (newSelectedApps.length > 0) {
                              checkPlatforms(newSelectedApps);
                            } else {
                              setAvailablePlatforms([]);
                              setSelectedPlatforms([]);
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
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Image Size:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.values(IMAGE_SIZES).map(size => (
                <button
                  key={size.id}
                  onClick={() => setImageSize(size.id)}
                  style={{
                    padding: '12px 16px',
                    border: imageSize === size.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    background: imageSize === size.id ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>{size.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{size.description}</span>
                </button>
              ))}
            </div>
          </div>

          {imageSize && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Text Size:</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TEXT_SIZES.map(size => (
                  <button
                    key={size.id}
                    onClick={() => setTextSize(size.id)}
                    style={{
                      padding: '12px 16px',
                      border: textSize === size.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: textSize === size.id ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '16px', fontWeight: '500' }}>{size.name}</span>
                      <span style={{ fontSize: '14px', color: '#64748b' }}>~{IMAGE_SIZES[imageSize].shortcuts[size.id]} shortcuts</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{size.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {imageSize && (
            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Color Palette:</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.values(COLOR_PALETTES).map(pal => (
                  <button
                    key={pal.id}
                    onClick={() => setColorPalette(pal.id)}
                    style={{
                      padding: '12px 16px',
                      border: colorPalette === pal.id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      background: colorPalette === pal.id ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ width: '16px', height: '16px', backgroundColor: pal.background, border: '1px solid #e2e8f0', borderRadius: '2px' }}></div>
                      <div style={{ width: '16px', height: '16px', backgroundColor: pal.border, borderRadius: '2px' }}></div>
                      <div style={{ width: '16px', height: '16px', backgroundColor: pal.text, borderRadius: '2px' }}></div>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}



          <button
            onClick={startLayout}
            disabled={!(layoutType === 'single' ? selectedApp : selectedApps.length > 0) || !imageSize}
            style={{
              width: '100%',
              padding: '16px',
              background: (layoutType === 'single' ? selectedApp : selectedApps.length > 0) && imageSize ? '#3b82f6' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (layoutType === 'single' ? selectedApp : selectedApps.length > 0) && imageSize ? 'pointer' : 'not-allowed'
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
                  placeholder={
                    activeTab === 'all' ? "Search all shortcuts..." :
                      activeTab === 'favorites' ? "Search favorites..." :
                        "Search canvas shortcuts..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={activeTab === 'canvas'}
                  style={{
                    width: '80%',
                    margin: '0 auto',
                    display: 'block',
                    padding: '12px 16px',
                    border: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    opacity: activeTab === 'canvas' ? 0.6 : 1,
                    cursor: activeTab === 'canvas' ? 'not-allowed' : 'text'
                  }}
                />
                <p style={{
                  fontSize: '11px',
                  color: '#64748b',
                  marginTop: '6px',
                  textAlign: 'center',
                  margin: '6px 0 0 0'
                }}>
                  {activeTab === 'all' && 'Search across all applications'}
                  {activeTab === 'favorites' && 'Search your favorite shortcuts'}
                  {activeTab === 'canvas' && 'Shortcuts currently on your canvas'}
                  {searchTerm && activeTab !== 'canvas' && ' (filtered)'}
                </p>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'flex',
                padding: '16px',
                gap: '8px',
                borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e2e8f0'
              }}>
                <button
                  onClick={() => setActiveTab('all')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === 'all' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderBottom: activeTab === 'all' ? '2px solid #0f172a' : 'none',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  All Apps
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === 'favorites' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderBottom: activeTab === 'favorites' ? '2px solid #0f172a' : 'none',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  Favorites
                </button>
                <button
                  onClick={() => setActiveTab('canvas')}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: activeTab === 'canvas' ? '#0f172a' : '#64748b',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderBottom: activeTab === 'canvas' ? '2px solid #0f172a' : 'none',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  On Canvas ({getTotalShortcuts()})
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

                {loading && activeTab !== 'canvas' ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading...</div>
                ) : filteredShortcuts.map((shortcut, index) => {
                  const isUsed = activeTab === 'canvas' ? false : isShortcutUsed(shortcut);
                  const shortcutKey = activeTab === 'canvas' ? `${shortcut.key}-${shortcut.command}-${index}` : index;
                  return (
                    <div key={shortcutKey} style={{
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
                      draggable={activeTab !== 'canvas'}
                      onDragStart={(e) => {
                        if (activeTab === 'canvas') return;
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
                      <div style={{ borderRight: '1px solid #e2e8f0', padding: '0 8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            backgroundColor: getAppIcon(shortcut.app).bg,
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '10px',
                            cursor: 'help'
                          }}
                          title={shortcut.app}
                        >
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
                        {activeTab === 'canvas' && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              removeShortcutFromLayout(shortcut);
                            }}
                            style={{ cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', fontSize: '10px', marginTop: '2px' }}
                            title="Remove from canvas"
                          >
                            ✕
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '14px', color: isUsed ? '#3b82f6' : (isDarkMode ? '#9ca3af' : '#64748b'), borderRight: '1px solid #e2e8f0', padding: '0 8px' }}>
                        {shortcut.command}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activeTab !== 'canvas') {
                            toggleFavorite(index);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '16px',
                          cursor: activeTab === 'canvas' ? 'default' : 'pointer',
                          color: activeTab === 'canvas' ? '#d1d5db' : (favorites.has(index) ? '#ef4444' : '#9ca3af'),
                          display: 'block',
                          margin: '0 auto',
                          opacity: activeTab === 'canvas' ? 0.5 : 1
                        }}
                        disabled={activeTab === 'canvas'}
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
              {/* Layout Title */}
              <div style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <label style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isDarkMode ? '#ffffff' : '#0f172a'
                }}>
                  Layout Title:
                </label>
                <input
                  type="text"
                  value={layoutTitle}
                  onChange={(e) => setLayoutTitle(e.target.value)}
                  placeholder="e.g., VS Code Shortcuts"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    maxWidth: '400px'
                  }}
                />
              </div>

              {/* Layout Controls */}
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>Image:</span>
                    <span style={{ color: '#3b82f6' }}>{IMAGE_SIZES[imageSize].name}</span>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>Text:</span>
                    <select
                      value={textSize}
                      onChange={(e) => setTextSize(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        fontWeight: '500',
                        color: '#3b82f6'
                      }}
                    >
                      <option value="small">Small ({IMAGE_SIZES[imageSize].shortcuts.small} shortcuts)</option>
                      <option value="medium">Medium ({IMAGE_SIZES[imageSize].shortcuts.medium} shortcuts)</option>
                      <option value="large">Large ({IMAGE_SIZES[imageSize].shortcuts.large} shortcuts)</option>
                    </select>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isDarkMode ? '#ffffff' : '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>Palette:</span>
                    <select
                      value={colorPalette}
                      onChange={(e) => setColorPalette(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none',
                        fontWeight: '500',
                        color: '#3b82f6'
                      }}
                    >
                      {Object.values(COLOR_PALETTES).map(pal => (
                        <option key={pal.id} value={pal.id}>{pal.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={addSection}
                    disabled={customSections.length >= getMaxSections(textSize)}
                    style={{
                      padding: '6px 12px',
                      background: customSections.length >= getMaxSections(textSize) ? '#ccc' : '#00aaff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: customSections.length >= getMaxSections(textSize) ? 'not-allowed' : 'pointer',
                      opacity: customSections.length >= getMaxSections(textSize) ? 0.5 : 1
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
                    onClick={handleExportPNG}
                    disabled={isExporting || getTotalShortcuts() === 0}
                    style={{
                      padding: '6px 12px',
                      background: isExporting || getTotalShortcuts() === 0 ? '#94a3b8' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: isExporting || getTotalShortcuts() === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {isExporting ? 'Exporting...' : '📥 Export PNG'}
                  </button>
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
                      setImageSize('3.75');
                      setTextSize('medium');
                      setColorPalette('classic');
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
                <div
                  ref={canvasRef}
                  data-print-canvas
                  className={`print-size-${imageSize.replace('.', '-')}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    width: `${IMAGE_SIZES[imageSize].displayWidth}px`,
                    minHeight: `${IMAGE_SIZES[imageSize].displayHeight}px`,
                    padding: `${spacing.outerPadding}px`,
                    background: palette.background,
                    border: `${spacing.borderWidth}px solid ${palette.border}`,
                    borderRadius: `${spacing.borderRadius}px`,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                  {/* Layout Title */}
                  {layoutTitle && (
                    <div style={{
                      fontSize: textSize === 'large' ? '20px' : textSize === 'medium' ? '18px' : '16px',
                      fontWeight: TYPOGRAPHY.fontWeights.bold,
                      color: palette.text,
                      textAlign: 'center',
                      marginBottom: `${spacing.sectionGap}px`,
                      fontFamily: TYPOGRAPHY.fontFamily.primary
                    }}>
                      {layoutTitle}
                    </div>
                  )}

                  {/* Sections Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: `${spacing.sectionGap}px`,
                    flex: 1
                  }}>
                    {customSections.map((section) => (
                      <div key={section.id} style={{
                        background: palette.sectionBackground,
                        border: `${spacing.sectionBorderWidth}px solid ${palette.sectionBorder}`,
                        borderRadius: `${spacing.sectionBorderRadius}px`,
                        padding: `${spacing.sectionPadding}px`,
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative'
                      }}>
                        <div
                          style={{
                            margin: '0 0 10px 0',
                            fontSize: typography.sectionHeader,
                            fontWeight: TYPOGRAPHY.fontWeights.bold,
                            color: palette.text,
                            fontFamily: TYPOGRAPHY.fontFamily.primary,
                            lineHeight: 1.5,
                            paddingBottom: '4px'
                          }}
                        >
                          {section.name}
                        </div>
                        {customSections.length > 1 && !isExporting && (
                          <button
                            onClick={() => removeSection(section.id)}
                            className="no-export"
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
                          {/* Only show filled shortcuts, or show empty slots in edit mode */}
                          {(selectedShortcuts[section.id] || [])
                            .map((shortcut, slotIndex) => ({ shortcut, slotIndex }))
                            .filter(({ shortcut }) => shortcut || !isExporting) // Filter out null during export
                            .map(({ shortcut, slotIndex }) => {
                              const sectionShortcuts = (selectedShortcuts[section.id] || []).filter(s => s).length;
                              // Calculate character limit based on actual available space in section
                              const sectionWidth = (IMAGE_SIZES[imageSize].displayWidth - spacing.outerPadding * 2 - spacing.sectionGap) / 2;
                              const availableWidth = sectionWidth - spacing.sectionPadding * 2 - 60; // section width - padding - key width
                              const charWidth = textSize === 'large' ? 6 : textSize === 'medium' ? 5 : 4.5;
                              const maxChars = Math.max(15, Math.floor(availableWidth / charWidth));

                              // Format the shortcut key with symbols
                              const formattedKey = shortcut ? formatShortcutKey(shortcut.key, shortcut.platform || 'macos') : 'Key';

                              return (
                                <div
                                  key={slotIndex}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '0px',
                                    height: 'auto',
                                    minHeight: textSize === 'large' ? '22px' : textSize === 'medium' ? '20px' : '18px',
                                    display: shortcut ? 'flex' : (isExporting ? 'none' : 'flex'),
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    padding: `${spacing.shortcutRowGap[textSize]}px 0px`,
                                    fontSize: typography.description,
                                    color: shortcut ? palette.text : palette.placeholder,
                                    fontWeight: TYPOGRAPHY.fontWeights.regular,
                                    lineHeight: typography.lineHeight,
                                    fontFamily: TYPOGRAPHY.fontFamily.primary,
                                    letterSpacing: TYPOGRAPHY.letterSpacing
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
                                    <div style={{
                                      display: 'flex',
                                      width: '100%',
                                      gap: `${spacing.keyDescriptionGap}px`,
                                      alignItems: 'center'
                                    }}>
                                      <div style={{
                                        fontWeight: TYPOGRAPHY.fontWeights.semibold,
                                        fontSize: typography.shortcutKey,
                                        minWidth: '60px',
                                        fontFamily: TYPOGRAPHY.fontFamily.monospace,
                                        color: palette.text,
                                        whiteSpace: 'nowrap',
                                        textAlign: 'left'
                                      }}>
                                        {formattedKey}
                                      </div>
                                      <div style={{
                                        fontSize: typography.description,
                                        color: palette.textSecondary || palette.text,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        fontFamily: TYPOGRAPHY.fontFamily.primary,
                                        textAlign: 'left'
                                      }}>
                                        {shortcut.command.substring(0, maxChars)}
                                      </div>
                                    </div>
                                  ) : (
                                    !isExporting && <div style={{
                                      display: 'flex',
                                      width: '100%',
                                      gap: `${spacing.keyDescriptionGap}px`,
                                      alignItems: 'center'
                                    }}>
                                      <div style={{
                                        fontWeight: TYPOGRAPHY.fontWeights.semibold,
                                        fontSize: typography.shortcutKey,
                                        minWidth: '60px',
                                        color: palette.placeholder,
                                        fontFamily: TYPOGRAPHY.fontFamily.monospace
                                      }}>
                                        Key
                                      </div>
                                      <div style={{
                                        fontSize: typography.description,
                                        color: palette.placeholder,
                                        flex: 1,
                                        fontFamily: TYPOGRAPHY.fontFamily.primary
                                      }}>
                                        Description
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {/* Add empty slots for editing (show at least 3 slots in first 2 sections) */}
                          {!isExporting && Array.from({
                            length: Math.max(
                              3 - (selectedShortcuts[section.id] || []).filter(s => s).length,
                              section.id < 2 ? 1 : 0
                            )
                          }).map((_, emptyIndex) => {
                            const slotIndex = (selectedShortcuts[section.id] || []).length + emptyIndex;
                            return (
                              <div
                                key={`empty-${slotIndex}`}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  minHeight: textSize === 'large' ? '22px' : textSize === 'medium' ? '20px' : '18px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: `${spacing.shortcutRowGap[textSize]}px 0px`
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const droppedShortcut = JSON.parse(e.dataTransfer.getData('text/plain'));

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
                                <div style={{
                                  display: 'flex',
                                  width: '100%',
                                  gap: `${spacing.keyDescriptionGap}px`,
                                  alignItems: 'center'
                                }}>
                                  <div style={{
                                    fontWeight: TYPOGRAPHY.fontWeights.semibold,
                                    fontSize: typography.shortcutKey,
                                    minWidth: '60px',
                                    color: palette.placeholder,
                                    fontFamily: TYPOGRAPHY.fontFamily.monospace
                                  }}>
                                    Key
                                  </div>
                                  <div style={{
                                    fontSize: typography.description,
                                    color: palette.placeholder,
                                    flex: 1,
                                    fontFamily: TYPOGRAPHY.fontFamily.primary
                                  }}>
                                    Description
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {/* Bottom spacer to ensure padding */}
                    <div style={{ gridColumn: '1 / -1', height: '1px' }}></div>
                  </div>

                  {/* Logo at bottom right */}
                  <div style={{
                    position: 'absolute',
                    bottom: `${spacing.outerPadding / 2}px`,
                    right: `${spacing.outerPadding / 2}px`,
                    width: textSize === 'large' ? '60px' : textSize === 'medium' ? '50px' : '40px',
                    height: 'auto',
                    opacity: 0.7
                  }}>
                    <img
                      src="/logo.png"
                      alt="Logo"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
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