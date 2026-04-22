# Feature Ideas & Backlog

*Comprehensive feature roadmap organized by priority and status.*

---

## ✅ Completed Features

### Core Product (Early Sessions — 2025-12-09)
- [x] React frontend with React Router navigation
- [x] Express backend with Prisma ORM
- [x] Database schema (User, App, Shortcut, Layout models)
- [x] Landing page, Browse Shortcuts, Create Layout, Profile pages
- [x] Dark mode with browser preference detection
- [x] Floating modal-style authentication forms

### Extraction Pipeline (2026-01-09 — 2026-01-11)
- [x] Simple AI parser (Claude Haiku) — replaced complex multi-parser system
- [x] PDF, PNG, and TXT file support through unified AI pipeline
- [x] Key combination standardization (Mac symbols ⌘⌥⇧⌃)
- [x] Platform splitting (Cross-platform → separate macOS + Windows files)
- [x] OSA (Operating System Agnostic) platform for terminal tools
- [x] Smart library management with SHA256 file hashing
- [x] Quality review system with AI-powered malformed shortcut validation
- [x] Force extraction CLI tool
- [x] Versioned output with `latest/` folder
- [x] Database loader (`database_loader.js`) bridging CSV → Prisma
- [x] SQLite for local development (zero-config)

### Sticker Design Tool — Phase 1 (2026-04-10)
- [x] Design system constants (`designSystem.js`) — palettes, typography, symbols, sizes, spacing
- [x] 5 color palettes: Classic, VS Code, Kiro, Dark, Monochrome
- [x] 2 image sizes: 3.75" (16" laptops) and 3" (15" or smaller)
- [x] 3 text sizes: Small (40), Medium (32), Large (24) shortcuts
- [x] Standardized key symbols for macOS and Windows
- [x] Image/text/palette selection in initial setup

### Sticker Design Tool — Phase 2 (2026-04-10)
- [x] PNG export at 300 DPI (1125×1125 or 900×900)
- [x] SVG export button
- [x] Save/load layouts (JSON file + localStorage)
- [x] Zoom controls (buttons + scroll + trackpad pinch)
- [x] Print CSS for home printing at actual sticker size
- [x] Logo integration (bottom right of canvas)
- [x] Layout title input and display
- [x] Search across all apps, shortcuts, and commands
- [x] Print-optimized font sizes (60-80% larger)
- [x] Strict section/shortcut limits per text size
- [x] Capacity indicator with color coding (green/yellow/red)
- [x] Key formatting with " + " spacing

### Sticker Design Tool — Phase 3 (2026-04-10)
- [x] User authentication (JWT + bcryptjs) — register, login, logout
- [x] User profile management — edit name/email, change password, delete account
- [x] Layout save to account — 10-layout limit per user
- [x] SaveModal — different flows for logged-in vs guest users
- [x] Export options in SaveModal — JSON, PNG, SVG
- [x] UserHome page — Profile, Saved Layouts (X/10), Security, Danger Zone
- [x] Database schema updated — Layout stores JSON, CASCADE deletes
- [x] Section text wrapping with word-break
- [x] Per-section capacity indicator (X/Y count)

### Canvas Section Management (2026-04-21 — In Progress)
- [x] Dynamic section capacity algorithm (`calculateSectionCapacity`)
- [x] Section lock/unlock with colored pill badges, persistence, and drop rejection
- [x] Compact shortcut arrays (no null gaps, single drop zone at bottom)
- [x] Drag-to-reorder shortcuts within sections (`application/reorder` dataTransfer)
- [x] Inline delete (✕ button, floating overlay, hover-only, hidden during export/lock)
- [x] Right-click context menu (Add Section, Lock All, Unlock All)
- [x] Disclaimer banner at top of canvas
- [x] Pinch-to-zoom on canvas (two-finger, 0.5x–2x range)
- [x] Click-and-drag canvas panning when zoomed
- [x] Cross-section shortcut drag (respects lock state and capacity)
- [x] Non-intrusive delete button (absolute positioned, no layout shift)
- [x] Section name editing (double-click inline edit)
- [x] Section drag-to-reorder (`application/section-reorder` dataTransfer)
- [x] Independent flex column layout (replaced shared CSS grid)
- [x] `renderSection` helper function extracted for column rendering
- [x] Per-section capacity limits via `calculateColumnCapacity`
- [x] `calculateColumnCapacity` wired into CreateLayout.jsx (import + computed values)
- [x] Per-section drop handler capacity checks (replaced global `MAX_SHORTCUTS_PER_SECTION`)
- [x] Total shortcut counter uses column-aware total
- [x] Unlocked sections stretch to fill remaining column space via `flex: 1`
- [ ] Text size selector dropdown shows column-aware totals
- [ ] Overflow enforcement on section divs
- [ ] Recalculate per-column limits on section add/remove
- [ ] Trim shortcuts when text size change exceeds per-column limit
- [ ] Export parity (exported layout matches preview)
- [ ] Visual polish (hover states, drag highlights, smooth transitions, dark mode)

---

## 🚀 High Priority (Next Up)

### Navigation & UX
- [ ] Update navigation with user menu (show name + logout when signed in)
- [ ] Load saved layouts from account into CreateLayout editor
- [ ] "Recover Last Session" prompt on page load when localStorage has saved layout
- [ ] Auto-save to localStorage on layout changes (useEffect)
- [ ] Remove debug console.log from fetchShortcuts

### Print Quality
- [ ] Fine-tune font sizes and section limits against real printed examples from `Sticker Layouts/`
- [ ] Print test on home printer (inkjet and laser)
- [ ] Fix SVG export text positioning

### Data Quality
- [ ] Fix RStudio/Kiro cross-platform count imbalance (find separate OS source files)
- [ ] Re-enable key standardizer with Mac-safe mode (text→symbols only, never symbols→text)
- [ ] More app shortcuts: Photoshop, Figma, Chrome, Blender, After Effects, Notion

---

## 💡 Medium Priority

### Sticker Design Enhancements
- [ ] Template library — pre-made layouts for VS Code, Vim, macOS, Chrome (3-5 templates)
- [ ] Color palette library — expandable collection of 3-color palettes
- [ ] Software-branded palettes — VS Code blue, Kiro purple, Sublime orange, Vim green
- [ ] Preview Mode — separate from editing, renders true-to-print layout
- [ ] Safe zone visualization — toggle overlay showing bleed and inner safe zones
- [ ] Dynamic key column width — calculate per-section based on longest key
- [ ] Description text optimization — measure actual text width for precise truncation
- [x] Section name editing inline — double-click section header to rename
- [x] Drag to reorder sections
- [ ] Undo/redo for layout changes (Ctrl+Z)
- [ ] Search result count indicator ("96 results for vim")

### Technical Improvements
- [ ] TypeScript migration for better type safety
- [ ] Refactor inline styles to proper CSS architecture
- [ ] Mobile responsiveness improvements
- [ ] Performance optimization and code splitting
- [ ] SEO optimization and meta tags
- [ ] API rate limiting and security headers
- [ ] Database indexing for faster queries
- [ ] Error tracking and monitoring (Sentry)
- [ ] Unit and integration testing (Jest + React Testing Library)

### Extraction Pipeline
- [ ] Deploy extraction pipeline to AWS Lambda
- [ ] Build shortcut library REST API for frontend integration
- [ ] Parser validation for malformed AI output
- [ ] Python-first extraction as default for table-format documents
- [ ] Document structure analysis caching
- [ ] Extraction quality scoring — compare Python vs AI results

---

## 🎨 UI/UX Enhancements
- [ ] Excalidraw-style canvas UI — full browser window canvas, pinned collapsible sidebar, floating zoomable sticker (deferred — use tool first, then decide)
- [ ] Loading states and skeleton screens
- [ ] Smooth animations and micro-interactions
- [ ] Mobile-first responsive design
- [ ] Better error handling with user-friendly messages
- [ ] Toast notifications for user actions
- [ ] Onboarding flow for new users
- [ ] Contextual help and tooltips
- [ ] Progressive web app (PWA) capabilities

---

## 🔮 Future Features

### AI-Powered Features (Phase 4+)
- [ ] AI layout auto-arrange — categorize and distribute shortcuts optimally across sections
- [ ] AI capacity prediction — real-time calculation based on actual text content
- [ ] AI layout suggestions — "Balanced", "Grouped by Function", "Most Used First", "Compact"
- [ ] Conversational AI assistant — "Put all navigation shortcuts in section 1"

### Export & Printing
- [ ] Home printing download option — RGB PNG/SVG for inkjet/laser printers
- [ ] Professional printing service — die-cut stickers printed and mailed to user
- [ ] Layout thumbnails — generate preview images for saved layouts
- [ ] Multiple stickers on canvas (Excalidraw-style)

### Community & Social
- [ ] User-contributed shortcuts with moderation
- [ ] Community voting on shortcut accuracy
- [ ] Share layouts with others (public gallery)
- [ ] Social sharing of layouts
- [ ] User profiles and achievement system

### Business Features
- [ ] Tiered pricing — Free (10 layouts, browser save), Pro ($5/mo unlimited, cloud storage)
- [ ] Print service — $15-25 per sticker (printing + shipping)
- [ ] Shopping cart and checkout system
- [ ] Bulk ordering for teams/companies
- [ ] Custom branding options

### Platform Expansion
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick shortcut lookup
- [ ] Desktop app (Electron)
- [ ] VS Code extension integration

### Extraction Pipeline Future
- [ ] Support additional image formats (JPEG, SVG)
- [ ] Web upload interface for source files (drag-and-drop)
- [ ] Automated web scraping — Google search "{app} keyboard shortcuts"
- [ ] HTML source file support
- [ ] User-submitted shortcut screenshots
- [ ] Shortcut diff reports — show what changed between extraction versions
- [ ] Scheduled AWS EventBridge scans for automatic library updates

---

## 🎯 Domain & Hosting
- [ ] Secure handsonkeyboard.com domain
- [ ] Production hosting setup (Vercel + Railway/PlanetScale)
- [ ] CDN configuration for global performance
- [ ] SSL certificate and security headers
- [ ] Email service integration (transactional emails)


---

## 📋 Canvas Section Management — Remaining Tasks (2026-04-21)

### TASK-12: Per-Column Capacity + Independent Flex Columns (Next Up)
- Replace CSS grid with two independent flex columns
- Per-section capacity limits via `calculateColumnCapacity`
- Locked sections shrink without leaving gaps in their column
- Unlocked sections stretch to fill remaining column space
- Export parity with new layout

### TASK-13: Visual Polish
- Hover states on shortcut rows
- Drag-over highlight on drop targets
- Smooth transitions on lock/unlock size changes
- Consistent dark mode for all new elements

### Kiro Workflow Artifacts Created
- Steering: `.kiro/steering/canvas-layout.md` — domain knowledge for canvas files
- Spec: `.kiro/specs/canvas-section-management.md` — full requirements + task tracking
- Hook: `canvas-build-check` — auto-runs `vite build` after canvas file edits
