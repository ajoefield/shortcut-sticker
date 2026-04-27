# Canvas Section Management

## Description
Improve the Create Layout canvas so sections are dynamic, lockable, and user-friendly. Sections should size to their content, support drag-to-reorder shortcuts, allow inline deletion, and scale beyond the previous 4-section hard limit.

## Requirements

### REQ-1: Dynamic Section Capacity
- Section count is no longer hardcoded to 4 — max is calculated from available pixel space via `calculateSectionCapacity`
- Capacity per section adjusts dynamically based on: image size, text size, number of sections, and whether a title is present
- Shortcut count displays in the text size selector and toolbar update live as sections are added/removed

### REQ-2: Section Locking
- Each section has a lock/unlock toggle in its header
- Locked sections: hide all placeholder rows, shrink to fit content (`alignSelf: start`), reject drops, hide delete buttons
- Unlocked sections: show one placeholder drop row at bottom, accept drops, show delete buttons, stretch to fill grid
- Lock state is visually distinct — colored pill badge (green "Open" / red "Locked")
- Lock state persists through save/load (serialized as array of section IDs)

### REQ-3: Compact Shortcut Arrays
- No null gaps in shortcut arrays — every mutation compacts
- Dropping a shortcut always appends to the end (single placeholder at bottom)
- Dropping onto an existing row inserts at that position

### REQ-4: Drag-to-Reorder Within Sections
- Filled shortcut rows are draggable within their section
- Uses `application/reorder` dataTransfer to distinguish from sidebar drops
- Visual feedback: dragged row gets subtle highlight
- Reorder only works on unlocked sections

### REQ-5: Inline Delete
- Each filled shortcut row has a ✕ delete button (right side)
- Hidden during export and when section is locked
- Deleting compacts the array (no gaps left behind)

### REQ-6: Right-Click Context Menu
- Right-clicking the canvas area shows a context menu with: Add Section, Lock All, Unlock All
- Add Section respects dynamic max limit
- Menu dismisses on click-away

### REQ-7: Disclaimer Banner
- Info banner at top of canvas area explaining the workflow
- "Drag shortcuts from sidebar into sections. Lock a section when done to shrink it to size. Right-click the canvas to add more sections."

### REQ-8: State Reset
- "Clear Layout" and "Start Over" both reset: shortcuts, sections, locked state
- Loading a saved layout restores locked state

### REQ-9: Pinch-to-Zoom
- Two-finger spread (fingers moving apart) zooms in on the canvas
- Two-finger pinch (fingers moving together) zooms out
- Zoom range: 0.5x to 2x
- Works on trackpad and touch devices
- Coexists with existing Ctrl/Cmd+scroll wheel zoom and button presets

### REQ-10: Cross-Section Shortcut Drag
- Shortcuts already on the canvas can be dragged from one section to another
- Source section loses the shortcut, target section gains it at the drop position
- Locked sections reject both incoming and outgoing drags
- Target section must have capacity for the shortcut

### REQ-11: Non-Intrusive Delete Button
- The ✕ delete button on shortcut rows must not consume canvas layout space
- It should float/overlay on the right edge, only visible on hover
- When a section is locked, the delete button disappears without causing any text reflow
- During export, the button is completely removed from rendering

### REQ-12: Section Drag-to-Reorder
- Users can drag entire sections to reorder them within the 2-column grid
- Reordering changes the section's position in the `customSections` array, which determines grid placement (left-to-right, top-to-bottom)
- Drag handle on the section header (grab cursor on section name area)
- Visual feedback: dragged section gets a highlight/border, drop target shows an insertion indicator
- When a locked section shrinks and leaves a gap, users can reorder to place small locked sections next to each other to minimize wasted space
- Section order persists through save/load (already handled since `customSections` array order is serialized)
- Phase 2 (future): auto-pack algorithm that automatically groups locked/small sections to minimize gaps

### REQ-14: Click-and-Drag Canvas Panning
- When zoomed in, the canvas may extend beyond the visible viewport
- Users can click and drag on empty canvas area (not on sections/shortcuts) to pan the view
- Middle-click drag or Space+click drag as alternative pan triggers
- Cursor changes to grabbing hand while panning
- Panning works by scrolling the overflow container, not by moving the canvas element
- Does not interfere with section drags, shortcut drags, or context menu

### REQ-13: Per-Column Capacity Enforcement + Independent Column Sizing
- The 2-column grid can have uneven section counts (e.g., 5 sections = 3 left, 2 right)
- Each column independently calculates how many shortcuts fit per section based on how many sections are in that column
- Left column (even indices: 0, 2, 4…) and right column (odd indices: 1, 3, 5…) each divide available height among their own sections
- Sections in the same visual "row" must NOT share height — each column sizes its sections independently
- When a section is locked and shrinks, the sections below it in the same column should move up to fill the gap (no wasted space from shared grid rows)
- Layout uses two independent flex columns instead of a single CSS grid, so each column flows its sections top-to-bottom without cross-column height coupling
- Sections must not overflow or overlap — content is capped to fit within the column's available space
- `calculateColumnCapacity` in designSystem.js provides per-section limits as an array matching section order
- `MAX_SHORTCUTS_PER_SECTION` becomes per-section (varies by column position) instead of a single global value
- Drop handlers and capacity checks use the per-section limit for the target section
- Total shortcut count display uses the column-aware total (sum of both columns)

### REQ-15: Print-Accurate Preview Mode (Dual-View)
- The current canvas renders at display resolution (600×600px for 3.75") with large screen-readable fonts (13–22px), which artificially limits shortcut capacity to far fewer than what physically fits on a printed sticker (~20–24 shortcuts per section)
- The root cause: `calculateColumnCapacity` uses `displayHeight` (600px) instead of `exportHeight` (1125px), so the capacity algorithm thinks there's less space than the real sticker has
- Two rendering modes are needed:
  - **Edit Mode** (default): Current behavior — large readable fonts for comfortable drag-and-drop editing. Capacity limits are based on export dimensions (not display), so users can add the full number of shortcuts that will fit on the physical sticker. Text may appear to overflow the display canvas, but the sticker preview is understood to be a zoomed-in editing view.
  - **Preview Mode**: Renders the sticker at true print proportions — the canvas is drawn at export resolution (1125×1125 or 900×900) and CSS-scaled down to fit the viewport. Fonts, spacing, and layout match exactly what the printed sticker will look like. This is a read-only view (no drag-and-drop editing).
- A toggle button in the toolbar switches between "Edit" and "Preview" modes
- In Preview Mode:
  - The sticker renders at `exportWidth × exportHeight` with proportionally scaled fonts (e.g., `small` description = ~6.9px at export scale, which looks correct when the 1125px canvas is scaled down to ~600px on screen)
  - All spacing values (`outerPadding`, `sectionGap`, `sectionPadding`, etc.) are multiplied by the export scale factor (`exportWidth / displayWidth` = 1.875× for 3.75")
  - Typography sizes are multiplied by the same scale factor
  - The canvas is wrapped in a `transform: scale()` to fit the viewport, similar to how zoom already works
  - Drag-and-drop, delete buttons, placeholders, and other edit-only UI elements are hidden
  - Zoom controls still work to inspect detail
- Capacity calculation changes:
  - `calculateColumnCapacity` and `calculateSectionCapacity` gain an optional `useExportDimensions` parameter (default: `false` for backward compatibility)
  - When `true`, they use `exportHeight` instead of `displayHeight`, and scale spacing/row heights by the export scale factor
  - Edit mode uses export-based capacity (higher limits), Preview mode also uses export-based capacity (same limits, just rendered at true scale)
- The shortcut counter in the toolbar always shows the export-based capacity (the real physical limit)
- Export (PNG/SVG) continues to work as before — it already renders at export resolution

### REQ-16: Export-Based Capacity as Default
- All capacity calculations should use export dimensions by default, since that represents the real physical sticker
- The `displayWidth/displayHeight` values are only for on-screen rendering convenience — they should not limit how many shortcuts the user can add
- This means the "small" text size with 4 sections on a 3.75" sticker should allow ~20+ shortcuts per section (matching real printed stickers), not the current ~10
- The text size selector and shortcut counter should reflect these higher, accurate limits
- Edit mode renders shortcuts at screen-readable sizes but allows the full export-based count — shortcuts that don't visually fit in the display canvas are still present and will appear correctly in Preview mode and in the exported image

### REQ-15: High-Fidelity Export with html-to-image
- Replace `html2canvas` with `html-to-image` library for PNG export
- `html-to-image` uses SVG `<foreignObject>` to leverage the browser's own rendering engine, producing pixel-identical output to the on-screen preview
- PNG export uses `toPng()` with `pixelRatio` set to `exportWidth / displayWidth` (~1.875x for 3.75" at 300 DPI)
- SVG export uses `toSvg()` instead of the current manual `generateSVG` function, which hardcodes positions and doesn't match the flex layout
- Filter out `.no-export` elements and export UI (lock buttons, delete buttons) via the `filter` option
- Eliminates known `html2canvas` issues: missed custom fonts, CSS property gaps (`box-shadow`, `backdrop-filter`), and subtle layout drift at high DPI
- Export dimensions remain the same: 1125×1125 for 3.75", 900×900 for 3"
- The existing zoom-reset-before-export flow stays the same

## Tasks

### TASK-1: Dynamic capacity algorithm ✅
- [x] Implement `calculateSectionCapacity` in designSystem.js
- [x] Update `getMaxShortcuts`, `getMaxSections`, `getMaxShortcutsPerSection` to use it
- [x] Update all call sites in CreateLayout.jsx
- [x] Verify numbers are reasonable across all size/text combos

### TASK-2: Section lock/unlock ✅
- [x] Add `lockedSections` state
- [x] Lock toggle button in section header with colored pill style
- [x] Locked sections hide placeholders and shrink
- [x] Locked sections reject drops and hide delete buttons
- [x] Persist lock state in serialization and both load paths
- [x] Reset lock state in Clear/Start Over

### TASK-3: Compact arrays + single drop zone ✅
- [x] Rewrite section rendering to use compacted arrays
- [x] Single placeholder row at bottom of unlocked sections
- [x] Update `removeShortcutFromLayout` to filter instead of nullify
- [x] Drop on existing row inserts at position

### TASK-4: Drag-to-reorder ✅
- [x] Add `reorderDrag` state
- [x] Make filled rows draggable with `application/reorder` data
- [x] Handle reorder drops vs sidebar drops
- [x] Visual feedback on dragged row

### TASK-5: Inline delete ✅
- [x] ✕ button on each filled row
- [x] `deleteShortcutFromSection` helper that compacts
- [x] Hidden during export and when locked

### TASK-6: Context menu + banner ✅
- [x] Right-click handler on canvas area
- [x] Context menu with Add Section, Lock All, Unlock All
- [x] Click-away dismissal
- [x] Disclaimer banner at top of canvas

### TASK-7: Pinch-to-zoom on canvas ✅
- [x] Two-finger spread (bidirectional) zooms in
- [x] Two-finger pinch zooms out
- [x] Track touch distance delta to compute zoom scale
- [x] Clamp zoom between 0.5x and 2x
- [x] Works alongside existing Ctrl/Cmd+scroll zoom

### TASK-7b: Click-and-drag canvas panning ✅
- [x] Add `isPanning` and `panStart` state
- [x] On mousedown in the zoom container (not on interactive elements), start panning
- [x] On mousemove while panning, scroll the container
- [x] On mouseup, stop panning
- [x] Cursor shows `grab` by default, `grabbing` while panning
- [x] Does not interfere with section/shortcut drags (only activates on direct container clicks)

### TASK-8: Cross-section shortcut drag ✅
- [x] Drag a shortcut from one section and drop into another section
- [x] Use `application/reorder` with source sectionId to detect cross-section moves
- [x] Remove from source section, insert into target section at drop position
- [x] Respect locked state — can't drag out of or into locked sections
- [x] Respect capacity limits on target section

### TASK-9: Non-intrusive delete button ✅
- [x] ✕ button must not take up canvas content space (no layout shift when locking)
- [x] Position as absolute/floating overlay on the right edge of each shortcut row
- [x] Only visible on hover — hidden by default, appears when mouse enters the row
- [x] Completely hidden during export (`isExporting`) and when section is locked
- [x] Must not affect text wrapping or shortcut key/description layout

### TASK-10: Section name editing 🔲
- [x] Double-click or click section name to edit inline
- [x] Save on Enter/blur
- [x] Validate non-empty

### TASK-11: Section drag-to-reorder ✅
- [x] Add `sectionDrag` state to track which section is being dragged (`{ fromIndex }` or null)
- [x] Make section header area draggable (grab handle on section name)
- [x] Use `application/section-reorder` dataTransfer type to distinguish from shortcut drags
- [x] On drop: reorder `customSections` array (splice from → splice to)
- [x] Visual feedback: dragged section gets subtle opacity/border change, drop target shows insertion line
- [x] Shortcuts data (`selectedShortcuts`) stays attached to section IDs — only array order changes
- [x] Lock state stays attached to section IDs — unaffected by reorder
- [x] Hidden during export
- [x] Add "Reorder Sections" hint to context menu or disclaimer banner

### TASK-12: Per-column capacity enforcement + independent column layout 🔲
- [x] Replace the single 2-column CSS grid with two independent flex columns side by side
  - Current: `display: grid; gridTemplateColumns: repeat(2, 1fr)` — rows are shared, so sections in the same row are forced to the same height
  - New: Two `div` columns with `display: flex; flexDirection: column`, each containing its own sections
  - Left column gets sections at even indices (0, 2, 4…), right column gets odd indices (1, 3, 5…)
  - Each column independently sizes its sections — a tall left section won't stretch the right section in the same "row"
- [x] Locked sections shrink to content within their column without leaving gaps (no shared row height forcing empty space)
- [x] Unlocked sections in each column stretch to fill remaining space via `flex: 1`
- [x] Wire `calculateColumnCapacity` (already in designSystem.js) into CreateLayout.jsx
- [x] Replace single `MAX_SHORTCUTS_PER_SECTION` with a per-section array from `calculateColumnCapacity().perSection`
- [x] Each section's drop handler checks its own column-aware limit (not a global one)
- [x] Update total shortcut counter to use column-aware total
- [x] Update text size selector dropdown to show column-aware totals
- [x] Enforce `overflow: hidden` on each section div to prevent visual overflow
- [x] When sections are added/removed, recalculate per-column limits
- [x] Trim shortcuts when switching text size if a section exceeds its new per-column limit
- [x] Section reorder (TASK-11) still works — reordering changes which column a section lands in
- [ ] Export parity — exported layout must match preview (both use same column layout)
- [ ] Test with odd section counts (3, 5, 7) to verify left/right columns size independently

### TASK-13: Visual polish 🔲
- [x] Hover states on shortcut rows
- [x] Drag-over highlight on drop targets
- [x] Smooth transitions on lock/unlock size changes
- [ ] Consistent dark mode support for all new elements

### TASK-14: Export-based capacity calculation ✅
- [x] Add `useExportDimensions` parameter to `calculateSectionCapacity`, `calculateColumnCapacity`, `getMaxSections`, `getMaxShortcuts`, `getMaxShortcutsPerSection`
- [x] All call sites in CreateLayout.jsx pass `true` for the export flag (currently no-op; reserved for Preview mode)
- [x] Verified display-based capacity already matches real printed sticker density (~25 total per side at medium text with 5-6 sections)
- [x] `useExportDimensions` parameter is a no-op for now — display dimensions are the correct constraint for physical stickers
- [x] Parameter reserved for TASK-15/16 Preview mode rendering at export resolution

### TASK-15: Preview mode toggle 🔲
- [ ] Add `previewMode` state (boolean, default false)
- [ ] Add "Edit / Preview" toggle button in the toolbar (next to zoom controls)
- [ ] In Preview mode: render the canvas at `exportWidth × exportHeight` (e.g., 1125×1125)
- [ ] Scale all typography and spacing by the export scale factor (`exportWidth / displayWidth`)
- [ ] Wrap the preview canvas in `transform: scale(displayWidth / exportWidth)` so it fits the same viewport space
- [ ] Hide all edit-only UI in preview mode: drag handles, delete buttons, placeholders, lock/unlock pills, section remove buttons, section name editing
- [ ] Preview mode is read-only — no drag-and-drop, no drops accepted
- [ ] Zoom controls (buttons + pinch + Ctrl+scroll) still work in preview mode
- [ ] Panning still works in preview mode
- [ ] Toggle smoothly transitions between modes (CSS transition on transform)

### TASK-16: Preview mode export parity 🔲
- [ ] Verify that Preview mode rendering matches PNG export output pixel-for-pixel
- [ ] Both Preview mode and export use the same scale factor, font sizes, and spacing
- [ ] The `exportToPNG` function should work identically whether called from Edit or Preview mode
- [ ] SVG export (`exportToSVG`) should also match the preview rendering

### TASK-17: Replace html2canvas with html-to-image 🔲
- [ ] Install `html-to-image` package (`npm install html-to-image`)
- [ ] Remove `html2canvas` dependency (`npm uninstall html2canvas`)
- [ ] Rewrite `exportToPNG` in `exportCanvas.js` to use `toPng()` with `pixelRatio` for 300 DPI scaling
- [ ] Rewrite `exportToSVG` to use `toSvg()` instead of manual `generateSVG` — eliminates layout mismatch between preview and SVG export
- [ ] Remove the `generateSVG` and `escapeXML` helper functions (no longer needed)
- [ ] Keep the `.no-export` element filtering via the `filter` option
- [ ] Keep the zoom-reset-before-export flow in `CreateLayout.jsx` (reset to 1x, wait for re-render, export, restore)
- [ ] Verify PNG export at both sizes (3.75" → 1125px, 3" → 900px) matches on-screen preview pixel-for-pixel
- [ ] Verify SVG export renders correctly when opened in a browser and image viewer
- [ ] Test with all color palettes (especially Dark Mode with dark backgrounds)
- [ ] Test that custom fonts (Inter, SF Mono) embed correctly in exported images

## File References
- #[[file:shortcut-sticker/frontend/src/pages/CreateLayout.jsx]]
- #[[file:shortcut-sticker/frontend/src/constants/designSystem.js]]
- #[[file:shortcut-sticker/frontend/src/utils/layoutStorage.js]]
- #[[file:shortcut-sticker/frontend/src/components/SaveModal.jsx]]
- #[[file:shortcut-sticker/frontend/src/utils/exportCanvas.js]]
