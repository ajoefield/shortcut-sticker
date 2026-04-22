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
      sectionHeader: '18px',  // was 11px
      shortcutKey: '15px',    // was 9px
      description: '13px',    // was 8px
      lineHeight: 1.3
    },
    medium: {
      sectionHeader: '22px',  // was 13px
      shortcutKey: '18px',    // was 11px
      description: '16px',    // was 10px
      lineHeight: 1.3
    },
    large: {
      sectionHeader: '26px',  // was 16px
      shortcutKey: '22px',    // was 14px
      description: '19px',    // was 12px
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

// Legacy static limits (replaced by calculateSectionCapacity algorithm)
// Kept as reference for the approximate ranges at 4 sections:
//   small:  ~10/section, ~40 total
//   medium: ~8/section,  ~32 total
//   large:  ~6/section,  ~24 total

// ─── Dynamic Section Capacity Algorithm ───
// Calculates how many shortcuts actually fit in a section based on
// real pixel math: image size → available height → row height → capacity.

// Row height (px) for one shortcut line at each text size
const ROW_HEIGHTS = {
  small:  18,  // 13px desc + ~3px gap + 2px row padding
  medium: 24,  // 16px desc + ~4px gap + 4px row padding (medium rowGap×2 + lineHeight)
  large:  32   // 19px desc + ~6px gap + 7px row padding
};

// Section header height (header text + bottom margin)
const SECTION_HEADER_HEIGHT = {
  small:  30,  // 18px header + 10px margin + 2px
  medium: 36,  // 22px header + 10px margin + 4px
  large:  44   // 26px header + 10px margin + 8px
};

/**
 * Calculate how many shortcuts fit per section given the current config.
 *
 * @param {string} imageSize   – '3.75' or '3'
 * @param {string} textSize    – 'small' | 'medium' | 'large'
 * @param {number} sectionCount – number of sections currently on the canvas
 * @param {boolean} hasTitle   – whether a layout title is displayed
 * @returns {{ perSection: number, total: number }}
 */
export const calculateSectionCapacity = (imageSize, textSize, sectionCount, hasTitle = false) => {
  const size = IMAGE_SIZES[imageSize] || IMAGE_SIZES['3.75'];
  const sp   = getSpacing(imageSize);

  // Total canvas height minus outer padding (top + bottom) and border
  let availableHeight = size.displayHeight - sp.outerPadding * 2 - sp.borderWidth * 2;

  // Subtract layout title if present
  if (hasTitle) {
    const titleHeight = textSize === 'large' ? 28 : textSize === 'medium' ? 24 : 20;
    availableHeight -= titleHeight + sp.sectionGap;
  }

  // Sections are laid out in a 2-column grid.
  // Number of rows of sections = ceil(sectionCount / 2)
  const sectionRows = Math.ceil(sectionCount / 2);

  // Gaps between section rows
  const totalGaps = (sectionRows - 1) * sp.sectionGap;

  // Height available for section rows
  const heightForSections = availableHeight - totalGaps;

  // Height of one section row
  const sectionRowHeight = heightForSections / sectionRows;

  // Inside a section: subtract padding (top + bottom), border, and header
  const innerHeight = sectionRowHeight
    - sp.sectionPadding * 2
    - sp.sectionBorderWidth * 2
    - SECTION_HEADER_HEIGHT[textSize];

  // How many shortcut rows fit
  const rowH = ROW_HEIGHTS[textSize];
  const perSection = Math.max(1, Math.floor(innerHeight / rowH));

  return {
    perSection,
    total: perSection * sectionCount
  };
};

/**
 * Calculate per-column capacity for each section based on its column position.
 * Left column = even indices (0, 2, 4…), right column = odd indices (1, 3, 5…).
 * Each column independently divides its available height among its sections.
 *
 * @param {string} imageSize
 * @param {string} textSize
 * @param {number} sectionCount
 * @param {boolean} hasTitle
 * @returns {{ perSection: number[], columnCapacity: [number, number], total: number }}
 */
export const calculateColumnCapacity = (imageSize, textSize, sectionCount, hasTitle = false) => {
  const size = IMAGE_SIZES[imageSize] || IMAGE_SIZES['3.75'];
  const sp   = getSpacing(imageSize);

  let availableHeight = size.displayHeight - sp.outerPadding * 2 - sp.borderWidth * 2;
  if (hasTitle) {
    const titleHeight = textSize === 'large' ? 28 : textSize === 'medium' ? 24 : 20;
    availableHeight -= titleHeight + sp.sectionGap;
  }

  // Count sections per column (2-column grid, left=even indices, right=odd)
  const leftCount = Math.ceil(sectionCount / 2);   // indices 0,2,4…
  const rightCount = Math.floor(sectionCount / 2);  // indices 1,3,5…

  const rowH = ROW_HEIGHTS[textSize];
  const headerH = SECTION_HEADER_HEIGHT[textSize];
  const sectionOverhead = sp.sectionPadding * 2 + sp.sectionBorderWidth * 2 + headerH;

  const calcPerSection = (colCount) => {
    if (colCount === 0) return 0;
    const gaps = (colCount - 1) * sp.sectionGap;
    const heightPerSection = (availableHeight - gaps) / colCount;
    const inner = heightPerSection - sectionOverhead;
    return Math.max(1, Math.floor(inner / rowH));
  };

  const leftPer = calcPerSection(leftCount);
  const rightPer = calcPerSection(rightCount);

  // Build per-section array matching customSections order
  const perSection = [];
  for (let i = 0; i < sectionCount; i++) {
    perSection.push(i % 2 === 0 ? leftPer : rightPer);
  }

  return {
    perSection,
    columnCapacity: [leftPer * leftCount, rightPer * rightCount],
    total: leftPer * leftCount + rightPer * rightCount
  };
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
  
  // Normalize spacing between keys
  // Handle various separator formats: +, -, space, or no separator
  formatted = formatted
    .replace(/\s*\+\s*/g, ' + ')     // Normalize existing + signs with spaces
    .replace(/\s*-\s*/g, ' + ')      // Replace - with +
    .replace(/([⌘⌥⌃⇧⊞])([A-Z0-9])/g, '$1 + $2')  // Add + between symbol and letter (⌘K → ⌘ + K)
    .replace(/([A-Z])([⌘⌥⌃⇧⊞])/g, '$1 + $2')    // Add + between letter and symbol
    .replace(/\s{2,}/g, ' ')         // Remove multiple spaces
    .trim();
  
  return formatted;
};

// Helper function to get max shortcuts for current configuration
export const getMaxShortcuts = (imageSize, textSize, sectionCount = 4, hasTitle = false) => {
  return calculateSectionCapacity(imageSize, textSize, sectionCount, hasTitle).total;
};

// Helper function to get max sections for text size and image size
// Sections are in a 2-column grid, so max rows = available height / min section height
export const getMaxSections = (textSize, imageSize = '3.75', hasTitle = false) => {
  const size = IMAGE_SIZES[imageSize] || IMAGE_SIZES['3.75'];
  const sp = getSpacing(imageSize);

  let availableHeight = size.displayHeight - sp.outerPadding * 2 - sp.borderWidth * 2;
  if (hasTitle) {
    const titleHeight = textSize === 'large' ? 28 : textSize === 'medium' ? 24 : 20;
    availableHeight -= titleHeight + sp.sectionGap;
  }

  // Minimum usable section height: header + padding + at least 1 shortcut row
  const minSectionHeight = SECTION_HEADER_HEIGHT[textSize] + sp.sectionPadding * 2 + sp.sectionBorderWidth * 2 + ROW_HEIGHTS[textSize];

  // How many rows of sections can fit
  const maxRows = Math.floor((availableHeight + sp.sectionGap) / (minSectionHeight + sp.sectionGap));

  // 2 columns per row
  return Math.max(2, maxRows * 2);
};

// Helper function to get max shortcuts per section
export const getMaxShortcutsPerSection = (textSize, imageSize = '3.75', sectionCount = 4, hasTitle = false) => {
  return calculateSectionCapacity(imageSize, textSize, sectionCount, hasTitle).perSection;
};
