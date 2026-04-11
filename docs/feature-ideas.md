# Feature Ideas & Backlog

*Comprehensive feature roadmap from entire development history*

## 🚀 High Priority (MVP Features)
- [x] User authentication system (JWT + bcrypt) — Phase 3 complete
- [x] Persistent favorites (save to database with user association) — Phase 3 complete
- [x] Layout save/load with 10-layout limit per user — Phase 3 complete
- [x] Tune specialized parsers for Sublime, Docker, and Vim PDFs — Replaced with Simple AI parser
- [x] Run full AI-enhanced extraction on all PDFs — 689 shortcuts extracted via Simple AI
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] More app shortcuts (Photoshop, Figma, Chrome, Blender, After Effects)
- [ ] Sticker size templates (3x3, 3.75x3.75, mousepad dimensions)
- [ ] Shopping cart and checkout system for physical stickers

## 🐛 Bug Fixes & Data Quality
- [x] [2026-01-09] Fix Sublime Text PDF extraction — Solved with Simple AI parser (46 shortcuts)
- [x] [2026-01-09] Fix Docker PDF extraction — Solved with Simple AI parser (23 commands)
- [x] [2026-01-09] Fix Vim Cheat Sheet extraction — Solved with Simple AI parser (96 shortcuts)
- [x] [2026-01-09] Fix RStudio misclassification — Added to document classifier, 92 clean shortcuts
- [x] [2026-01-09] Fix macOS key standardization — Command-X now converts to ⌘ + X (hyphen separator support)
- [ ] Fix VIM commands display issues
  - Some shortcuts have formatting problems or missing descriptions
  - Review vim_shortcuts.csv for accuracy and encoding issues
- [ ] Resolve global CSS conflicts
  - Some Tailwind classes being overridden by global styles
  - Continue using inline styles where necessary for consistency
- [ ] Mobile menu accessibility improvements
- [ ] Cross-browser compatibility testing

## 💡 Medium Priority Features
- [ ] Dark mode toggle with system preference detection
- [ ] Keyboard navigation throughout the app
- [ ] Shortcut categories and tagging system
- [ ] Custom shortcut creation and editing
- [ ] Share layouts with others (public gallery)
- [ ] Bulk import shortcuts from JSON/CSV
- [ ] Shortcut search with fuzzy matching
- [ ] Recently viewed shortcuts history
- [ ] Keyboard shortcut conflict detection

## 🎨 UI/UX Enhancements
- [ ] Loading states and skeleton screens
- [ ] Smooth animations and micro-interactions
- [ ] Mobile-first responsive design improvements
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Better error handling with user-friendly messages
- [ ] Hover effects for navbar buttons and interactive elements
- [ ] Toast notifications for user actions
- [ ] Onboarding flow for new users
- [ ] Contextual help and tooltips
- [ ] Progressive web app (PWA) capabilities

## 🔧 Technical Improvements
- [x] [2026-01-09] Enhanced Extraction Pipeline — Replaced with Simple AI-only engine
  - ~~Tune specialized parsers~~ → Simple AI parser handles all formats
  - Simple AI parser: `simple_extraction_engine.py` uses Claude Haiku only
  - Key standardization: Mac symbols (⌘⌥⇧⌃) auto-applied to macOS shortcuts
  - Versioned output: `{software}_shortcuts_{version}_{timestamp}.csv`
  - 689 total shortcuts extracted across 9 PDFs, 100% success rate
- [x] [2026-01-09] Extraction Pipeline Export Formats
  - CSV with standardized + original key columns
  - Versioned files with `latest/` folder for easy access
  - Extraction summary JSON per run
- [ ] [2026-01-09] File Naming Convention for Source PDFs
  - Standard: `{Software}_{Platform}_shortcuts.pdf`
  - Documented in `enhanced_pipeline/FILE_NAMING_CONVENTION.md`
- [ ] [2026-01-09] Virtual Environment Cleanup
  - Keep: `enhanced_pipeline_env_312/` (Python 3.12, all deps)
  - Remove: `.venv/` (empty), `enhanced_pipeline_env/` (Python 3.13, broken), `pdf_env/` (old)
- [ ] [2025-12-09] AWS Infrastructure Enhancements (High Priority)
  - Implement CloudWatch monitoring for Lambda functions
  - Add DLQ (Dead Letter Queue) for failed PDF processing
  - Set up CloudFormation/Terraform state management
  - Create automated backup system for S3 buckets
- [ ] [2025-12-09] PDF Processing Pipeline Improvements (Medium Priority)
  - Add support for more PDF formats and layouts
  - Implement OCR fallback for image-based PDFs
  - Create quality scoring for extracted shortcuts
  - Add batch processing UI for manual uploads
- [ ] TypeScript migration for better type safety
- [ ] Redis caching for frequently accessed shortcuts
- [ ] Unit and integration testing (Jest + React Testing Library)
- [ ] Performance optimization and code splitting
- [ ] SEO optimization and meta tags
- [ ] API rate limiting and security headers
- [ ] Database indexing for faster queries
- [ ] Image optimization for app logos
- [ ] Bundle size optimization
- [ ] Error tracking and monitoring (Sentry)

## 📊 Analytics & Insights
- [ ] User behavior tracking (privacy-focused)
- [ ] Popular shortcuts analytics
- [ ] Layout creation metrics
- [ ] A/B testing framework
- [ ] Performance monitoring dashboard

## 📱 Future Platform Expansion
- [ ] Mobile app (React Native)
- [ ] Browser extension for quick shortcut lookup
- [ ] Desktop app (Electron)
- [ ] VS Code extension integration
- [ ] Figma plugin for designers
- [ ] Alfred workflow integration

## 🌐 Community Features
- [ ] User-contributed shortcuts with moderation
- [ ] Community voting on shortcut accuracy
- [ ] Shortcut request system
- [ ] User profiles and achievement system
- [ ] Social sharing of layouts
- [ ] Comments and reviews on layouts

## 💼 Business Features
- [ ] Subscription tiers (free vs premium)
- [ ] Bulk ordering for teams/companies
- [ ] Custom branding options
- [ ] Enterprise dashboard
- [ ] Affiliate program
- [ ] Referral system

## 🔍 Development Workflow
- [ ] [2025-12-09] AWS Profile Management (High Priority)
  - Resolve AWS profile name issues with quotes in config
  - Standardize environment variable handling across tools
  - Create consistent CLI command patterns
- [ ] [2025-12-09] Infrastructure as Code Best Practices (High Priority)
  - Migrate all AWS resources to Terraform management
  - Implement proper state file management and locking
  - Create separate environments (dev/staging/prod)
  - Add Terraform validation and planning workflows
- [ ] [2025-12-09] Chat session management strategy
  - Context memory limitations in long development sessions
  - Automated documentation updates
  - Better continuity across AI assistant sessions
- [ ] [2025-12-09] CSS Architecture Refactoring (High Priority)
  - Remove inline styles and !important declarations
  - Implement CSS custom properties for theming
  - Set up CSS modules or styled-components
  - Fix global CSS conflicts
- [ ] [2025-12-09] Enhanced Dark Mode Features (Medium Priority)
  - Smooth theme transition animations
  - Per-component theme customization
  - Theme persistence in localStorage
  - System theme change detection
- [ ] Automated deployment pipeline
- [ ] Staging environment setup
- [ ] Database migration system
- [ ] Backup and disaster recovery

## 🎯 Domain & Hosting
- [ ] Secure handsonkeyboard.com domain
- [ ] Production hosting setup (Vercel + Railway/PlanetScale)
- [ ] CDN configuration for global performance
- [ ] SSL certificate and security headers
- [ ] Email service integration (transactional emails)

## 2026-01-10 Updates

### ✅ Completed This Session
- [x] [2026-01-10] Virtual environment cleanup — removed `.venv/`, `enhanced_pipeline_env/`, `pdf_env/` (freed ~185MB)
- [x] [2026-01-10] Python file cleanup — removed 20+ obsolete scripts, deleted `PDF_Scrapper/` and `enhanced_pipeline/`
- [x] [2026-01-10] Created clean `shortcut_extractor/` directory with only essential files
- [x] [2026-01-10] Consolidated output to single `output/` directory at root
- [x] [2026-01-10] PNG image support — Claude Vision extracts shortcuts from screenshots
- [x] [2026-01-10] Smart library management — tracks file changes, skips unchanged files
- [x] [2026-01-10] Platform splitting — no more "Cross-platform" or "All", only macOS and Windows
- [x] [2026-01-10] Force extraction tool — `force_extraction.py` for selective re-scanning
- [x] [2026-01-10] Renamed `Shortcut_PDF/` → `source_keyboard_shortcuts/` (format-agnostic)
- [x] [2026-01-10] Terminology update — "Software" → "Application" throughout system
- [x] [2026-01-10] AWS Lambda handler and deployment guide for serverless processing

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-10] Support additional image formats (JPEG, SVG) for shortcut extraction
- [ ] [2026-01-10] Web upload interface for source files (drag-and-drop PDFs/PNGs)
- [ ] [2026-01-10] Automatic software version detection from filenames (e.g., `VSCode_v1.85_macOS_shortcuts.pdf`)
- [ ] [2026-01-10] Scheduled AWS EventBridge scans for automatic library updates
- [ ] [2026-01-10] REST API for sticker app to query shortcut library (`/applications`, `/search`, `/status`)
- [ ] [2026-01-10] User-submitted shortcut screenshots — upload PNG, AI extracts shortcuts
- [ ] [2026-01-10] Shortcut diff reports — show what changed between extraction versions

### 🔧 Updated Technical Items
- [x] [2026-01-10] File Naming Convention updated for PNGs: `{Software}_{Platform}_screenshot.png`
- [x] [2026-01-10] Virtual Environment Cleanup — completed, only `enhanced_pipeline_env_312/` remains
- [ ] [2026-01-10] Fix document classifier syntax error (duplicate dict entries)
- [ ] [2026-01-10] Deploy extraction pipeline to AWS Lambda
- [ ] [2026-01-10] Build shortcut library API for sticker app frontend integration

## 2026-01-10 Output Standardization & CLI Platform Updates (~00:30 MT)

### ✅ Completed This Session (Continued)
- [x] [2026-01-10] Fixed document classifier syntax error (duplicate dict entries)
- [x] [2026-01-10] Full terminology migration — `SoftwareVersion` → `ApplicationVersion`, `software_versions.json` → `application_versions.json`
- [x] [2026-01-10] Platform-specific output files — each CSV contains one platform only (`{app}_{platform}_shortcuts_latest.csv`)
- [x] [2026-01-10] Platform detection from filename — prioritized over text content analysis
- [x] [2026-01-10] Fixed image AI parser cross-platform extraction — Claude Vision now reads both Mac and Windows columns
- [x] [2026-01-10] Fixed platform normalization — `Mac` → `macOS` mapping in image parser response
- [x] [2026-01-10] Added "CLI" platform for command-line tools (Vim, Git, Docker CLI, etc.)
- [x] [2026-01-10] Renamed Vim source files to `Vim_CLI_shortcuts.*` — single output file for all Vim shortcuts
- [x] [2026-01-10] Created `NAMING_CONVENTIONS.md` documenting input/output file naming standards
- [x] [2026-01-10] PDF vs PNG comparison for RStudio — PNG better for cross-platform, PDF better for single-platform

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-10] Automated cross-platform file splitting — detect multi-section PDFs and split into separate platform files before extraction
- [ ] [2026-01-10] Combined + split output strategy — generate one combined CSV per application (all platforms) then split into platform-specific files for different use cases
- [ ] [2026-01-10] HTML source file support — many shortcut pages are web-based, save-as-HTML could be a third input format
- [ ] [2026-01-10] Automated web scraping — Google search "{app} keyboard shortcuts" and auto-extract from web pages
- [ ] [2026-01-10] CLI tool auto-detection improvements — detect from content patterns (`:w`, `$ command`, `#` comments) not just filename

### 🔧 Updated Technical Items
- [x] [2026-01-10] Fix document classifier syntax error — DONE
- [x] [2026-01-10] Image AI parser cross-platform fix — DONE (vision prompt + platform normalization)
- [ ] [2026-01-10] Investigate `vs_code_confidence:_100_shortcuts_latest.csv` — spurious file from malformed shortcut line
- [ ] [2026-01-10] Deploy extraction pipeline to AWS Lambda
- [ ] [2026-01-10] Build shortcut library API for sticker app frontend integration

## 2026-01-10 Text File Support, OSA Platform & Naming Convention Session (~22:40 MT)

### ✅ Completed This Session
- [x] [2026-01-10] Text file (.txt) support — pipeline now processes PDF, PNG, and TXT files through unified AI parser
- [x] [2026-01-10] JupyterLab shortcuts added — `jupyterlab_macOS_shortcuts.txt` and `jupyterlab_Windows_shortcuts.txt` (29 shortcuts each)
- [x] [2026-01-10] CLI → OSA platform rename — "Operating System Agnostic" replaces "CLI" throughout pipeline
- [x] [2026-01-10] OSA naming convention — source files with `_OSA_` generate single output file
- [x] [2026-01-10] Platform detection priority fix — filename platform takes precedence over OSA tool detection
- [x] [2026-01-10] AI parser platform enforcement — strict instructions prevent AI from overriding source file platform
- [x] [2026-01-10] Unified AI pipeline — all file types (PDF, PNG, TXT) go through single Simple AI parser path
- [x] [2026-01-10] Output cleanup script — `cleanup_outputs.py` for fresh testing runs
- [x] [2026-01-10] Run path fix — `run_extraction.py` works from both root and `shortcut_extractor/` directory
- [x] [2026-01-10] Updated `NAMING_CONVENTIONS.md` with OSA platform documentation

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-10] Parser validation for malformed AI output — reject entries where platform contains "CONFIDENCE:" or other non-platform values
- [ ] [2026-01-10] TXT file auto-detection from content — detect markdown-style shortcut lists without requiring specific file naming
- [ ] [2026-01-10] Cleanup script integration into run_extraction.py — optional `--clean` flag to clear outputs before extraction
- [ ] [2026-01-10] Source file format guide — document best practices for creating TXT shortcut files (markdown format with backtick key notation)

### 🔧 Updated Technical Items
- [x] [2026-01-10] CLI → OSA platform migration — DONE (all files updated)
- [x] [2026-01-10] Text file support — DONE (unified AI pipeline)
- [ ] [2026-01-10] Fix `vs_code_confidence:_100_shortcuts_latest.csv` — malformed AI output creating spurious file
- [ ] [2026-01-10] Fix RStudio Cross-platform — only generating Windows file, missing macOS shortcuts
- [ ] [2026-01-10] Ensure Vim OSA generates only one output file (AI still extracting some shortcuts as "Windows")
- [ ] [2026-01-10] Deploy extraction pipeline to AWS Lambda
- [ ] [2026-01-10] Build shortcut library API for sticker app frontend integration

## 2026-01-10 Vim OSA Fix, Cross-Platform Pipeline & Smart Fallback Session (~23:55 MT)

### ✅ Completed This Session
- [x] [2026-01-10] Vim OSA post-processing fix — forces all shortcuts to OSA when source file is OSA (AI prompt alone insufficient)
- [x] [2026-01-10] Key standardizer OSA support — OSA shortcuts keep original format, no Mac/Windows conversion
- [x] [2026-01-10] VS Code confidence file fix — malformed AI output validation rejects entries with invalid platform values
- [x] [2026-01-10] Key standardization order fix — now runs AFTER platform splitting (was before, causing RStudio Mac loss)
- [x] [2026-01-10] Document structure analyzer — detects table/section/list format and platform column organization
- [x] [2026-01-10] Table parser — direct Python parsing for table-format documents (no AI needed)
- [x] [2026-01-10] Cross-platform processor — fallback expansion when AI fails to extract mixed platforms
- [x] [2026-01-10] Python-first extractor — hybrid system using Python parsing primary, AI validation backup
- [x] [2026-01-10] Smart fallback system — detects cross-platform single output, low count, platform mismatch problems
- [x] [2026-01-10] Platform detection correction — Ctrl/Alt are ambiguous (used on both macOS and Windows), not Windows-only
- [x] [2026-01-10] Cleanup script fix — truncated `cleanup_outputs.py` completed with verification step

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-10] Python-first extraction as default for table-format documents — faster, more reliable, no AI cost
- [ ] [2026-01-10] AI validation pass after Python extraction — use AI to verify and enhance Python-extracted shortcuts
- [ ] [2026-01-10] Document structure analysis caching — store structure analysis results to avoid re-analyzing unchanged files
- [ ] [2026-01-10] Cross-platform source file auto-splitting — detect multi-column PDFs and extract each column separately
- [ ] [2026-01-10] Extraction quality scoring — compare Python vs AI results and use the better one automatically

### 🔧 Updated Technical Items
- [x] [2026-01-10] Fix Vim OSA — DONE (post-processing override + key standardizer OSA support)
- [x] [2026-01-10] Fix `vs_code_confidence:_100_shortcuts_latest.csv` — DONE (malformed entry validation)
- [x] [2026-01-10] Fix key standardization order — DONE (after platform splitting)
- [ ] [2026-01-10] Fix RStudio Cross-platform — table parser not recognizing RStudio table headers (needs debugging)
- [ ] [2026-01-10] Deploy extraction pipeline to AWS Lambda
- [ ] [2026-01-10] Build shortcut library API for sticker app frontend integration

## 2026-01-11 Quality Review & AI Validation Updates

### ✅ Completed This Session
- [x] [2026-01-11] Quality review system — `quality_reviewer.py` validates all extractions at end of pipeline
- [x] [2026-01-11] AI-powered malformed shortcut validation — `ai_shortcut_validator.py` uses Claude to verify suspicious shortcuts
- [x] [2026-01-11] Review folder — `output/csv_exports/review/` with quality reports, malformed data, false positives
- [x] [2026-01-11] RStudio cross-platform fix — now generates macOS file (was missing entirely)
- [x] [2026-01-11] Smart fallback integration fix — runs even when 0 shortcuts extracted
- [x] [2026-01-11] Document structure analyzer vertical header detection — handles RStudio's separate-line headers
- [x] [2026-01-11] Key standardizer disabled — was corrupting Mac shortcuts by converting symbols
- [x] [2026-01-11] Simplified CSV format — single `key_combination` column preserving original format
- [x] [2026-01-11] Cross-platform extraction QA spec — `.kiro/specs/cross-platform-extraction-qa.md`

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-11] Re-enable key standardizer with Mac-safe mode — convert text to symbols (Cmd→⌘) but never convert symbols to text
- [ ] [2026-01-11] Vertical table parser — handle documents where headers and data are on separate lines (RStudio style)
- [ ] [2026-01-11] Quality dashboard — visual summary of extraction quality across all applications
- [ ] [2026-01-11] Auto-correction for malformed shortcuts — use AI suggestions to fix invalid entries automatically
- [ ] [2026-01-11] Confidence-based filtering — only include shortcuts above a confidence threshold in final output
- [ ] [2026-01-11] Per-application extraction profiles — store known document structure for each app to skip analysis on re-runs

### 🔧 Updated Technical Items
- [x] [2026-01-11] Fix smart fallback for 0-shortcut case — DONE
- [x] [2026-01-11] Fix document structure analyzer vertical headers — DONE
- [x] [2026-01-11] Disable key standardizer — DONE (preserving accuracy)
- [ ] [2026-01-11] Fix RStudio "unknown" platform file — Python-first extractor needs vertical table parsing
- [ ] [2026-01-11] Improve Python-first extractor table detection for vertical layouts
- [ ] [2026-01-11] Deploy extraction pipeline to AWS Lambda
- [ ] [2026-01-11] Build shortcut library API for sticker app frontend integration

## 2026-01-11 Database Integration & Sticker Design Updates

### ✅ Completed This Session
- [x] [2026-01-11] Database integration — `database_loader.js` loads extracted CSV shortcuts into Prisma database
- [x] [2026-01-11] SQLite for local development — no PostgreSQL server needed, `file:./dev.db`
- [x] [2026-01-11] Multi-app layout fix — CreateLayout now properly fetches shortcuts for multiple selected apps
- [x] [2026-01-11] Search expansion in layout — searching shows results from ALL apps, not just selected
- [x] [2026-01-11] Platform detection for multi-app — `checkPlatforms()` now handles array of app names
- [x] [2026-01-11] AWS SSO shell aliases — `awslogin`, `awsstatus`, `awslogout` in `~/.zshrc`
- [x] [2026-01-11] Python environment steering rule — `.kiro/steering/python-environment.md`
- [x] [2026-01-11] Root directory cleanup — removed 11 debug/test Python scripts
- [x] [2026-01-11] Full extraction run — 1765 shortcuts from 12 files loaded into database (709 unique)

### 📋 New Feature Ideas from This Session
- [ ] [2026-01-11] Sticker layout visual design spec — Canva-like graphic design tool for keyboard shortcut stickers
- [ ] [2026-01-11] 2 sticker sizes: 3.75×3.75" and 3×3" with proper DPI-accurate rendering
- [ ] [2026-01-11] 3 text size options controlling max shortcuts per layout (predetermined limits)
- [ ] [2026-01-11] Section count controlled by sticker size + text size combination
- [ ] [2026-01-11] Match sticker design to Adobe SVG examples in `Sticker Layouts/` folder
- [ ] [2026-01-11] SVG export for print-ready sticker output
- [ ] [2026-01-11] Sticker preview with actual DPI-accurate dimensions
- [ ] [2026-01-11] Predetermined layout characteristics (early version) → user customization (later)
- [ ] [2026-01-11] Database loader as npm script — `npm run reload-shortcuts` for easy data refresh
- [ ] [2026-01-11] Cross-platform source file strategy — find separate OS-specific source files to avoid extraction imbalance

### 🔧 Updated Technical Items
- [x] [2026-01-11] Database integration — DONE (SQLite + Prisma + database_loader.js)
- [x] [2026-01-11] Multi-app layout fix — DONE (fetchShortcuts, checkPlatforms, useEffect dependencies)
- [ ] [2026-01-11] Create sticker layout visual design spec
- [ ] [2026-01-11] Implement sticker size constraints with DPI-accurate rendering
- [ ] [2026-01-11] Add text size options with shortcut count limits
- [ ] [2026-01-11] Switch to PostgreSQL for production deployment
- [ ] [2026-01-11] Deploy extraction pipeline to AWS Lambda

## 2026-04-10 Sticker Layout Visual Design Updates

### ✅ Completed This Session
- [x] [2026-04-10] Sticker layout visual design spec — deterministic rules at `.kiro/specs/sticker-layout-visual-design-kiro.md`
- [x] [2026-04-10] Design system constants — `designSystem.js` with palettes, typography, symbols, sizes, spacing
- [x] [2026-04-10] 5 color palettes: Classic (#00AAFF), VS Code (#007ACC), Kiro (#8B5CF6), Dark (#60A5FA), Monochrome (#000000)
- [x] [2026-04-10] 2 image sizes: 3.75" (1125×1125px @300DPI, 16" laptops) and 3" (900×900px @300DPI, 15" or smaller)
- [x] [2026-04-10] 3 text sizes: small (60/48 shortcuts), medium (42/36), large (28/24) — per sticker size
- [x] [2026-04-10] Standardized key symbols: macOS (⌘⌥⌃⇧⌫⏎) and Windows (⊞, Ctrl, Alt, ⇧, Del, ↵)
- [x] [2026-04-10] Typography system: Inter/SF Pro for text, SF Mono/Consolas for keys, system fonts only
- [x] [2026-04-10] Canvas updated with dynamic sizing, palette colors, proper typography
- [x] [2026-04-10] Image size selection with laptop size guidance in initial setup
- [x] [2026-04-10] Text size selection with dynamic capacity display in initial setup
- [x] [2026-04-10] Color palette selection with visual swatches in initial setup

### 📋 New Feature Ideas from This Session
- [ ] [2026-04-10] Preview Mode — separate from editing, renders true-to-print layout with exact font metrics
- [ ] [2026-04-10] SVG export — vector format with embedded/outlined fonts at exact DPI dimensions
- [ ] [2026-04-10] PNG export — rasterized at 300 DPI with exact pixel dimensions
- [ ] [2026-04-10] Home printing download option — RGB PNG/SVG for inkjet/laser printers
- [ ] [2026-04-10] Professional printing submission — die-cut stickers printed and mailed to user
- [ ] [2026-04-10] Template library — pre-designed layouts users can start from
- [ ] [2026-04-10] Color palette library — expandable collection of 3-color palettes (background, border, text)
- [ ] [2026-04-10] Software-branded palettes — VS Code blue, Kiro purple, Sublime orange, Vim green, etc.
- [ ] [2026-04-10] Safe zone enforcement — 0.125" bleed area and 0.2" inner safe zone with no content
- [ ] [2026-04-10] Preview/export parity — preview must match exported output within ±1px tolerance (BR-2)
- [ ] [2026-04-10] Deterministic layout output — same shortcuts in any editing order produce identical layout (BR-3)

### 🔧 Updated Technical Items
- [x] [2026-04-10] Design system constants file — DONE (`designSystem.js`)
- [x] [2026-04-10] CreateLayout.jsx Phase 1 updates — DONE (partial, bug in initial setup)
- [ ] [2026-04-10] Fix `sizes` variable reference error in CreateLayout.jsx
- [ ] [2026-04-10] Implement Preview Mode toggle
- [ ] [2026-04-10] Implement SVG/PNG export at 300 DPI
- [ ] [2026-04-10] Add bleed area and inner safe zone enforcement
- [ ] [2026-04-10] Validation: home inkjet, laser, professional die-cut print tests

## 2026-04-10 Phase 1 Completion & Phase 2 Export/Save Updates

### ✅ Completed This Session
- [x] [2026-04-10] Fix `sizes` variable reference error — replaced with `Object.values(IMAGE_SIZES)`
- [x] [2026-04-10] Fix `layoutSize` references — replaced with `imageSize` throughout
- [x] [2026-04-10] Image size selection UI with laptop size descriptions
- [x] [2026-04-10] Text size selection UI with dynamic capacity counts
- [x] [2026-04-10] Color palette selection UI with visual swatches
- [x] [2026-04-10] Key formatting with " + " spacing (⌘ + K instead of ⌘K)
- [x] [2026-04-10] App icon hover tooltip in left sidebar
- [x] [2026-04-10] Shortcut filtering by selected app(s) on canvas load
- [x] [2026-04-10] PNG export at 300 DPI (html2canvas)
- [x] [2026-04-10] Layout title input and display on canvas
- [x] [2026-04-10] Export quality fixes (no delete buttons, no placeholders, left-aligned)
- [x] [2026-04-10] Print CSS for home printing at actual sticker size
- [x] [2026-04-10] Logo integration (bottom right of canvas)
- [x] [2026-04-10] Zoom controls (buttons + Ctrl/Cmd scroll + trackpad pinch)
- [x] [2026-04-10] SVG export button
- [x] [2026-04-10] Save layout to JSON file
- [x] [2026-04-10] Load layout from JSON file
- [x] [2026-04-10] Auto-save to localStorage on save

### 📋 New Feature Ideas from This Session
- [ ] [2026-04-10] Excalidraw-style canvas UI — full browser window canvas, pinned collapsible sidebar, floating zoomable sticker
- [ ] [2026-04-10] Auto-save to localStorage on interval (every 30 seconds)
- [ ] [2026-04-10] "Recover Last Session" prompt on page load when localStorage has saved layout
- [ ] [2026-04-10] Template library — pre-made layouts for VS Code, Vim, macOS, Chrome
- [ ] [2026-04-10] Dynamic key column width — calculate per-section based on longest key
- [ ] [2026-04-10] Per-section capacity indicators — show X/12 per section
- [ ] [2026-04-10] Description text optimization — measure actual text width for precise truncation
- [ ] [2026-04-10] Safe zone visualization — toggle overlay showing bleed and inner safe zones
- [ ] [2026-04-10] Preview mode toggle — hide edit controls, show exact print output
- [ ] [2026-04-10] Multiple stickers on canvas (future — Excalidraw-style)
- [ ] [2026-04-10] Mini-map for large canvas (future — Excalidraw-style)

### 🔧 Updated Technical Items
- [x] [2026-04-10] Fix `sizes` variable reference — DONE
- [x] [2026-04-10] Implement PNG export at 300 DPI — DONE
- [x] [2026-04-10] Implement SVG export — DONE (button added, utility created)
- [x] [2026-04-10] Save/load layouts — DONE (JSON file + localStorage)
- [x] [2026-04-10] Zoom controls — DONE (buttons + scroll + pinch)
- [ ] [2026-04-10] Test SVG export in Illustrator/Inkscape
- [ ] [2026-04-10] Create template library (3-5 templates)
- [ ] [2026-04-10] Print test on home printer
- [ ] [2026-04-10] Excalidraw-style UI redesign (deferred to after real usage)

## 2026-04-10 Phase 2 Testing & Print Legibility Updates (Evening)

### ✅ Completed This Session
- [x] [2026-04-10] Search across all apps — typing shows results from ALL apps, not just selected
- [x] [2026-04-10] Search by app name — type "vim" or "docker" to find all shortcuts for that app
- [x] [2026-04-10] Backend search simplification — JavaScript filtering replaces complex Prisma queries
- [x] [2026-04-10] Platform filter bypass during search — search shows all results regardless of platform
- [x] [2026-04-10] Key column width increase — 80px → 120px with word wrapping for long shortcuts
- [x] [2026-04-10] Sticky header row — App/Key/Description/♥ stays fixed while scrolling
- [x] [2026-04-10] App icon cursor fix — changed from question mark to normal arrow
- [x] [2026-04-10] Save/Load hybrid — downloads JSON file AND saves to localStorage
- [x] [2026-04-10] Key spacing consistency — symbols adjacent to letters now get " + " spacing
- [x] [2026-04-10] PNG export dimension fix — uses design system dimensions, not DOM measurement
- [x] [2026-04-10] Print-optimized font sizes — 60-80% larger for legibility on printed stickers
- [x] [2026-04-10] Fixed canvas height — strict 600×600 or 480×480 (no overflow)
- [x] [2026-04-10] Per-text-size section/shortcut limits — guaranteed to fit within sticker
- [x] [2026-04-10] Capacity indicator — color-coded green/yellow/red with emoji warnings

### 📋 New Feature Ideas from This Session
- [ ] [2026-04-10] Font size fine-tuning tool — compare exported PNG against printed examples from `Sticker Layouts/` folder
- [ ] [2026-04-10] Print preview mode — show sticker at actual physical size on screen (requires DPI detection)
- [ ] [2026-04-10] Professional printing service — user submits SVG, you print on sticker material and ship
- [ ] [2026-04-10] User accounts with cloud storage — registered users save layouts in-app, free users use file-based save
- [ ] [2026-04-10] Tiered pricing model — Free (file save/export), Pro ($5/mo cloud storage), Print Service ($15-25/sticker)
- [ ] [2026-04-10] Search result count indicator — show "96 results for vim" in search panel
- [ ] [2026-04-10] Section name editing inline — double-click section header to rename
- [ ] [2026-04-10] Drag to reorder sections — rearrange section positions on sticker
- [ ] [2026-04-10] Undo/redo for layout changes — Ctrl+Z to undo last shortcut add/remove

### 🔧 Updated Technical Items
- [x] [2026-04-10] Backend search fix — DONE (JavaScript filtering, server restart required)
- [x] [2026-04-10] PNG export dimensions — DONE (uses designSystem constants)
- [x] [2026-04-10] Font size increase for print — DONE (all three text sizes updated)
- [x] [2026-04-10] Section limits enforcement — DONE (per-text-size with auto-trim)
- [ ] [2026-04-10] Fine-tune limits against real printed examples
- [ ] [2026-04-10] Fix SVG export text positioning
- [ ] [2026-04-10] Remove debug console.log from fetchShortcuts
- [ ] [2026-04-10] Add auto-save on layout changes (useEffect)
- [ ] [2026-04-10] Add session recovery on startup

## 2026-04-10 Phase 3 Authentication & Save System Updates (~01:30 MT)

### ✅ Completed This Session
- [x] [2026-04-10] User authentication system — JWT + bcryptjs, register/login/logout
- [x] [2026-04-10] User profile management — edit name/email, change password, delete account
- [x] [2026-04-10] Layout save to account — 10-layout limit per user, JSON storage
- [x] [2026-04-10] SaveModal component — different flows for logged-in vs guest users
- [x] [2026-04-10] Guest save strategy — browser localStorage (temporary) + file download
- [x] [2026-04-10] Export options in SaveModal — JSON source file, PNG print-ready, SVG vector
- [x] [2026-04-10] UserHome page — 4 tabs: Profile, Saved Layouts (X/10), Security, Danger Zone
- [x] [2026-04-10] SignIn/SignUp pages connected to auth API
- [x] [2026-04-10] Database schema updated — Layout stores JSON, CASCADE deletes, no LayoutShortcut table
- [x] [2026-04-10] Section text wrapping — descriptions wrap instead of truncating
- [x] [2026-04-10] Revised section limits — Small(4×10=40), Medium(4×8=32), Large(4×6=24)
- [x] [2026-04-10] Per-section capacity indicator — X/Y count with color coding in section header
- [x] [2026-04-10] AI layout optimization discussed and deferred to Phase 4

### 📋 New Feature Ideas from This Session
- [ ] [2026-04-10] AI-powered layout auto-arrange — categorize and distribute shortcuts optimally across sections
- [ ] [2026-04-10] AI capacity prediction — real-time calculation of how many shortcuts fit based on actual text content
- [ ] [2026-04-10] AI layout suggestions — "Balanced", "Grouped by Function", "Most Used First", "Compact"
- [ ] [2026-04-10] Conversational AI assistant — "Put all navigation shortcuts in section 1"
- [ ] [2026-04-10] Navigation user menu — show user name + logout when signed in, Sign In button when not
- [ ] [2026-04-10] Load saved layouts into editor — click layout in UserHome, opens in CreateLayout
- [ ] [2026-04-10] Layout thumbnails — generate preview images for saved layouts in UserHome
- [ ] [2026-04-10] Auto-save to account — periodic save for logged-in users (every 60 seconds)
- [ ] [2026-04-10] "Recover Last Session" — prompt on CreateLayout load when localStorage has saved layout
- [ ] [2026-04-10] Tiered pricing — Free (10 layouts, browser save), Pro (unlimited layouts, priority support)

### 🔧 Updated Technical Items
- [x] [2026-04-10] User authentication — DONE (JWT + bcryptjs + Prisma)
- [x] [2026-04-10] Layout save to account — DONE (10-limit, JSON storage)
- [x] [2026-04-10] SaveModal integration — DONE (CreateLayout.jsx)
- [x] [2026-04-10] Database schema update — DONE (migration applied)
- [x] [2026-04-10] User accounts with persistent storage — DONE (replaces "cloud storage" terminology)
- [ ] [2026-04-10] Update navigation with user menu
- [ ] [2026-04-10] Load saved layouts into CreateLayout editor
- [ ] [2026-04-10] Print test with current font sizes
- [ ] [2026-04-10] Mobile responsiveness for UserHome and SaveModal
