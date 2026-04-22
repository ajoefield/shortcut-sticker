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
- [ ] Update text size selector dropdown to show column-aware totals
- [ ] Enforce `overflow: hidden` on each section div to prevent visual overflow
- [ ] When sections are added/removed, recalculate per-column limits
- [ ] Trim shortcuts when switching text size if a section exceeds its new per-column limit
- [ ] Section reorder (TASK-11) still works — reordering changes which column a section lands in
- [ ] Export parity — exported layout must match preview (both use same column layout)
- [ ] Test with odd section counts (3, 5, 7) to verify left/right columns size independently

### TASK-13: Visual polish 🔲
- [ ] Hover states on shortcut rows
- [ ] Drag-over highlight on drop targets
- [ ] Smooth transitions on lock/unlock size changes
- [ ] Consistent dark mode support for all new elements

## File References
- #[[file:shortcut-sticker/frontend/src/pages/CreateLayout.jsx]]
- #[[file:shortcut-sticker/frontend/src/constants/designSystem.js]]
- #[[file:shortcut-sticker/frontend/src/utils/layoutStorage.js]]
- #[[file:shortcut-sticker/frontend/src/components/SaveModal.jsx]]
