---
inclusion: fileMatch
fileMatchPattern: "**/CreateLayout.jsx,**/designSystem.js,**/exportCanvas.js,**/layoutStorage.js,**/SaveModal.jsx"
---

# Canvas Layout System — Steering

## Architecture

The sticker layout canvas is a single-page React component (`CreateLayout.jsx`) that renders a print-ready shortcut sticker preview. It depends on:

- `constants/designSystem.js` — Source of truth for all sizing, spacing, typography, palettes, and capacity calculations
- `utils/exportCanvas.js` — PNG and SVG export logic
- `utils/layoutStorage.js` — Serialize/deserialize layout state (account, browser, JSON file)
- `components/SaveModal.jsx` — Save/export modal UI

## Key Concepts

### Section Model
- Sections are stored in `customSections` array: `[{ id: number, name: string }]`
- Shortcuts per section stored in `selectedShortcuts`: `{ [sectionId]: Shortcut[] }`
- Arrays are always compact (no null gaps) — every mutation must filter nulls
- `lockedSections` is a `Set<sectionId>` — locked sections hide placeholders and shrink to content

### Dynamic Capacity Algorithm
`calculateSectionCapacity(imageSize, textSize, sectionCount, hasTitle)` in designSystem.js computes how many shortcuts fit per section based on real pixel math. All limits derive from this — never hardcode shortcut counts.

### Grid Layout
- Always a CSS grid with `repeat(2, 1fr)` columns
- Section rows = `ceil(sectionCount / 2)`
- Locked sections use `alignSelf: 'start'` to shrink; unlocked stretch to fill

### Drag & Drop
- Sidebar → section: uses `text/plain` dataTransfer with JSON shortcut
- Reorder within section: uses `application/reorder` dataTransfer to distinguish from sidebar drops
- Drops on filled rows insert at that position; drops on the bottom placeholder append

### Export Constraints
- Export must render at 300 DPI with exact pixel dimensions
- All UI chrome (lock buttons, delete buttons, counters, placeholders) must be hidden during export via `isExporting` flag
- Canvas zoom resets to 100% before export, restores after

## Rules When Editing This Code

1. Never store nulls in shortcut arrays — always compact with `.filter(s => s)`
2. All sizing/capacity must go through `designSystem.js` functions, not inline magic numbers
3. Any new section state (like `lockedSections`) must be included in `serializeLayout` and restored in both load paths (file load + UserHome load)
4. Reset new state in both "Clear Layout" and "Start Over" handlers
5. The `isExporting` flag gates all non-print UI — check it for any new interactive elements
6. Right-click context menu on canvas is the primary way to add sections
7. Test with both sticker sizes (3.75" and 3") and all three text sizes
