# Sticker Layout Visual Design Specification (Kiro)

## 1. Purpose
Define deterministic rules, constraints, and behaviors for generating professional, print-ready keyboard shortcut sticker layouts. The system produces digital image files intended for printing on sticker paper by end users or professional print services.

---

## 2. Fixed Output Dimensions

### 2.1 Supported Sticker Sizes
Only the following sticker sizes are permitted:

| Label | Physical Size | Pixel Size @300 DPI |
|------|---------------|---------------------|
| `3.75` | 3.75" × 3.75" | 1125 × 1125 px |
| `3` | 3" × 3" | 900 × 900 px |

No custom sizes are allowed.

---

### 2.2 Safe Areas
The layout must respect the following boundaries:

- **Bleed Area**: 0.125" (37.5 px @300 DPI)
- **Inner Safe Zone**: 0.2" (60 px @300 DPI)

**Rule**:
- No text, symbols, or shortcut content may render inside the inner safe zone.
- Decorative borders may extend into bleed.

---

## 3. Typography Rules

### 3.1 Font Families
Only system fonts are permitted.

```
Primary (UI/Text):
- Inter
- SF Pro
- system-ui
- sans-serif

Monospace (Shortcut Keys):
- SF Mono
- Consolas
- monospace
```

No custom or externally loaded fonts are allowed.

---

### 3.2 Font Weights
| Usage | Weight |
|-----|--------|
| Section Header | 700 (Bold) |
| Shortcut Keys | 600 (Semi-Bold) |
| Description | 400 (Regular) |

---

### 3.3 Key Symbol Standardization

#### macOS
- Command: ⌘
- Option: ⌥
- Control: ⌃
- Shift: ⇧
- Delete: ⌫
- Return: ⏎

#### Windows
- Windows: ⊞ or `Win`
- Control: Ctrl
- Alt: Alt
- Shift: ⇧
- Delete: Del
- Enter: ↵

All shortcuts must use standardized symbols for the selected platform.

---

### 3.4 Font Sizes (3.75" Sticker Reference)

| Text Size | Header | Key | Description |
|----------|--------|-----|-------------|
| Small | 11px | 9px | 8px |
| Medium | 13px | 11px | 10px |
| Large | 16px | 14px | 12px |

For 3" stickers, sizes must scale proportionally.

---

### 3.5 Text Rendering Rules
- Line height: 1.3–1.4
- Letter spacing: -0.01em
- Maximum description lines per shortcut: 2
- Overflow behavior: truncate with ellipsis
- Shrink-to-fit limited to 1px reduction

---

## 4. Layout Rules

### 4.1 Grid
- Grid is always **2 columns**, equal width
- Section placement flows row-first, left to right
- Section height auto-expands based on content

---

### 4.2 Section Limits
| Text Size | Max Sections |
|---------|--------------|
| Small | 6 |
| Medium | 4 |
| Large | 4 |

The system must prevent adding sections beyond the maximum.

---

### 4.3 Section Structure
Each section may include:
- Optional header
- Shortcut rows (key + description)

Header-less sections are allowed.

---

## 5. Capacity Rules

### 5.1 Maximum Shortcut Capacity

| Sticker Size | Small | Medium | Large |
|-------------|-------|--------|-------|
| 3.75" | 60 | 42 | 28 |
| 3" | 48 | 36 | 24 |

---

### 5.2 Enforcement Rules
- The system must prevent adding shortcuts beyond capacity.
- A visual indicator must display used vs. maximum slots.
- Section count must adapt automatically when text size changes.

---

## 6. Color Palettes (Predefined Only)

### Classic
```
Background: #FFFFFF
Border: #00AAFF
Text: #000000
```

### VS Code
```
Background: #FFFFFF
Border: #007ACC
Section Background: #F3F3F3
Text: #000000
```

### Kiro
```
Background: #FFFFFF
Border: #8B5CF6
Text: #000000
```

### Dark
```
Background: #1F2937
Border: #60A5FA
Section Background: #374151
Text: #FFFFFF
```

### Monochrome
```
Background: #FFFFFF
Border: #000000
Text: #000000
```

---

## 7. Spacing & Visual Parameters

### 3.75" Sticker
```
Outer Padding: 30px
Border Width: 3px
Border Radius: 20px
Section Padding: 12px
Section Gap: 12px
Section Border Radius: 12px
```

### 3" Sticker
```
Outer Padding: 24px
Border Width: 2.5px
Border Radius: 16px
Section Padding: 10px
Section Gap: 10px
Section Border Radius: 10px
```

Optical alignment adjustments are permitted to maintain visual balance.

---

## 8. Behavioral Requirements

BR-1: Changing text size must recalculate shortcut capacity, section limits, and grid layout.

BR-2: Preview Mode must render using the same layout and font metrics as export.

BR-3: Layout output must be deterministic regardless of editing order.

BR-4: Platform selection must update all key symbols.

---

## 9. Export Rules

### 9.1 Supported Formats
- SVG (vector)
- PNG (raster)

---

### 9.2 SVG Export
- Fonts must be embedded or text converted to outlines
- Output dimensions must match physical size at 300 DPI
- RGB color space only

---

### 9.3 PNG Export
- Rasterized at 300 DPI
- Output dimensions must be exact
- RGB color space only

---

### 9.4 Preview Parity
Preview output must visually match exported output within ±1px tolerance.

---

## 10. Layout Invariants
- Export dimensions must be exact
- No content inside inner safe zone
- No overflow beyond section bounds
- System fonts only
- Only predefined sizes, palettes, and layouts allowed

---

## 11. Non-Goals
- Custom sticker sizes
- CMYK export
- Custom fonts
- Custom shapes
- Free-form design tools

---

## 12. Validation Checklist
Before release:
- Home inkjet print test
- Home laser print test
- Professional die-cut print test
- Small-text legibility validation
- Light and dark contrast validation
