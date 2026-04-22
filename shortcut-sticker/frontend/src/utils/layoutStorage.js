// Layout save/load utilities

/**
 * Save layout to JSON file
 */
export const saveLayoutToFile = (layoutData, filename) => {
  const json = JSON.stringify(layoutData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Load layout from JSON file
 */
export const loadLayoutFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target.result);
        resolve(layoutData);
      } catch (error) {
        reject(new Error('Invalid layout file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Save layout to localStorage
 */
export const saveToLocalStorage = (layoutData) => {
  try {
    localStorage.setItem('lastLayout', JSON.stringify(layoutData));
    localStorage.setItem('lastLayoutTimestamp', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

/**
 * Load layout from localStorage
 */
export const loadFromLocalStorage = () => {
  try {
    const data = localStorage.getItem('lastLayout');
    const timestamp = localStorage.getItem('lastLayoutTimestamp');
    if (data) {
      return {
        layout: JSON.parse(data),
        timestamp
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

/**
 * Clear localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.removeItem('lastLayout');
    localStorage.removeItem('lastLayoutTimestamp');
    return true;
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
    return false;
  }
};

/**
 * Serialize current layout state
 */
export const serializeLayout = (state) => {
  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    layoutType: state.layoutType,
    selectedApp: state.selectedApp,
    selectedApps: state.selectedApps,
    imageSize: state.imageSize,
    textSize: state.textSize,
    colorPalette: state.colorPalette,
    layoutTitle: state.layoutTitle,
    customSections: state.customSections,
    selectedShortcuts: state.selectedShortcuts,
    selectedPlatforms: state.selectedPlatforms,
    lockedSections: state.lockedSections || []
  };
};

/**
 * Validate layout data
 */
export const validateLayout = (layoutData) => {
  if (!layoutData || typeof layoutData !== 'object') {
    return false;
  }
  
  // Check required fields
  const requiredFields = ['version', 'layoutType', 'imageSize', 'textSize', 'colorPalette'];
  for (const field of requiredFields) {
    if (!(field in layoutData)) {
      return false;
    }
  }
  
  return true;
};
