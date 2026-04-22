# Technical Decisions

*Architecture decisions, rationale, and technical reference for the HandsOnKeyboard.com project.*

---

## System Architecture

### Stack
- **Frontend**: React + React Router + Tailwind CSS (inline CSS fallbacks)
- **Backend**: Express.js + Prisma ORM
- **Database**: SQLite (local dev), PostgreSQL (production)
- **Data Processing**: Python 3.12 + Claude AI for PDF/PNG/TXT extraction
- **AWS**: Bedrock Claude Haiku, Textract, Lambda, S3, Terraform

### Data Flow
```
Source Files (PDF/PNG/TXT)
    ↓
Extraction Pipeline (Python + Claude AI)
    ↓
CSV Files (output/csv_exports/latest/)
    ↓
Database Loader (database_loader.js)
    ↓
SQLite Database (dev.db via Prisma)
    ↓
Express API (localhost:3001)
    ↓
React Frontend (localhost:5173)
    ↓
Design System (designSystem.js)
    ↓
Sticker Design Tool (CreateLayout.jsx)
    ↓
Save Layout (JSON file + localStorage + account storage)
    ↓
Export (PNG @300DPI via html2canvas, SVG via programmatic generation)
    ↓
Print (Home inkjet/laser via CSS @media print, OR Professional die-cut)
```

---

## Database Design

### Schema Decisions
- Single `shortcuts` table with `platform` column instead of separate OS tables
- Unique constraint on `(keys, appId, platform)` to prevent duplicates
- Separate `apps` table for normalization
- Layout model stores JSON data (simplified from junction table approach)
- CASCADE delete on user relationships

### SQLite for Local Dev (2026-01-11)
- **Problem**: PostgreSQL `ECONNREFUSED`, requires `brew services start` and server management
- **Solution**: `provider = "sqlite"`, `DATABASE_URL = "file:./dev.db"`
- **Rationale**: Zero-config, no server process, no port conflicts
- **Production plan**: Switch back to PostgreSQL (just change provider + URL in `.env`)

### Database Loader (`database_loader.js`)
- Bridges extraction pipeline (Python → CSV) and web app (Node.js → Prisma → SQLite)
- CSV source: `../../output/csv_exports/latest/`
- Platform mapping: `windows→windows`, `macos→mac`, `osa→both`, `unknown→both`
- OSA rationale: OSA shortcuts work on all platforms, appear for both `mac` and `windows`
- Duplicate prevention via `findFirst` check before creating each shortcut

### App Configuration Registry
```javascript
const appConfigs = {
  'vs_code':        { name: 'VS Code',       category: 'Development', iconColor: '#007ACC' },
  'intellij_idea':  { name: 'IntelliJ IDEA', category: 'Development', iconColor: '#000000' },
  'sublime_text':   { name: 'Sublime Text',  category: 'Development', iconColor: '#FF9800' },
  'vim':            { name: 'Vim',            category: 'Development', iconColor: '#019733' },
  'docker':         { name: 'Docker',         category: 'DevOps',     iconColor: '#2496ED' },
  'jupyterlab':     { name: 'JupyterLab',    category: 'Development', iconColor: '#F37626' },
  'kiro':           { name: 'Kiro',           category: 'Development', iconColor: '#6366F1' },
  'macos':          { name: 'macOS',          category: 'System',      iconColor: '#000000' }
};
```

---

## Extraction Pipeline Architecture

### Simplified Pipeline (AI-Only) — 2026-01-09
- **Problem**: Complex routing (classifier → specialized parser → AI fallback → review) was fragile
- **Solution**: Single-path AI-only extraction using Claude Haiku with structured text output
- **Result**: 689 shortcuts (was 287), 100% success rate (was ~67%)

### Simple AI Parser Design
- **Engine**: `simple_extraction_engine.py` — one path, no routing
- **Parser**: `simple_ai_parser.py` — Claude Haiku with structured text format
- **Format**: `SHORTCUT: key | TITLE: action | PLATFORM: platform | CONFIDENCE: score`
- **Why not JSON**: Claude's JSON responses truncate/malform on large documents; structured text is 100% reliable
- **Why not Textract**: Browser-generated PDFs throw UnsupportedDocumentException; PyMuPDF text extraction is universal

### AWS AI Decision (Bedrock + Textract over OpenAI)
- Bedrock Claude 3 Haiku: $0.25/1M input tokens vs OpenAI GPT-4 at $10/1M (40x cheaper)
- AWS Textract: Purpose-built document OCR, free tier of 1,000 pages/month
- SSO authentication: Profile `'developer playground'` via `boto3.Session(profile_name=...)`

### Python Environment
- **Python 3.12** (not 3.13 — PyMuPDF and pandas have build failures on 3.13)
- **Virtual environment**: `enhanced_pipeline_env_312/`
- **Key dependencies**: PyPDF2, PyMuPDF (fitz), boto3, pandas, opencv-python, pytesseract

### Extraction Pipeline Steps (Final — 2026-01-11)
1. **Classify** — Detect file type (PDF/PNG/TXT), identify application, detect platform
2. **Analyze Structure** — Document structure analyzer detects format type and platform organization
3. **Extract** — AI parser (with structure context) OR table parser for known table-format cross-platform docs
4. **OSA Correction** — Force all shortcuts to OSA when source file is OSA
5. **Cross-Platform Processing** — Expand single-platform output for cross-platform sources
6. **Platform Split** — Convert cross-platform entries into separate macOS/Windows rows; OSA passthrough
7. **Smart Fallback** — Detect problems (single output, low count, mismatch, zero shortcuts) and apply Python-first fallback
8. **Export** — Platform-specific versioned CSV files (no standardization — original format preserved)
9. **Quality Review** — Validate platform counts, detect malformed shortcuts, AI-validate flagged entries

### File Structure
```
shortcut_extractor/
├── simple_extraction_engine.py      # Main pipeline orchestrator (9-step process)
├── simple_ai_parser.py              # AI extraction with structure context
├── document_structure_analyzer.py   # Document layout analysis (vertical header support)
├── table_parser.py                  # Direct Python table parsing
├── python_first_extractor.py        # Python-first hybrid extraction
├── cross_platform_processor.py      # Cross-platform expansion fallback
├── smart_fallback_system.py         # Intelligent error detection
├── quality_reviewer.py              # Post-pipeline quality validation
├── ai_shortcut_validator.py         # AI-powered malformed shortcut verification
├── document_classifier.py           # File type detection and routing
├── key_standardizer.py              # DISABLED — Mac symbols formatting
├── platform_splitter.py             # Cross-platform → macOS + Windows; OSA passthrough
├── extraction_engine.py             # Data structures (ExtractedShortcut)
├── library_manager.py               # ApplicationVersion tracking
├── image_ai_parser.py               # PNG extraction via Claude Vision
├── force_extraction.py              # CLI for re-scanning
├── aws_lambda_handler.py            # Serverless deployment handler
├── run_extraction.py                # Simple runner script
└── test_extractor.py                # Test script
```

---

## Platform Strategy

### Platform Model (Final — 2026-01-10)
| Platform | Description | Key Format | Output Files | Example Source |
|----------|-------------|------------|-------------|----------------|
| macOS | Mac desktop apps | ⌘ ⌥ ⇧ ⌃ symbols | 1 file | `VSCode_macOS_shortcuts.pdf` |
| Windows | Windows desktop apps | Ctrl/Alt/Shift text | 1 file | `VSCode_Windows_shortcuts.pdf` |
| OSA | OS-agnostic tools | Raw keys/commands | 1 file | `Vim_OSA_shortcuts.pdf` |
| Cross-platform | Both platforms in one source | Mixed | 2+ files | `Kiro_Cross-platform_shortcuts.png` |

### Platform Detection Priority
1. **Filename explicit platform** (highest): `_macOS_`, `_Windows_`, `_OSA_`, `_Cross-platform_`
2. **Known OSA tools** (only if no explicit platform): Vim, Git, Docker, tmux, etc.
3. **Text content analysis** (lowest, fallback only)

### Critical Correction: Ctrl ≠ Windows
- macOS uses Ctrl extensively (Ctrl+C in terminal, Ctrl+2 in RStudio)
- Strong Mac indicators: ⌘, ⌥, ⇧, ⌃ (symbols), Cmd, Command, Option (text)
- Strong Windows indicators: Win, Windows (only these are unambiguous)
- Ctrl/Alt/Shift return 'Unknown' — let document context determine platform

### Post-Processing Override for OSA
- AI prompt engineering couldn't override Claude's `Ctrl+` = Windows training bias
- Solution: Three-line post-processing forces all shortcuts to OSA when source file is OSA
- Lesson: Don't fight AI training data — fix the output programmatically

### PDF vs PNG for Cross-Platform Documents
- **PDF**: More total shortcuts but poor cross-platform balance (RStudio: 97 total, only 8 macOS)
- **PNG**: Fewer total but better balance (RStudio: 92 total, 50 macOS + 42 Windows)
- **Recommendation**: Use PNG for cross-platform sources, PDF for single-platform sources

---

## Source & Output File Naming Convention

### Input Format
```
{ApplicationName}_{Platform}_shortcuts.{pdf|png|txt}
```

### Output Format
```
{application}_{platform}_shortcuts_latest.csv
{application}_{platform}_shortcuts_{version}_{timestamp}.csv
```

### Examples
```
VSCode_macOS_shortcuts.pdf      → vs_code_macos_shortcuts_latest.csv
Vim_OSA_shortcuts.pdf           → vim_osa_shortcuts_latest.csv
Kiro_Cross-platform_shortcuts.png → kiro_macos_shortcuts_latest.csv + kiro_windows_shortcuts_latest.csv
jupyterlab_Windows_shortcuts.txt → jupyterlab_windows_shortcuts_latest.csv
```

---

## Key Standardizer — Disabled (2026-01-11)
- **Problem**: Corrupting Mac shortcuts — converting symbols (⌥) to text, splitting on `+` incorrectly
- **Solution**: Disabled entirely; CSV uses single `key_combination` column preserving original format
- **Future plan**: Re-enable with Mac-safe mode (convert text→symbols only, never symbols→text)
- **Lesson**: Preserve original data. Standardization is a presentation concern, not a data concern.

---

## Quality Review System (2026-01-11)

### Quality Reviewer
- Runs after all exports, analyzes `latest/` folder
- Checks: platform count balance, malformed shortcut detection, missing platform detection, confidence scoring
- Output: `quality_report.json`, `malformed_shortcuts.csv`, `false_positives.csv` in `output/csv_exports/review/`

### AI-Powered Malformed Shortcut Validation
- Pattern-based detection flags suspicious shortcuts; Claude Haiku verifies
- Only validates flagged shortcuts (cost-efficient, ~$0.001 per batch of 10)
- Separates confirmed malformed from false positives

---

## Smart Library Management (2026-01-10)

### File Tracking
- `application_versions.json`: SHA256 hash per file, extraction date, shortcut count, version number
- `library_metadata.json`: Last scan time, pending updates
- `library_index.json`: Searchable index for sticker app
- Smart extraction: Compares file hashes — only processes new or changed files

---

## Frontend Architecture

### State Management
- React hooks for local state (no Redux needed for MVP)
- AuthContext for global auth state
- Separate search states for main page vs modal

### Styling Approach
- Started with Tailwind classes
- Switched to inline CSS when global conflicts occurred
- Prioritized functionality over perfect architecture during MVP phase

### Design System (`designSystem.js`) — 2026-04-10
- **5 Color Palettes**: Classic (#00AAFF), VS Code (#007ACC), Kiro (#8B5CF6), Dark (#60A5FA), Monochrome (#000000)
- **2 Image Sizes**: 3.75" (1125×1125px @300DPI) and 3" (900×900px @300DPI)
- **3 Text Sizes**: Small (40 shortcuts), Medium (32), Large (24)
- **System Fonts Only**: Inter/SF Pro for text, SF Mono/Consolas for keys
- **Standardized Key Symbols**: macOS (⌘⌥⌃⇧⌫⏎) and Windows (⊞, Ctrl, Alt, ⇧, Del, ↵)
- **Deterministic Capacity Tables**: Capacity = f(sticker_size, text_size) is a pure function
- **"Image" Not "Sticker"**: System produces digital image files; "sticker" = physical paper

### Column-Aware Capacity System (2026-04-21)
- **Problem**: The original `getMaxShortcuts()` / `calculateSectionCapacity()` assumed a shared CSS grid where sections in the same row were forced to the same height. When one column had more sections than the other (e.g., 3 left, 2 right), capacity calculations were wrong because they divided height by `ceil(sectionCount/2)` rows — not per-column.
- **Solution**: `calculateColumnCapacity()` in `designSystem.js` computes per-column limits independently. Left column (even indices: 0, 2, 4…) and right column (odd indices: 1, 3, 5…) each divide available height among their own sections.
- **Result**: `MAX_TOTAL_SHORTCUTS` in `CreateLayout.jsx` now uses `calculateColumnCapacity().total` instead of `getMaxShortcuts()`. The shortcut counter, drop handlers, and capacity alerts all reflect accurate column-aware totals.
- **Layout change**: Two independent flex columns (`display: flex; flexDirection: column`) replaced the single `display: grid; gridTemplateColumns: repeat(2, 1fr)` — each column sizes its sections independently without cross-column height coupling.
- **Wiring**: `calculateColumnCapacity` is imported and called at the component level, producing `columnCapacity`, `perSectionLimits` (per-section array), and `COLUMN_TOTAL`. These recalculate reactively on any change to `imageSize`, `textSize`, `customSections.length`, or `layoutTitle`.

### Per-Section Drop Handler Capacity (2026-04-21)
- **Problem**: Need to verify that every drop handler in `renderSection` uses the column-aware per-section limit rather than a single global `MAX_SHORTCUTS_PER_SECTION`.
- **Finding**: Already fully implemented. All four capacity check sites use `getSectionLimit(sectionIndex)`, which reads from the `perSectionLimits` array computed by `calculateColumnCapacity()`.
- **How it works**:
  - `calculateColumnCapacity()` returns a `perSection` array where even indices get the left-column limit and odd indices get the right-column limit.
  - `getSectionLimit(sectionIndex)` does a simple lookup: `perSectionLimits[sectionIndex] ?? perSectionLimits[0] ?? 10`.
  - `renderSection(section, sectionIndex)` receives the global index from `customSections.indexOf(section)`, so the lookup is always correct.
- **Drop handler sites using column-aware limits**:
  1. Cross-section reorder drop on filled shortcut rows
  2. Sidebar shortcut drop on filled rows (insert at position)
  3. Placeholder drop zone visibility gate (hides zone when section is full)
  4. Cross-section drop on the placeholder zone (append to end)
- **Remaining global usage**: `getMaxShortcutsPerSection` is only used in the text-size change handler for trimming shortcuts when switching sizes — not in any drop path.

### Unlocked Section Flex Stretch (2026-04-21)
- **Behavior**: In the independent flex column layout, unlocked sections use `flex: 1` to stretch and fill remaining vertical space after locked sections shrink to content.
- **Implementation**: `renderSection` applies `flex: 1` to unlocked sections and `flex: '0 0 auto'` + `alignSelf: 'flex-start'` to locked sections. The inner shortcuts content div mirrors this: `flex: 1` when unlocked, no flex grow when locked.
- **Column containers**: Each column is `display: flex; flexDirection: column`, so standard flex distribution applies — locked sections take only what they need, unlocked sections split the remainder equally.
- **No code changes needed**: This behavior was already correctly implemented as part of the independent flex column layout work. Verification confirmed all three levels (column container → section div → inner content div) cooperate correctly.

### Replacing Global MAX_SHORTCUTS_PER_SECTION (2026-04-21)
- **Problem**: `MAX_SHORTCUTS_PER_SECTION` was a single global value from `getMaxShortcutsPerSection()`, which assumed all sections had the same capacity regardless of column position. With independent flex columns, a column with 2 sections has more height per section than a column with 3.
- **Solution**: Removed the global constant entirely. Added `getSectionLimit(sectionIndex)` helper that reads from `perSectionLimits[sectionIndex]` — the per-section array from `calculateColumnCapacity().perSection`.
- **Result**: All 4 drop handler capacity checks in `renderSection` now use `getSectionLimit(sectionIndex)`. Each section enforces its own column-aware limit.
- **Retained import**: `getMaxShortcutsPerSection` is still imported and used in the text-size change handler for trimming shortcuts when switching sizes. This is a separate concern from drop-time capacity enforcement.

### Independent Flex Column Layout — The Grid Replacement (2026-04-21)
- **Problem**: The original `display: grid; gridTemplateColumns: repeat(2, 1fr)` forced sections in the same row to share height. A tall left section would stretch the right section in the same row, wasting vertical space — especially when one section was locked and shrunk to content.
- **Solution**: Replaced the single CSS grid with a `display: flex; flexDirection: row` container holding two independent flex column divs. Left column gets even indices (0, 2, 4…), right column gets odd indices (1, 3, 5…).
- **Implementation**: Extracted section rendering into a `renderSection(section, sectionIndex)` helper function. Each column uses `display: flex; flexDirection: column` with `gap: spacing.sectionGap`. The `sectionIndex` is resolved via `customSections.indexOf(section)` to maintain correct drag handler references.
- **Why helper function**: The same section rendering logic is used in both columns. Extracting it avoids duplicating ~150 lines of JSX and keeps drag/drop/lock/edit behavior in one place.
- **Grid-specific cleanup**: Removed the bottom spacer div (`gridColumn: '1 / -1'`) which was only needed for the CSS grid layout.
- **Result**: Each column independently sizes its sections. A locked section in the left column shrinks to content without affecting right column section heights. Unlocked sections expand via `flex: 1` to fill remaining column space.

### Locked Section Shrink-to-Content (2026-04-21)
- **Problem**: When a section was locked, it simply omitted `flex: 1` from its style. In a flex column, this left the default flex behavior ambiguous — the container could still distribute leftover space to the locked section, preventing it from truly collapsing to content height.
- **Solution**: Locked sections now explicitly set `flex: '0 0 auto'` (don't grow, don't shrink, size to auto/content) and `alignSelf: 'flex-start'` (don't stretch vertically). The inner shortcuts content div also stops using `flex: 1` and switches from `overflow: auto` to `overflow: visible` when locked.
- **Why three properties**: `flex: 0 0 auto` handles the flex main axis (no grow/shrink), `alignSelf: flex-start` handles the cross axis (no stretch), and `overflow: visible` on the inner div prevents the section from maintaining a scrollable area when it should just show its content.
- **Result**: Locked sections collapse to exactly their content height. Unlocked sections in the same column immediately expand via `flex: 1` to fill the freed space. No gaps between sections in a column.

### PNG Export (html2canvas)
- Scale factor: `displayWidth / exportWidth` (e.g., 600px → 1125px = 1.875x)
- `isExporting` state with 100ms delay for React re-render before capture
- `.no-export` class for hidden elements (delete buttons, placeholders)
- Export always captures at 100% scale regardless of zoom level

### SVG Export
- Generated programmatically from layout state (not DOM capture)
- Font embedding via Google Fonts `@import` in SVG `<style>` block

### Print Support (CSS @media print)
- `@page { size: 4in 4in; margin: 0.125in; }` — matches sticker with bleed
- `-webkit-print-color-adjust: exact` forces color printing

### Zoom Controls
- CSS `transform: scale()` on wrapper div
- Presets: 50%, 75%, 100%, 150%, 200%
- Ctrl/Cmd + scroll wheel, trackpad pinch
- Limits: 0.5 (50%) to 2.0 (200%)

---

## Authentication & Save System (Phase 3 — 2026-04-10)

### JWT Authentication
- bcryptjs (10 rounds) for password hashing
- JWT tokens expire in 7 days, stored in localStorage
- Routes: register, login, me, logout, profile, password, delete account

### Layout Storage
- JSON format in database with version field
- 10 layout limit per user enforced at API level
- State captured: layoutType, selectedApp(s), imageSize, textSize, colorPalette, layoutTitle, customSections, selectedShortcuts, selectedPlatforms

### Save Strategy — Hybrid Approach
- **File save**: User-initiated, downloads JSON for permanent storage
- **localStorage**: Auto-saves on every manual save for crash recovery
- **Account storage**: Logged-in users save to database (10-layout limit)
- **Guest users**: Browser storage + file download (no account needed)

### Search Architecture
- JavaScript filtering over Prisma complex queries (more reliable)
- Platform filter only applies when NOT searching
- Search shows all results regardless of platform

---

## AWS Serverless Architecture (Designed, Not Deployed)

### Lambda Handler
- S3 trigger: New PDF/PNG uploaded → automatic extraction
- EventBridge: Daily scheduled scans
- API Gateway: REST endpoints (`/status`, `/search`, `/applications`)
- Smart processing: Uses library manager to skip unchanged files

### Estimated Monthly Costs
- Lambda: $5-15, S3: $1-5, Bedrock: $10-30, API Gateway: $1-5
- **Total**: ~$17-55/month

---

## UI Redesign — Deferred (2026-04-10)

### Decision: Finish Features Before UI Redesign (Path A)
- Complete save/load, templates, and polish first
- Real usage data will inform UI decisions better than speculation
- Full redesign plan documented in `CANVAS_REDESIGN_PROPOSAL.md` (root)

---

## Known Issues (2026-04-10)

- RStudio "unknown" platform file — Python-first extractor needs vertical table parsing improvement
- RStudio/Kiro count imbalance — Windows >> macOS in extraction
- Key standardizer disabled — shortcuts stored in original format; sticker app needs presentation-layer formatting
- SVG export has text positioning issues (low priority — PNG is primary)


---

## Canvas Section Management — Architecture Decisions (2026-04-21)

### Non-Intrusive Delete Button — Absolute Positioning
- **Problem**: The ✕ delete button was an inline flex element (`flexShrink: 0`) that consumed horizontal space. When locking a section, the button disappeared and description text reflowed into the freed space — visible layout shift.
- **Solution**: `position: absolute` on the right edge of each shortcut row (which has `position: relative`). Button starts at `opacity: 0` and fades in on row hover via `onMouseEnter`/`onMouseLeave` querying `[data-delete-btn]`.
- **Why not CSS hover**: Inline styles can't use `:hover` pseudo-selectors. The `data-delete-btn` attribute + parent hover event is the inline-style equivalent.

### Section Drag-to-Reorder — Separate DataTransfer Type
- **Problem**: Shortcut rows already use `application/reorder` for within-section reorder. Section drags need to coexist without interference.
- **Solution**: `application/section-reorder` as a separate dataTransfer type. The `draggable` attribute is only on the section header (`data-section-handle`), not the section container — so shortcut row drags pass through unaffected.
- **Key insight**: Shortcuts and lock state are keyed by section ID, not array index. Reordering the `customSections` array only changes visual position — no data migration needed.

### Native Event Listeners for Zoom — Passive vs Non-Passive
- **Problem**: React's `onWheel` and `onTouchStart` are passive by default in React 17+. `e.preventDefault()` fails silently on passive listeners, meaning trackpad pinch gestures couldn't be intercepted.
- **Solution**: Attach listeners via `useRef` + `addEventListener` with `{ passive: false }`. Separate `zoomContainerRef` from `canvasRef` (which is for export).
- **Dependency array**: `[canvasZoom, touchStartDistance, touchStartZoom, isPanning, panStart]` — the effect re-attaches when zoom/pan state changes so closures capture current values.

### Click-and-Drag Panning — Scroll-Based
- **Problem**: When zoomed in, the canvas extends beyond the viewport. Users need to pan to see different parts.
- **Solution**: Panning scrolls the overflow container (`el.scrollLeft`/`el.scrollTop`) rather than translating the canvas element. This works naturally with the existing `overflow: auto` on the zoom container.
- **Conflict avoidance**: Only activates on direct clicks on the container background or canvas background — checks `e.target` against interactive elements (buttons, inputs, draggables, section handles).

### Cross-Section Shortcut Drag — Reusing Existing Infrastructure
- **Problem**: Shortcuts could be reordered within a section but not moved between sections.
- **Solution**: Extended the existing `application/reorder` drop handler. When `fromSection !== section.id`, it's a cross-section move instead of a same-section reorder. Added `moveShortcutBetweenSections` helper that atomically removes from source and inserts into target.
- **Guard rails**: Both source and target sections must be unlocked. Target section capacity is checked before accepting.

### CSS Grid → Independent Flex Columns (TASK-12 Design)
- **Problem**: `display: grid; gridTemplateColumns: repeat(2, 1fr)` forces sections in the same row to share height. A tall left section stretches the right section, wasting space. Locked sections shrink but leave gaps because the grid row height is driven by the tallest section.
- **Planned solution**: Replace the grid with two independent `display: flex; flexDirection: column` containers. Left column gets even indices, right gets odd. Each column sizes its sections independently.
- **Trade-off**: Loses the automatic row alignment of CSS grid. Sections in the same visual "row" may have different heights. This is the desired behavior for a sticker layout tool where space efficiency matters more than visual symmetry.

### Per-Column Capacity Algorithm
- **Problem**: `calculateSectionCapacity` assumed all sections share equal row height (`ceil(sectionCount/2)` rows). With 5 sections (3 left, 2 right), left sections get less height each than right sections.
- **Solution**: `calculateColumnCapacity` in designSystem.js computes per-column limits independently. Returns a `perSection` array where even indices get left-column capacity and odd indices get right-column capacity.
- **Status**: Function implemented, partially wired into CreateLayout.jsx. Full integration is TASK-12.
