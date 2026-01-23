// Export utilities for sticker layouts

import html2canvas from 'html2canvas';

/**
 * Export canvas as PNG at 300 DPI
 * @param {HTMLElement} canvasElement - The canvas div to export
 * @param {string} imageSize - '3.75' or '3'
 * @param {string} filename - Output filename
 */
export const exportToPNG = async (canvasElement, imageSize, filename = 'sticker-layout.png') => {
  if (!canvasElement) {
    throw new Error('Canvas element not found');
  }

  // Get export dimensions at 300 DPI
  const exportDimensions = {
    '3.75': { width: 1125, height: 1125 },
    '3': { width: 900, height: 900 }
  };

  const dimensions = exportDimensions[imageSize];
  if (!dimensions) {
    throw new Error(`Invalid image size: ${imageSize}`);
  }

  // Get current display dimensions
  const displayWidth = canvasElement.offsetWidth;
  const displayHeight = canvasElement.offsetHeight;

  // Calculate scale factor
  const scaleX = dimensions.width / displayWidth;
  const scaleY = dimensions.height / displayHeight;

  try {
    // Hide elements with no-export class before capture
    const noExportElements = canvasElement.querySelectorAll('.no-export');
    noExportElements.forEach(el => el.style.display = 'none');

    // Capture canvas with html2canvas
    const canvas = await html2canvas(canvasElement, {
      scale: scaleX, // Scale up to export resolution
      useCORS: true,
      backgroundColor: null,
      logging: false,
      width: displayWidth,
      height: displayHeight,
      ignoreElements: (element) => {
        return element.classList && element.classList.contains('no-export');
      }
    });

    // Restore hidden elements
    noExportElements.forEach(el => el.style.display = '');

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 'image/png');

    return true;
  } catch (error) {
    console.error('PNG export failed:', error);
    // Restore hidden elements in case of error
    const noExportElements = canvasElement.querySelectorAll('.no-export');
    noExportElements.forEach(el => el.style.display = '');
    throw error;
  }
};

/**
 * Export canvas as SVG
 * @param {HTMLElement} canvasElement - The canvas div to export
 * @param {string} imageSize - '3.75' or '3'
 * @param {object} layoutData - Layout configuration and content
 * @param {string} filename - Output filename
 */
export const exportToSVG = (canvasElement, imageSize, layoutData, filename = 'sticker-layout.svg') => {
  // Get export dimensions at 300 DPI
  const exportDimensions = {
    '3.75': { width: 1125, height: 1125 },
    '3': { width: 900, height: 900 }
  };

  const dimensions = exportDimensions[imageSize];
  if (!dimensions) {
    throw new Error(`Invalid image size: ${imageSize}`);
  }

  // Create SVG content
  const svgContent = generateSVG(layoutData, dimensions);

  // Create blob and download
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

/**
 * Generate SVG markup from layout data
 * @param {object} layoutData - Layout configuration and content
 * @param {object} dimensions - Width and height
 * @returns {string} SVG markup
 */
const generateSVG = (layoutData, dimensions) => {
  const { width, height } = dimensions;
  const { palette, spacing, typography, sections, imageSize } = layoutData;

  // Calculate scale factor from display to export
  const displaySizes = {
    '3.75': 600,
    '3': 480
  };
  const scale = width / displaySizes[imageSize];

  // Start SVG
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
      text { font-family: 'Inter', 'SF Pro', system-ui, sans-serif; }
      .mono { font-family: 'SF Mono', 'Consolas', monospace; }
    </style>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${palette.background}" rx="${spacing.borderRadius * scale}"/>
  
  <!-- Border -->
  <rect x="${spacing.borderWidth * scale / 2}" y="${spacing.borderWidth * scale / 2}" 
        width="${width - spacing.borderWidth * scale}" height="${height - spacing.borderWidth * scale}" 
        fill="none" stroke="${palette.border}" stroke-width="${spacing.borderWidth * scale}" 
        rx="${spacing.borderRadius * scale}"/>
`;

  // Add sections
  const sectionWidth = (width - spacing.outerPadding * 2 * scale - spacing.sectionGap * scale) / 2;
  const sectionX = spacing.outerPadding * scale;
  const sectionY = spacing.outerPadding * scale;

  sections.forEach((section, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = sectionX + col * (sectionWidth + spacing.sectionGap * scale);
    const y = sectionY + row * 200 * scale; // Approximate section height

    // Section background
    svg += `
  <!-- Section ${index + 1} -->
  <rect x="${x}" y="${y}" width="${sectionWidth}" height="180" 
        fill="${palette.sectionBackground}" stroke="${palette.sectionBorder}" 
        stroke-width="${spacing.sectionBorderWidth * scale}" rx="${spacing.sectionBorderRadius * scale}"/>
  
  <!-- Section Header -->
  <text x="${x + spacing.sectionPadding * scale}" y="${y + spacing.sectionPadding * scale + typography.sectionHeader * scale}" 
        font-size="${typography.sectionHeader * scale}" font-weight="700" fill="${palette.text}">
    ${escapeXML(section.name)}
  </text>
`;

    // Add shortcuts
    section.shortcuts.forEach((shortcut, shortcutIndex) => {
      if (!shortcut) return;
      
      const shortcutY = y + spacing.sectionPadding * scale + typography.sectionHeader * scale + 10 * scale + 
                        shortcutIndex * (typography.description * scale + spacing.shortcutRowGap * scale);
      
      svg += `
  <text x="${x + spacing.sectionPadding * scale}" y="${shortcutY}" 
        font-size="${typography.shortcutKey * scale}" font-weight="600" fill="${palette.text}" class="mono">
    ${escapeXML(shortcut.key)}
  </text>
  <text x="${x + spacing.sectionPadding * scale + 60 * scale}" y="${shortcutY}" 
        font-size="${typography.description * scale}" font-weight="400" fill="${palette.textSecondary || palette.text}">
    ${escapeXML(shortcut.command)}
  </text>
`;
    });
  });

  svg += `
</svg>`;

  return svg;
};

/**
 * Escape XML special characters
 */
const escapeXML = (str) => {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};
