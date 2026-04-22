import { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../shell/AppShell';
import { useAuth } from '../contexts/AuthContext';
import {
  COLOR_PALETTES,
  TYPOGRAPHY,
  IMAGE_SIZES,
  TEXT_SIZES,
  getSpacing,
  formatShortcutKey,
  getMaxSections,
  getMaxShortcutsPerSection,
  calculateSectionCapacity,
  calculateColumnCapacity
} from '../constants/designSystem';
import { exportToPNG, exportToSVG } from '../utils/exportCanvas';
import {
  saveLayoutToFile,
  loadLayoutFromFile,
  saveToLocalStorage,
  loadFromLocalStorage,
  serializeLayout,
  validateLayout
} from '../utils/layoutStorage';
import SaveModal from '../components/SaveModal';
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLayoutName, setSaveLayoutName] = useState('');
  const { isDarkMode } = useDarkMode();
  const { isAuthenticated, token } = useAuth();
  const canvasRef = useRef(null);
  const zoomContainerRef = useRef(null);

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stickerPosition, setStickerPosition] = useState({ x: 100, y: 100 });
  const [stickerZoom, setStickerZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [touchStartDistance, setTouchStartDistance] = useState(0);
  const [touchStartZoom, setTouchStartZoom] = useState(1);
  const [lockedSections, setLockedSections] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null); // { x, y } or null
  const [reorderDrag, setReorderDrag] = useState(null); // { sectionId, fromIndex } or null
  const [sectionDrag, setSectionDrag] = useState(null); // index in customSections being dragged
  const [sectionDragOver, setSectionDragOver] = useState(null); // index being hovered for drop indicator
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });


  // Column-aware capacity: per-section limits based on column position
  const columnCapacity = calculateColumnCapacity(imageSize, textSize, customSections.length, !!layoutTitle);
  const perSectionLimits = columnCapacity.perSection; // array matching customSections order
  const MAX_TOTAL_SHORTCUTS = columnCapacity.total;

  // Helper: get the per-section shortcut limit for a given section index
  const getSectionLimit = (sectionIndex) => perSectionLimits[sectionIndex] ?? perSectionLimits[0] ?? 10;

  const getTotalShortcuts = () => {
    return Object.values(selectedShortcuts).reduce((total, section) =>
      total + (section || []).filter(s => s).length, 0
    );
  };

  const addSection = () => {
    const maxSections = getMaxSections(textSize, imageSize, !!layoutTitle);
    if (customSections.length >= maxSections) {
      alert(`Maximum ${maxSections} sections for this layout configuration.`);
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
      setLockedSections(prev => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  };

  const toggleSectionLock = (sectionId) => {
    setLockedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  const handleCanvasContextMenu = (e) => {
    e.preventDefault();
    // Position relative to the viewport
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenu(null);

  // Remove a single shortcut from a section by index and compact the array
  const deleteShortcutFromSection = (sectionId, index) => {
    setSelectedShortcuts(prev => {
      const arr = [...(prev[sectionId] || [])];
      arr.splice(index, 1);
      // Compact: remove trailing nulls
      while (arr.length > 0 && arr[arr.length - 1] == null) arr.pop();
      return { ...prev, [sectionId]: arr };
    });
  };

  // Reorder a shortcut within a section (move fromIndex → toIndex)
  const reorderShortcutInSection = (sectionId, fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setSelectedShortcuts(prev => {
      const arr = [...(prev[sectionId] || [])].filter(s => s); // compact first
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return { ...prev, [sectionId]: arr };
    });
  };

  // Add a shortcut to the end of a section (compact, no gaps)
  const addShortcutToSection = (sectionId, shortcut) => {
    setSelectedShortcuts(prev => {
      const arr = [...(prev[sectionId] || [])].filter(s => s); // compact
      arr.push(shortcut);
      return { ...prev, [sectionId]: arr };
    });
  };

  // Reorder sections in the grid (move fromIndex → toIndex in customSections array)
  const reorderSections = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setCustomSections(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  };

  // Move a shortcut from one section to another (cross-section drag)
  const moveShortcutBetweenSections = (fromSectionId, fromIndex, toSectionId, toIndex) => {
    setSelectedShortcuts(prev => {
      const fromArr = [...(prev[fromSectionId] || [])].filter(s => s);
      const toArr = [...(prev[toSectionId] || [])].filter(s => s);
      if (fromIndex >= fromArr.length) return prev;
      const [moved] = fromArr.splice(fromIndex, 1);
      if (toIndex !== undefined && toIndex !== null) {
        toArr.splice(toIndex, 0, moved);
      } else {
        toArr.push(moved);
      }
      return { ...prev, [fromSectionId]: fromArr, [toSectionId]: toArr };
    });
  };

  const updateSectionName = (sectionId, newName) => {
    setCustomSections(customSections.map(s =>
      s.id === sectionId ? { ...s, name: newName } : s
    ));
  };

  const fetchShortcuts = async (search = '') => {
    // For canvas tab, we don't need to fetch - we use local state
    if (activeTab === 'canvas') return;

    console.log('🔍 fetchShortcuts called with search:', search); // DEBUG

    setLoading(true);
    try {
      const url = `http://localhost:3001/api/shortcuts?search=${encodeURIComponent(search)}`;
      console.log('📡 Fetching URL:', url); // DEBUG
      const response = await fetch(url);

      // Check if response is ok
      if (!response.ok) {
        console.error('Backend error:', response.status, response.statusText);
        setShortcuts([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('📦 Received data:', data.length, 'shortcuts'); // DEBUG

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error('Invalid data format:', data);
        setShortcuts([]);
        setLoading(false);
        return;
      }

      // If there's a search term, show all matching shortcuts across all apps
      // If no search term, filter by selected apps
      let filteredData = data;

      if (!search.trim()) {
        // No search term - filter by selected apps
        const hasSelectedApps = layoutType === 'single' ? selectedApp : selectedApps.length > 0;
        if (hasSelectedApps) {
          const appsToFilter = layoutType === 'single' ? [selectedApp] : selectedApps;
          filteredData = data.filter(shortcut => appsToFilter.includes(shortcut.app));
          console.log('🔧 Filtered by apps:', appsToFilter, '→', filteredData.length, 'results'); // DEBUG
        }

        // Only filter by platform when NOT searching
        if (selectedPlatforms.length > 0) {
          const beforePlatformFilter = filteredData.length;
          filteredData = filteredData.filter(shortcut =>
            selectedPlatforms.includes(shortcut.platform) || !shortcut.platform
          );
          console.log('🖥️  Filtered by platforms:', selectedPlatforms, '→', beforePlatformFilter, '→', filteredData.length, 'results'); // DEBUG
        }
      } else {
        console.log('🔎 Search mode - showing all', filteredData.length, 'results (no platform filter)'); // DEBUG
      }

      console.log('✅ Final shortcuts to display:', filteredData.length); // DEBUG
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
    if (showLayout && activeTab !== 'canvas') {
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
        newState[sectionIndex] = newState[sectionIndex].filter(shortcut =>
          !(shortcut && shortcut.key === shortcutToRemove.key && shortcut.command === shortcutToRemove.command)
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

    // Save current zoom level and reset to 100% for export
    const originalZoom = canvasZoom;
    setCanvasZoom(1);

    // Wait for zoom reset and React to re-render
    await new Promise(resolve => setTimeout(resolve, 200));

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
      // Restore original zoom level
      setCanvasZoom(originalZoom);
    }
  };

  const handleExportSVG = () => {
    if (!canvasRef.current) {
      alert('Canvas not found');
      return;
    }

    try {
      const appNames = layoutType === 'single' ? selectedApp : selectedApps.join('-');
      const filename = `sticker-${appNames}-${imageSize}-${textSize}-${colorPalette}.svg`;

      // Prepare layout data for SVG generation
      const layoutData = {
        palette,
        spacing,
        typography,
        imageSize,
        sections: customSections.map(section => ({
          ...section,
          shortcuts: (selectedShortcuts[section.id] || []).filter(s => s)
        })),
        title: layoutTitle
      };

      exportToSVG(canvasRef.current, imageSize, layoutData, filename);
      alert('SVG exported successfully!');
    } catch (error) {
      console.error('SVG export failed:', error);
      alert('SVG export failed. Please try again.');
    }
  };

  const handleSaveLayout = () => {
    // Generate default name if not set
    if (!saveLayoutName) {
      const appNames = layoutType === 'single' ? selectedApp : selectedApps.join('-');
      setSaveLayoutName(`${appNames} Layout`);
    }
    setShowSaveModal(true);
  };

  const handleSaveToAccount = async () => {
    if (!saveLayoutName) {
      alert('Please enter a layout name');
      return;
    }

    const layoutData = serializeLayout({
      layoutType,
      selectedApp,
      selectedApps,
      imageSize,
      textSize,
      colorPalette,
      layoutTitle,
      customSections,
      selectedShortcuts,
      selectedPlatforms,
      lockedSections: [...lockedSections]
    });

    try {
      const response = await fetch('http://localhost:3001/api/layouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: saveLayoutName,
          data: layoutData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save layout');
      }

      alert('Layout saved to your account!');
      setShowSaveModal(false);
      setSaveLayoutName('');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSaveToBrowser = () => {
    if (!saveLayoutName) {
      alert('Please enter a layout name');
      return;
    }

    const layoutData = serializeLayout({
      layoutType,
      selectedApp,
      selectedApps,
      imageSize,
      textSize,
      colorPalette,
      layoutTitle,
      customSections,
      selectedShortcuts,
      selectedPlatforms,
      lockedSections: [...lockedSections]
    });

    saveToLocalStorage(layoutData);
    alert('Layout saved to browser! (Temporary storage)');
    setShowSaveModal(false);
  };

  const handleDownloadJSON = () => {
    if (!saveLayoutName) {
      alert('Please enter a layout name');
      return;
    }

    const layoutData = serializeLayout({
      layoutType,
      selectedApp,
      selectedApps,
      imageSize,
      textSize,
      colorPalette,
      layoutTitle,
      customSections,
      selectedShortcuts,
      selectedPlatforms,
      lockedSections: [...lockedSections]
    });

    const appNames = layoutType === 'single' ? selectedApp : selectedApps.join('-');
    const filename = `${saveLayoutName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`;

    saveLayoutToFile(layoutData, filename);
    alert('Layout downloaded as JSON!');
  };

  const handleExportPNGFromModal = async () => {
    setShowSaveModal(false);
    await handleExportPNG();
  };

  const handleExportSVGFromModal = async () => {
    setShowSaveModal(false);
    await handleExportSVG();
  };

  const handleLoadLayout = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const layoutData = await loadLayoutFromFile(file);


      if (!validateLayout(layoutData)) {
        alert('Invalid layout file');
        return;
      }

      // Restore state
      setLayoutType(layoutData.layoutType);
      setSelectedApp(layoutData.selectedApp || '');
      setSelectedApps(layoutData.selectedApps || []);
      setImageSize(layoutData.imageSize);
      setTextSize(layoutData.textSize);
      setColorPalette(layoutData.colorPalette);
      setLayoutTitle(layoutData.layoutTitle || '');
      setCustomSections(layoutData.customSections);
      setSelectedShortcuts(layoutData.selectedShortcuts);
      setSelectedPlatforms(layoutData.selectedPlatforms || []);
      setLockedSections(new Set(layoutData.lockedSections || []));
      setShowLayout(true);

      alert('Layout loaded successfully!');
    } catch (error) {
      console.error('Failed to load layout:', error);
      alert('Failed to load layout. Please check the file.');
    }

    // Reset file input
    event.target.value = '';
  };

  const handleStickerMouseDown = (e) => {
    if (e.target.closest('.sticker-content')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - stickerPosition.x,
        y: e.clientY - stickerPosition.y
      });
    }
  };

  const handleStickerMouseMove = (e) => {
    if (isDragging) {
      setStickerPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleStickerMouseUp = () => {
    setIsDragging(false);
  };

  const setZoomLevel = (level) => {
    setCanvasZoom(level);
  };

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  // Attach non-passive touch/wheel listeners for zoom (React events are passive by default)
  useEffect(() => {
    const el = zoomContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setCanvasZoom(prev => Math.max(0.5, Math.min(2, prev + delta)));
      }
    };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        setTouchStartDistance(distance);
        setTouchStartZoom(canvasZoom);
      }
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches);
        if (touchStartDistance === 0) return;
        const scale = distance / touchStartDistance;
        const newZoom = touchStartZoom * scale;
        setCanvasZoom(Math.max(0.5, Math.min(2, newZoom)));
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        setTouchStartDistance(0);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);

    // Panning: click-and-drag to scroll the container when zoomed
    const onMouseDown = (e) => {
      // Only pan on direct clicks on the container background (not on sections, buttons, etc.)
      if (e.target !== el && !e.target.closest('[data-print-canvas]') === null) return;
      // Don't pan if clicking inside a section or on interactive elements
      if (e.target.closest('button, input, select, [draggable="true"], [data-section-handle]')) return;
      // Middle-click always pans, left-click only on the container/canvas background
      if (e.button !== 1 && e.button !== 0) return;
      if (e.button === 0 && e.target !== el) {
        // Left-click: only pan if clicking directly on the zoom wrapper or canvas background
        const isCanvasBg = e.target.closest('[data-print-canvas]') && !e.target.closest('[data-section-handle]') && !e.target.closest('[draggable]');
        if (!isCanvasBg && e.target !== el) return;
      }

      setIsPanning(true);
      setPanStart({
        x: e.clientX,
        y: e.clientY,
        scrollLeft: el.scrollLeft,
        scrollTop: el.scrollTop
      });
      el.style.cursor = 'grabbing';
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      el.scrollLeft = panStart.scrollLeft - dx;
      el.scrollTop = panStart.scrollTop - dy;
    };

    const onMouseUp = () => {
      if (isPanning) {
        setIsPanning(false);
        el.style.cursor = '';
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [canvasZoom, touchStartDistance, touchStartZoom, isPanning, panStart]);

  // Close context menu on any click
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  // Check for layout to load from UserHome
  useEffect(() => {
    const loadLayoutData = localStorage.getItem('loadLayout');
    if (loadLayoutData) {
      try {
        const layout = JSON.parse(loadLayoutData);
        const layoutData = layout.data;

        if (validateLayout(layoutData)) {
          // Restore state
          setLayoutType(layoutData.layoutType);
          setSelectedApp(layoutData.selectedApp || '');
          setSelectedApps(layoutData.selectedApps || []);
          setImageSize(layoutData.imageSize);
          setTextSize(layoutData.textSize);
          setColorPalette(layoutData.colorPalette);
          setLayoutTitle(layoutData.layoutTitle || '');
          setCustomSections(layoutData.customSections);
          setSelectedShortcuts(layoutData.selectedShortcuts);
          setSelectedPlatforms(layoutData.selectedPlatforms || []);
          setLockedSections(new Set(layoutData.lockedSections || []));
          setSaveLayoutName(layout.name || '');
          setShowLayout(true);

          // Clear the localStorage item after loading
          localStorage.removeItem('loadLayout');
        }
      } catch (error) {
        console.error('Failed to load layout from UserHome:', error);
        localStorage.removeItem('loadLayout');
      }
    }
  }, []);

  // Render a single section — used by both left and right columns
  const renderSection = (section, sectionIndex) => {
    const isLocked = lockedSections.has(section.id);
    const sectionShortcutCount = (selectedShortcuts[section.id] || []).filter(s => s).length;
    const isSectionBeingDragged = sectionDrag === sectionIndex;
    const isSectionDragTarget = sectionDragOver === sectionIndex && sectionDrag !== null && sectionDrag !== sectionIndex;
    return (
      <div
        key={section.id}
        onDragOver={(e) => {
          // Only respond to section reorder drags
          if (sectionDrag === null) return;
          e.preventDefault();
          e.stopPropagation();
          setSectionDragOver(sectionIndex);
        }}
        onDragLeave={() => {
          if (sectionDragOver === sectionIndex) setSectionDragOver(null);
        }}
        onDrop={(e) => {
          const sectionData = e.dataTransfer.getData('application/section-reorder');
          if (!sectionData) return;
          e.preventDefault();
          e.stopPropagation();
          const { fromIndex } = JSON.parse(sectionData);
          reorderSections(fromIndex, sectionIndex);
          setSectionDrag(null);
          setSectionDragOver(null);
        }}
        style={{
          background: palette.sectionBackground,
          border: isSectionDragTarget
            ? `2px solid #3b82f6`
            : `${spacing.sectionBorderWidth}px solid ${palette.sectionBorder}`,
          borderRadius: `${spacing.sectionBorderRadius}px`,
          padding: `${spacing.sectionPadding}px`,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
          opacity: isSectionBeingDragged ? 0.4 : 1,
          transition: 'opacity 0.15s ease, border-color 0.15s ease',
          // Locked sections shrink to content; unlocked stretch to fill
          ...(isLocked
            ? { flex: '0 0 auto', alignSelf: 'flex-start' }
            : { flex: 1 })
        }}>
        <div
          data-section-handle
          draggable={!isExporting}
          onDragStart={(e) => {
            e.stopPropagation();
            e.dataTransfer.setData('application/section-reorder', JSON.stringify({ fromIndex: sectionIndex }));
            e.dataTransfer.effectAllowed = 'move';
            setSectionDrag(sectionIndex);
          }}
          onDragEnd={() => {
            setSectionDrag(null);
            setSectionDragOver(null);
          }}
          style={{
            margin: '0 0 10px 0',
            fontSize: typography.sectionHeader,
            fontWeight: TYPOGRAPHY.fontWeights.bold,
            color: palette.text,
            fontFamily: TYPOGRAPHY.fontFamily.primary,
            lineHeight: 1.5,
            paddingBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: !isExporting ? 'grab' : 'default'
          }}
        >
          {editingSection === section.id && !isExporting ? (
            <input
              autoFocus
              defaultValue={section.name}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val) {
                  updateSectionName(section.id, val);
                } else {
                  // Revert to original name on empty input
                  e.target.value = section.name;
                }
                setEditingSection(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = e.target.value.trim();
                  if (!val) {
                    // Visual feedback: flash red border for empty name
                    e.target.style.border = '1px solid #ef4444';
                    e.target.style.animation = 'none';
                    void e.target.offsetWidth; // trigger reflow
                    e.target.style.animation = 'shake 0.3s ease';
                    return; // don't blur — keep editing
                  }
                  e.target.blur(); // triggers onBlur → saves
                } else if (e.key === 'Escape') {
                  e.target.value = section.name; // revert before blur fires
                  e.target.blur();
                }
              }}
              onChange={(e) => {
                // Reset border color when user starts typing again
                e.target.style.border = `1px solid ${palette.border}`;
              }}
              style={{
                fontSize: 'inherit',
                fontWeight: 'inherit',
                fontFamily: 'inherit',
                color: 'inherit',
                background: 'transparent',
                border: `1px solid ${palette.border}`,
                borderRadius: '4px',
                padding: '0 4px',
                outline: 'none',
                width: '100%',
                maxWidth: '200px',
                lineHeight: 'inherit',
                transition: 'border-color 0.2s ease'
              }}
            />
          ) : (
            <span
              onDoubleClick={() => { if (!isExporting) setEditingSection(section.id); }}
              style={{ cursor: isExporting ? 'default' : 'text' }}
              title={isExporting ? '' : 'Double-click to rename'}
            >
              {section.name}
            </span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isExporting && (
              <button
                onClick={() => toggleSectionLock(section.id)}
                title={isLocked ? 'Unlock section to edit' : 'Lock section (finalize)'}
                style={{
                  background: isLocked ? '#dc2626' : '#22c55e',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  lineHeight: 1.4,
                  color: '#ffffff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                {isLocked ? '🔒' : '🔓'}
                <span style={{ fontSize: '9px' }}>{isLocked ? 'Locked' : 'Open'}</span>
              </button>
            )}
          </div>
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
            ...(isLocked ? {} : { flex: 1 }),
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            overflow: isLocked ? 'visible' : 'auto',
            minHeight: 0
          }}
        >
          {/* Filled shortcut rows — draggable for reorder, with delete */}
          {(selectedShortcuts[section.id] || []).filter(s => s).map((shortcut, idx) => {
            const formattedKey = formatShortcutKey(shortcut.key, shortcut.platform || 'macos');
            return (
              <div
                key={`filled-${idx}`}
                draggable={!isExporting && !isLocked}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setReorderDrag({ sectionId: section.id, fromIndex: idx });
                  e.dataTransfer.setData('application/reorder', JSON.stringify({ sectionId: section.id, fromIndex: idx }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setReorderDrag(null)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Check if this is a reorder/move from a section
                  const reorderData = e.dataTransfer.getData('application/reorder');
                  if (reorderData) {
                    const { sectionId: fromSection, fromIndex } = JSON.parse(reorderData);
                    if (fromSection === section.id) {
                      // Same section — reorder
                      reorderShortcutInSection(section.id, fromIndex, idx);
                    } else if (!isLocked && !lockedSections.has(fromSection)) {
                      // Cross-section move — check capacity
                      const filledCount = (selectedShortcuts[section.id] || []).filter(s => s).length;
                      if (filledCount < getSectionLimit(sectionIndex)) {
                        moveShortcutBetweenSections(fromSection, fromIndex, section.id, idx);
                      }
                    }
                    return;
                  }
                  // Otherwise it's a new shortcut from the sidebar — insert at this position
                  try {
                    const droppedShortcut = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const filledCount = (selectedShortcuts[section.id] || []).filter(s => s).length;
                    if (filledCount >= getSectionLimit(sectionIndex) || getTotalShortcuts() >= MAX_TOTAL_SHORTCUTS) return;
                    setSelectedShortcuts(prev => {
                      const arr = [...(prev[section.id] || [])].filter(s => s);
                      arr.splice(idx, 0, droppedShortcut);
                      return { ...prev, [section.id]: arr };
                    });
                  } catch (_) { }
                }}
                style={{
                  background: reorderDrag && reorderDrag.sectionId === section.id && reorderDrag.fromIndex === idx
                    ? (isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)')
                    : 'transparent',
                  border: 'none',
                  borderRadius: '0px',
                  minHeight: textSize === 'large' ? '22px' : textSize === 'medium' ? '20px' : '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  padding: `${spacing.shortcutRowGap[textSize]}px 0px`,
                  fontSize: typography.description,
                  color: palette.text,
                  fontWeight: TYPOGRAPHY.fontWeights.regular,
                  lineHeight: typography.lineHeight,
                  fontFamily: TYPOGRAPHY.fontFamily.primary,
                  letterSpacing: TYPOGRAPHY.letterSpacing,
                  cursor: (!isExporting && !isLocked) ? 'grab' : 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget.querySelector('[data-delete-btn]');
                  if (btn) btn.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.querySelector('[data-delete-btn]');
                  if (btn) btn.style.opacity = '0';
                }}
              >
                <div style={{
                  display: 'flex',
                  width: '100%',
                  gap: `${spacing.keyDescriptionGap}px`,
                  alignItems: 'flex-start'
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
                    flex: 1,
                    fontFamily: TYPOGRAPHY.fontFamily.primary,
                    textAlign: 'left',
                    lineHeight: typography.lineHeight,
                    wordBreak: 'break-word',
                    hyphens: 'auto'
                  }}>
                    {shortcut.command}
                  </div>
                </div>
                {/* Delete button — floating overlay, visible on hover only */}
                {!isExporting && !isLocked && (
                  <button
                    data-delete-btn
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteShortcutFromSection(section.id, idx);
                    }}
                    title="Remove shortcut"
                    style={{
                      position: 'absolute',
                      right: '-2px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: isDarkMode ? '#374151' : '#ffffff',
                      border: '1px solid',
                      borderColor: isDarkMode ? '#4b5563' : '#e2e8f0',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontSize: '10px',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      lineHeight: 1,
                      opacity: 0,
                      transition: 'opacity 0.15s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      zIndex: 5
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = isDarkMode ? '#374151' : '#ffffff'; }}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {/* Single drop zone at bottom — hidden when locked or exporting */}
          {!isExporting && !isLocked && (() => {
            const filledCount = (selectedShortcuts[section.id] || []).filter(s => s).length;
            if (filledCount >= getSectionLimit(sectionIndex)) return null;
            return (
              <div
                style={{
                  minHeight: textSize === 'large' ? '22px' : textSize === 'medium' ? '20px' : '18px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${spacing.shortcutRowGap[textSize]}px 0px`
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  // Check for cross-section reorder drop — append to end
                  const reorderData = e.dataTransfer.getData('application/reorder');
                  if (reorderData) {
                    const { sectionId: fromSection, fromIndex } = JSON.parse(reorderData);
                    if (fromSection !== section.id && !isLocked && !lockedSections.has(fromSection)) {
                      const filledCount = (selectedShortcuts[section.id] || []).filter(s => s).length;
                      if (filledCount < getSectionLimit(sectionIndex)) {
                        moveShortcutBetweenSections(fromSection, fromIndex, section.id, null);
                      }
                    }
                    return;
                  }
                  try {
                    const droppedShortcut = JSON.parse(e.dataTransfer.getData('text/plain'));
                    if (getTotalShortcuts() >= MAX_TOTAL_SHORTCUTS) {
                      alert(`Maximum ${MAX_TOTAL_SHORTCUTS} total shortcuts`);
                      return;
                    }
                    addShortcutToSection(section.id, droppedShortcut);
                  } catch (_) { }
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
          })()}
        </div>
      </div>
    );
  };

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
                      <span style={{ fontSize: '14px', color: '#64748b' }}>~{calculateSectionCapacity(imageSize, size.id, 4).total} shortcuts</span>
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
                    activeTab === 'all' ? "Search apps, shortcuts, or commands..." :
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
                  {activeTab === 'all' && !searchTerm && 'Showing shortcuts from selected app(s)'}
                  {activeTab === 'all' && searchTerm && 'Searching apps, shortcuts, and commands'}
                  {activeTab === 'favorites' && 'Search your favorite shortcuts'}
                  {activeTab === 'canvas' && 'Shortcuts currently on your canvas'}
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
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {/* Sticky Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 120px 1fr 30px',
                  fontSize: '14px',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: isDarkMode ? '#374151' : '#f8fafc',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10
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
                      gridTemplateColumns: '40px 120px 1fr 30px',
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
                            cursor: 'default'
                          }}
                          title={shortcut.app}
                        >
                          {getAppIcon(shortcut.app).text}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isUsed ? '#3b82f6' : (isDarkMode ? '#ffffff' : '#0f172a'),
                        borderRight: '1px solid #e2e8f0',
                        padding: '0 8px',
                        fontWeight: '600',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        wordBreak: 'break-word',
                        lineHeight: '1.3'
                      }}>
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
              {/* Disclaimer Banner */}
              <div style={{
                background: isDarkMode ? '#1e3a5f' : '#eff6ff',
                border: isDarkMode ? '1px solid #2563eb' : '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '8px 14px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: isDarkMode ? '#93c5fd' : '#1e40af',
                lineHeight: 1.4
              }}>
                <span style={{ fontSize: '14px' }}>💡</span>
                <span>
                  Drag shortcuts from the sidebar into sections. Lock a section when done to shrink it to size. Right-click the canvas to add more sections. Drag section headers to reorder.
                </span>
              </div>

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
                      onChange={(e) => {
                        const newSize = e.target.value;
                        const maxSections = getMaxSections(newSize, imageSize, !!layoutTitle);

                        // If switching to a size with fewer max sections, trim sections
                        if (customSections.length > maxSections) {
                          const trimmedSections = customSections.slice(0, maxSections);
                          setCustomSections(trimmedSections);

                          // Also remove shortcuts from deleted sections
                          setSelectedShortcuts(prev => {
                            const newShortcuts = {};
                            trimmedSections.forEach(section => {
                              if (prev[section.id]) {
                                newShortcuts[section.id] = prev[section.id];
                              }
                            });
                            return newShortcuts;
                          });

                          alert(`Switched to ${newSize} text. Reduced to ${maxSections} sections to fit.`);
                        }

                        // Trim shortcuts per section if exceeding new limit
                        const newMaxPerSection = getMaxShortcutsPerSection(newSize, imageSize, customSections.length, !!layoutTitle);
                        setSelectedShortcuts(prev => {
                          const trimmedShortcuts = {};
                          Object.keys(prev).forEach(sectionId => {
                            const sectionShortcuts = prev[sectionId].filter(s => s);
                            if (sectionShortcuts.length > newMaxPerSection) {
                              trimmedShortcuts[sectionId] = sectionShortcuts.slice(0, newMaxPerSection);
                              console.warn(`Section ${sectionId} trimmed from ${sectionShortcuts.length} to ${newMaxPerSection} shortcuts`);
                            } else {
                              trimmedShortcuts[sectionId] = prev[sectionId];
                            }
                          });
                          return trimmedShortcuts;
                        });

                        setTextSize(newSize);
                      }}
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
                      <option value="small">Small ({calculateSectionCapacity(imageSize, 'small', customSections.length, !!layoutTitle).total} shortcuts)</option>
                      <option value="medium">Medium ({calculateSectionCapacity(imageSize, 'medium', customSections.length, !!layoutTitle).total} shortcuts)</option>
                      <option value="large">Large ({calculateSectionCapacity(imageSize, 'large', customSections.length, !!layoutTitle).total} shortcuts)</option>
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
                    disabled={customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle)}
                    style={{
                      padding: '6px 12px',
                      background: customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) ? '#ccc' : '#00aaff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) ? 'not-allowed' : 'pointer',
                      opacity: customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) ? 0.5 : 1
                    }}
                  >
                    + Add Section
                  </button>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.9
                      ? '#fef2f2'
                      : getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.7
                        ? '#fffbeb'
                        : '#f0fdf4',
                    color: getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.9
                      ? '#dc2626'
                      : getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.7
                        ? '#d97706'
                        : '#16a34a',
                    border: `1px solid ${getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.9
                      ? '#fecaca'
                      : getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.7
                        ? '#fde68a'
                        : '#bbf7d0'
                      }`
                  }}>
                    {getTotalShortcuts()}/{MAX_TOTAL_SHORTCUTS} shortcuts
                    {getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.9 && ' ⚠️'}
                    {getTotalShortcuts() > MAX_TOTAL_SHORTCUTS * 0.7 && getTotalShortcuts() <= MAX_TOTAL_SHORTCUTS * 0.9 && ' ⚡'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {/* Zoom Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px' }}>
                    <button
                      onClick={() => setZoomLevel(0.5)}
                      style={{
                        padding: '4px 8px',
                        background: canvasZoom === 0.5 ? '#3b82f6' : '#e2e8f0',
                        color: canvasZoom === 0.5 ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      50%
                    </button>
                    <button
                      onClick={() => setZoomLevel(0.75)}
                      style={{
                        padding: '4px 8px',
                        background: canvasZoom === 0.75 ? '#3b82f6' : '#e2e8f0',
                        color: canvasZoom === 0.75 ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setZoomLevel(1)}
                      style={{
                        padding: '4px 8px',
                        background: canvasZoom === 1 ? '#3b82f6' : '#e2e8f0',
                        color: canvasZoom === 1 ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      100%
                    </button>
                    <button
                      onClick={() => setZoomLevel(1.5)}
                      style={{
                        padding: '4px 8px',
                        background: canvasZoom === 1.5 ? '#3b82f6' : '#e2e8f0',
                        color: canvasZoom === 1.5 ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      150%
                    </button>
                    <button
                      onClick={() => setZoomLevel(2)}
                      style={{
                        padding: '4px 8px',
                        background: canvasZoom === 2 ? '#3b82f6' : '#e2e8f0',
                        color: canvasZoom === 2 ? 'white' : '#64748b',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      200%
                    </button>
                  </div>

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
                    onClick={handleExportSVG}
                    disabled={getTotalShortcuts() === 0}
                    style={{
                      padding: '6px 12px',
                      background: getTotalShortcuts() === 0 ? '#94a3b8' : '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: getTotalShortcuts() === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    📄 Export SVG
                  </button>
                  <button
                    onClick={handleSaveLayout}
                    disabled={getTotalShortcuts() === 0}
                    style={{
                      padding: '6px 12px',
                      background: getTotalShortcuts() === 0 ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: getTotalShortcuts() === 0 ? 'not-allowed' : 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    💾 Save Layout
                  </button>
                  <label
                    style={{
                      padding: '6px 12px',
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}
                  >
                    📂 Load Layout
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleLoadLayout}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setSelectedShortcuts({});
                      setLockedSections(new Set());
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
                      setLockedSections(new Set());
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
              <div
                ref={zoomContainerRef}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  touchAction: 'none',
                  position: 'relative'
                }}
                onContextMenu={handleCanvasContextMenu}
              >
                {/* Right-click context menu */}
                {contextMenu && (
                  <div
                    style={{
                      position: 'fixed',
                      top: contextMenu.y,
                      left: contextMenu.x,
                      background: isDarkMode ? '#374151' : '#ffffff',
                      border: isDarkMode ? '1px solid #4b5563' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      zIndex: 1000,
                      padding: '4px 0',
                      minWidth: '180px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { addSection(); closeContextMenu(); }}
                      disabled={customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '8px 14px',
                        background: 'none',
                        border: 'none',
                        cursor: customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        color: isDarkMode ? '#e5e7eb' : '#1f2937',
                        opacity: customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) ? 0.4 : 1,
                        textAlign: 'left'
                      }}
                    >
                      ➕ Add Section {customSections.length >= getMaxSections(textSize, imageSize, !!layoutTitle) && '(max reached)'}
                    </button>
                    {lockedSections.size < customSections.length && (
                      <button
                        onClick={() => {
                          setLockedSections(new Set(customSections.map(s => s.id)));
                          closeContextMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 14px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: isDarkMode ? '#e5e7eb' : '#1f2937',
                          textAlign: 'left'
                        }}
                      >
                        🔒 Lock All Sections
                      </button>
                    )}
                    {lockedSections.size > 0 && (
                      <button
                        onClick={() => {
                          setLockedSections(new Set());
                          closeContextMenu();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 14px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: isDarkMode ? '#e5e7eb' : '#1f2937',
                          textAlign: 'left'
                        }}
                      >
                        🔓 Unlock All Sections
                      </button>
                    )}
                  </div>
                )}
                <div style={{
                  transform: `scale(${canvasZoom})`,
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease'
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
                      height: `${IMAGE_SIZES[imageSize].displayHeight}px`,
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

                    {/* Sections Grid — two independent flex columns */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: `${spacing.sectionGap}px`,
                      flex: 1,
                      overflow: 'hidden',
                      minHeight: 0
                    }}>
                      {/* Left column: even indices (0, 2, 4…) */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${spacing.sectionGap}px`,
                        overflow: 'hidden',
                        minHeight: 0
                      }}>
                        {customSections.filter((_, i) => i % 2 === 0).map((section) => {
                          const sectionIndex = customSections.indexOf(section);
                          return renderSection(section, sectionIndex);
                        })}
                      </div>
                      {/* Right column: odd indices (1, 3, 5…) */}
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: `${spacing.sectionGap}px`,
                        overflow: 'hidden',
                        minHeight: 0
                      }}>
                        {customSections.filter((_, i) => i % 2 === 1).map((section) => {
                          const sectionIndex = customSections.indexOf(section);
                          return renderSection(section, sectionIndex);
                        })}
                      </div>
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

      {/* Save Modal */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSaveToAccount={handleSaveToAccount}
        onSaveToBrowser={handleSaveToBrowser}
        onDownloadJSON={handleDownloadJSON}
        onExportPNG={handleExportPNGFromModal}
        onExportSVG={handleExportSVGFromModal}
        layoutName={saveLayoutName}
        setLayoutName={setSaveLayoutName}
      />
    </div >
  );
}
