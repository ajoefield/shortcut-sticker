// Design System Constants for Sticker Layout

// Color Palettes
export const COLOR_PALETTES = {
  classic: {
    id: 'classic',
    name: 'Classic',
    background: '#FFFFFF',
    border: '#00AAFF',
    sectionBackground: '#FFFFFF',
    sectionBorder: '#00AAFF',
    text: '#000000',
    textSecondary: '#374151',
    placeholder: '#D1D5DB'
  },
  vscode: {
    id: 'vscode',
    name: 'VS Code',
    background: '#FFFFFF',
    border: '#007ACC',
    sectionBackground: '#F3F3F3',
    sectionBorder: '#007ACC',
    text: '#000000',
    textSecondary: '#374151',
    placeholder: '#D1D5DB'
  },
  kiro: {
    id: 'kiro',
    name: 'Kiro',
    background: '#FFFFFF',
    border: '#8B5CF6',
    sectionBackground: '#FFFFFF',
    sectionBorder: '#8B5CF6',
    text: '#000000',
    textSecondary: '#374151',
    placeholder: '#D1D5DB'
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    background: '#1F2937',
    border: '#60A5FA',
    sectionBackground: '#374151',
    sectionBorder: '#60A5FA',
    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    placeholder: '#6B7280'
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    background: '#FFFFFF',
    border: '#000000',
    sectionBackground: '#FFFFFF',
    sectionBorder: '#000000',
    text: '#000000',
    textSecondary: '#374151',
    placeholder: '#D1D5DB'
  }
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Inter", "SF Pro", system-ui, -apple-system, sans-serif',
    monospace: '"SF Mono", "Consolas", "Monaco", monospace'
  },
  fontWeights: {
    regular: 400,
    semibold: 600,
    bold: 700
  },
  sizes: {
    small: {
      sectionHeader: '11px',
      shortcutKey: '9px',
      description: '8px',
      lineHeight: 1.3
    },
    medium: {
      sectionHeader: '13px',
      shortcutKey: '11px',
      description: '10px',
      lineHeight: 1.3
    },
    large: {
      sectionHeader: '16px',
      shortcutKey: '14px',
      description: '12px',
      lineHeight: 1.4
    }
  },
  letterSpacing: '-0.01em'
};

// Standardized Key Symbols
export const KEY_SYMBOLS = {
  macos: {
    command: '⌘',
    option: '⌥',
    control: '⌃',
    shift: '⇧',
    delete: '⌫',
    return: '⏎',
    tab: '⇥',
    escape: '⎋',
    capslock: '⇪',
    left: '←',
    right: '→',
    up: '↑',
    down: '↓'
  },
  windows: {
    windows: '⊞',
    alt: 'Alt',
    control: 'Ctrl',
    shift: '⇧',
    delete: 'Del',
    enter: '↵',
    tab: 'Tab',
    escape: 'Esc',
    capslock: 'Caps',
    left: '←',
    right: '→',
    up: '↑',
    down: '↓'
  }
};

// Image/Sticker Sizes
export const IMAGE_SIZES = {
  '3.75': {
    id: '3.75',
    name: '3.75" Square',
    description: 'For 16" laptops',
    displayWidth: 600,
    displayHeight: 600,
    exportWidth: 1125,
    exportHeight: 1125,
    dpi: 300,
    shortcuts: {
      small: 60,
      medium: 42,
      large: 28
    }
  },
  '3': {
    id: '3',
    name: '3" Square',
    description: 'For 15" or smaller laptops',
    displayWidth: 480,
    displayHeight: 480,
    exportWidth: 900,
    exportHeight: 900,
    dpi: 300,
    shortcuts: {
      small: 48,
      medium: 36,
      large: 24
    }
  }
};

// Spacing & Layout (for 3.75" sticker)
export const SPACING_375 = {
  outerPadding: 30,
  borderWidth: 3,
  borderRadius: 20,
  sectionGap: 12,
  sectionPadding: 12,
  sectionBorderWidth: 2,
  sectionBorderRadius: 12,
  shortcutRowGap: {
    small: 2,
    medium: 3,
    large: 4
  },
  keyDescriptionGap: 8
};

// Spacing & Layout (for 3" sticker)
export const SPACING_3 = {
  outerPadding: 24,
  borderWidth: 2.5,
  borderRadius: 16,
  sectionGap: 10,
  sectionPadding: 10,
  sectionBorderWidth: 1.5,
  sectionBorderRadius: 10,
  shortcutRowGap: {
    small: 2,
    medium: 2,
    large: 3
  },
  keyDescriptionGap: 6
};

// Get spacing based on image size
export const getSpacing = (imageSize) => {
  return imageSize === '3.75' ? SPACING_375 : SPACING_3;
};

// Text Size Options
export const TEXT_SIZES = [
  { id: 'small', name: 'Small Text', description: 'More shortcuts, smaller text' },
  { id: 'medium', name: 'Medium Text', description: 'Balanced (recommended)' },
  { id: 'large', name: 'Large Text', description: 'Fewer shortcuts, larger text' }
];

// Section Limits
export const SECTION_LIMITS = {
  maxSections: {
    small: 6,
    medium: 4,
    large: 4
  },
  maxShortcutsPerSection: 12,
  maxTotalShortcuts: 60
};

// Helper function to format shortcut keys with symbols
export const formatShortcutKey = (key, platform = 'macos') => {
  if (!key) return key;
  
  const symbols = KEY_SYMBOLS[platform.toLowerCase()] || KEY_SYMBOLS.macos;
  let formatted = key;
  
  // Replace common key names with symbols
  const replacements = {
    'cmd': symbols.command || 'Cmd',
    'command': symbols.command || 'Cmd',
    'opt': symbols.option || 'Opt',
    'option': symbols.option || 'Opt',
    'ctrl': symbols.control || 'Ctrl',
    'control': symbols.control || 'Ctrl',
    'shift': symbols.shift || 'Shift',
    'del': symbols.delete || 'Del',
    'delete': symbols.delete || 'Del',
    'return': symbols.return || 'Return',
    'enter': symbols.enter || 'Enter',
    'tab': symbols.tab || 'Tab',
    'esc': symbols.escape || 'Esc',
    'escape': symbols.escape || 'Esc',
    'win': symbols.windows || 'Win',
    'windows': symbols.windows || 'Win',
    'alt': symbols.alt || 'Alt'
  };
  
  // Case-insensitive replacement
  Object.keys(replacements).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    formatted = formatted.replace(regex, replacements[key]);
  });
  
  // Add spacing between keys with "+"
  // Replace common separators (-, +, space) with " + "
  formatted = formatted
    .replace(/\s*\+\s*/g, ' + ')  // Normalize existing + signs
    .replace(/\s*-\s*/g, ' + ')   // Replace - with +
    .replace(/\s{2,}/g, ' ')      // Remove multiple spaces
    .trim();
  
  return formatted;
};

// Helper function to get max shortcuts for current configuration
export const getMaxShortcuts = (imageSize, textSize) => {
  const size = IMAGE_SIZES[imageSize];
  return size ? size.shortcuts[textSize] : 42;
};

// Helper function to get max sections for text size
export const getMaxSections = (textSize) => {
  return SECTION_LIMITS.maxSections[textSize] || 4;
};
