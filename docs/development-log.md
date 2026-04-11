# Development Log - HandsOnKeyboard.com

*Comprehensive timeline of all development work*

## Project Foundation (Early Sessions)
### Initial Setup & Architecture
- ✅ Created React frontend with React Router navigation
- ✅ Built Express backend with Prisma ORM and PostgreSQL
- ✅ Designed comprehensive database schema (User, App, Shortcut, Layout, LayoutShortcut models)
- ✅ Established project structure with frontend/backend separation
- ✅ Set up development environment and dependencies

### Core Pages Development
- ✅ Landing page with hero section and feature showcase
- ✅ Browse Shortcuts page with search functionality
- ✅ Create Layout page for sticker design
- ✅ Profile page for user management
- ✅ Authentication pages (SignIn/SignUp) with modal design
- ✅ Success page for completed actions
- ✅ AppShell with navigation and routing

## Data & Backend Implementation
### PDF Scraping & Data Pipeline
- ✅ Created Python scripts to extract shortcuts from PDF files
- ✅ Built CSV conversion system for structured data
- ✅ Implemented database seeding scripts with duplicate prevention
- ✅ Added VS Code shortcuts (comprehensive coverage)
- ✅ Added Vim shortcuts (101 commands with descriptions)

### Database Design Decisions
- Chose single shortcuts table with platform column (windows/mac/cross-platform)
- Implemented unique constraint on (keys, appId, platform) combination
- Used findFirst checks in seed scripts to prevent duplicates
- Designed flexible schema for future app additions

## Frontend Features & UX
### Browse Shortcuts Enhancement
- ✅ Connected frontend to database with real data
- ✅ Implemented search functionality across apps and shortcuts
- ✅ Added favorites system with heart icons (local state)
- ✅ Created zoom/focus modal for individual app shortcuts
- ✅ Built responsive tile grid with auto-width functionality
- ✅ Added conditional search bar within focused app view

### Styling & Design System
- ✅ Implemented Tailwind CSS with custom styling
- ✅ Created floating modal-style authentication forms
- ✅ Added blue hover effects and interactive elements
- ✅ Solved navbar positioning and content spacing issues
- ✅ Used inline styles when Tailwind classes conflicted with global CSS

## 2025-12-09 Session Updates
### [14:30 MT] Profile Page Navigation Enhancement
- ✅ Converted static sidebar to floating sticky navigation menu
- ✅ Implemented smooth scroll-to-section functionality
- ✅ Added collapsible menu with up/down arrow toggle
- ✅ Fixed positioning to stay visible during content scroll
- ✅ Centered main content panel with proper whitespace

### [15:15 MT] Dark Mode Implementation
- ✅ Added comprehensive dark mode support across entire app
- ✅ Implemented browser preference detection with `prefers-color-scheme`
- ✅ Created dark mode context provider in AppShell
- ✅ Added toggle button in navigation bar with sun/moon icons
- ✅ Updated all pages (Landing, Profile, CreateLayout, BrowseShortcuts)
- ✅ Fixed global CSS conflicts with inline styles and `!important`

### [16:00 MT] CreateLayout Page Redesign
- ✅ Rebuilt CreateLayout to match Excalidraw mockup design
- ✅ Implemented browser-style interface with search bar
- ✅ Added left sidebar with "All apps" and "Favorites" tabs
- ✅ Created app list with grid layout (App Name | Command columns)
- ✅ Added dark canvas area for sticker layout preview
- ✅ Integrated with dark mode theming

### [16:30 MT] Styling Architecture Improvements
- ✅ Applied sophisticated fading background from HTML reference
- ✅ Implemented consistent color schemes across light/dark modes
- ✅ Added proper text color adaptation for all UI elements
- ✅ Fixed sticky menu text colors and hover states
- ✅ Resolved main content panel background override issues

## Technical Architecture
### Stack Decisions
- **Frontend**: React + React Router + Tailwind CSS
- **Backend**: Express.js + Prisma ORM + PostgreSQL
- **Data Processing**: Python scripts for PDF extraction
- **Styling Approach**: Tailwind with inline CSS fallbacks
- **State Management**: React useState hooks (no external library needed)

### Key Technical Challenges Solved
- Global CSS conflicts resolved with inline styles
- Responsive design across mobile and desktop
- Database relationships and foreign key constraints
- PDF text extraction and data cleaning
- Duplicate prevention in seeding process

## 2025-12-09 AWS Infrastructure Session
### [17:30 MT] PDF to CSV Converter Infrastructure
- ✅ Built complete AWS infrastructure using Terraform for PDF processing
- ✅ Created S3 bucket (`pdf-shortcut-converter-8caf30ba`) with automatic Lambda triggers
- ✅ Implemented Lambda function with Textract + Bedrock Claude integration
- ✅ Added error handling for unsupported PDF formats with graceful fallbacks
- ✅ Set up batch processing capability for testing multiple PDFs
- ✅ Created Python upload script to sync PDFs from local folder to S3

### [18:00 MT] Terraform Infrastructure Management
- ✅ Migrated from bash deployment scripts to Terraform for better state management
- ✅ Configured IAM roles with proper permissions for Lambda, S3, Textract, and Bedrock
- ✅ Set up S3 event notifications to trigger Lambda on PDF uploads to `pdfs/` folder
- ✅ Implemented declarative infrastructure with version control

### [18:30 MT] Lambda Function Error Handling
- ✅ Fixed Lambda crashes when processing unsupported PDF formats
- ✅ Added proper error checking before accessing success-only fields
- ✅ Implemented fallback from `analyze_document` to `detect_document_text`
- ✅ Created comprehensive error responses for failed processing

## Current Status
- **Frontend**: All core pages with Phase 3 auth and save/load complete
- **Backend**: Express server with Prisma + PostgreSQL, JWT auth, layouts API (10-layout limit)
- **Database**: 250+ shortcuts across VS Code, macOS, IntelliJ IDEA, Docker, Vim
- **UI/UX**: Consistent design system with dark mode, save modal, user home
- **Data Pipeline**: Enhanced automated extraction pipeline with AI review capabilities
- **AWS Infrastructure**: Serverless PDF processing + Bedrock AI review + Textract OCR
- **Extraction Pipeline**: Python 3.12 environment at `enhanced_pipeline_env_312/`

## 2026-01-09 Enhanced Extraction Pipeline Session
### [~10:00 MT] Complete Pipeline Architecture Design
- ✅ Analyzed existing PDF_Scrapper, PerApp_PDF_Scrapper, and PerApp_PDF_Config systems
- ✅ Designed new multi-stage extraction pipeline architecture
- ✅ Created `enhanced_pipeline/` directory with modular components:
  - `document_classifier.py` — PDF type detection (text/image/hybrid), software identification, platform detection, complexity scoring
  - `extraction_engine.py` — Multi-stage extraction: direct text, OCR (Tesseract + AWS Textract), AI-enhanced (Bedrock)
  - `database_manager.py` — SQLite storage with deduplication, confidence scoring, Prisma schema generation
  - `pipeline_orchestrator.py` — Batch processing, review queue, auto-export coordination
  - `extract_shortcuts.py` — CLI interface with full argument parsing

### [~11:00 MT] Python Environment & Dependency Resolution
- ✅ Created Python 3.12 virtual environment at `enhanced_pipeline_env_312/`
- ✅ Resolved Python 3.13 incompatibility issues (PyMuPDF, pandas build failures)
- ✅ Installed all dependencies: PyPDF2, PyMuPDF (fitz), pandas, opencv-python, Pillow, pytesseract, boto3
- ✅ All 5 pipeline test suites passing

### [~11:30 MT] First Batch Extraction Run
- ✅ Processed 9 PDF files from `Shortcut_PDF/` folder
- ✅ Extracted 334 total shortcuts, stored 250 unique (84 duplicates detected)
- ✅ Results by software: VS Code (121), macOS (91), IntelliJ IDEA (32), Docker (5), Vim (1)
- ✅ Confidence distribution: 192 high (≥90%), 38 medium (70-89%), 20 low (<70%)
- ✅ 4 files queued for human review

### [~12:00 MT] NDJSON Export Format Added
- ✅ Added NDJSON (Newline Delimited JSON) export alongside CSV and JSON
- ✅ Generated per-software and combined NDJSON files in `output/ndjson_exports/`
- ✅ Created `examples/ndjson_usage.py` with streaming processing examples

### [~12:30 MT] AWS AI Integration (Bedrock + Textract)
- ✅ Created `ai_reviewer.py` — AWS Bedrock (Claude 3 Haiku) for intelligent shortcut review
- ✅ Added AWS Textract integration for advanced OCR on image-based PDFs
- ✅ Implemented confidence-based AI review: only reviews shortcuts below threshold
- ✅ AI corrects formatting errors, standardizes key naming, filters invalid shortcuts
- ✅ Added `--use-ai`, `--aws-profile`, `--aws-region` CLI flags

### [~13:00 MT] AWS SSO Authentication Setup
- ✅ Confirmed AWS SSO profile: `'developer playground'` (with space)
- ✅ Updated all AWS clients to support `boto3.Session(profile_name=...)`
- ✅ Created `check_aws_profiles.py` and `setup_aws_sso.py` helper scripts
- ✅ Verified Bedrock + Textract access working with SSO profile
- ✅ Fixed `source_file` attribute bug in AI reviewer prompt

### [~13:30 MT] Specialized Parsers for Problem PDFs
- ✅ Diagnosed extraction failures: Sublime (Mac symbols ⌘⌥⇧⌃), Docker (CLI commands not keyboard shortcuts), Vim (single-key commands like h/j/k/l)
- ✅ Created `specialized_parsers.py` with app-specific parsing logic
- ✅ Integrated specialized parsers as fallback in extraction engine
- ⚠️ Sublime and Docker PDFs still need further parser tuning (concatenated text without clear separators)
- ⚠️ Vim cheat sheet uses single-character keys that don't match standard shortcut patterns

## 2026-01-09 AI-First Pipeline & Standardization Session (Afternoon)

### [~14:00 MT] Specialized Parser Fixes & Testing
- ✅ Fixed Sublime Text parser — rewrote Mac symbol regex for concatenated text
- ✅ Fixed Vim parser — line-by-line parsing plus common shortcuts dictionary
- ✅ Created RStudio specialized parser for Windows/Mac dual-format
- ✅ Added RStudio to document classifier software patterns and name map
- ✅ Fixed AI reviewer `source_file` attribute bug

### [~14:30 MT] Simple AI Parser — The Breakthrough
- ✅ Created `simple_ai_parser.py` — Claude Haiku with structured text format (not JSON)
- ✅ Key insight: `SHORTCUT: key | TITLE: action | PLATFORM: platform` avoids JSON parsing failures
- ✅ Results: Sublime 46 (3x), Vim 96 (4x), RStudio 91 (clean vs concatenated) — all vs regex
- ✅ Cost: ~$0.002 per document using Claude Haiku

### [~15:00 MT] AI-First Parser Attempt (Textract + Claude JSON)
- ✅ Created `ai_first_parser.py` — Textract OCR + Claude JSON extraction
- ⚠️ Textract failed on browser-generated PDFs (UnsupportedDocumentException)
- ⚠️ Claude JSON responses frequently malformed for large documents
- 💡 Conclusion: Simple AI parser with structured text is more reliable than JSON

### [~15:30 MT] Simplified Architecture — AI-Only Pipeline
- ✅ User decision: "make the simpler AI parser the only solution"
- ✅ Created `simple_extraction_engine.py` — no complex routing, AI-only
- ✅ Full batch: 689 total shortcuts, 100% success rate, ~25s per file
- ✅ RStudio finally clean: 92 properly separated shortcuts

### [~16:00 MT] Versioned Output System
- ✅ Added versioned file naming: `{software}_shortcuts_{version}_{timestamp}.csv`
- ✅ Created `latest/` folder with always-current versions
- ✅ Added extraction summary JSON per run
- ✅ Output folder: `standardized_output/csv_exports/`

### [~16:30 MT] Key Combination Standardization
- ✅ Created `key_standardizer.py` — converts text shortcuts to Mac symbols
- ✅ Mac: Command→⌘, Option→⌥, Shift→⇧, Control→⌃, Enter→↩, Delete→⌫
- ✅ Fixed hyphen separator handling (Apple docs use `Command-X` not `Command+X`)
- ✅ CSV includes both `key_combination_standardized` and `key_combination_original`
- ✅ Final batch: 689 shortcuts, 188 Mac symbols + 283 Windows text + 126 cross-platform

### [~17:00 MT] File Naming Convention & Cleanup
- ✅ Created `FILE_NAMING_CONVENTION.md` — standard: `{Software}_{Platform}_shortcuts.pdf`
- ✅ Identified virtual environments to clean up: `.venv`, `enhanced_pipeline_env`, `pdf_env`
- ✅ Only needed environment: `enhanced_pipeline_env_312/` (Python 3.12)

## Current Status
- **Frontend**: All core pages with Phase 3 auth and save/load complete
- **Backend**: Express server with Prisma + PostgreSQL, JWT auth, layouts API (10-layout limit)
- **Database**: 689 shortcuts across VS Code, macOS, IntelliJ IDEA, Docker, Vim, Sublime Text, RStudio
- **UI/UX**: Consistent design system with dark mode, save modal, user home
- **Data Pipeline**: Simple AI-only extraction engine with key standardization (`simple_extraction_engine.py`)
- **AWS Infrastructure**: Serverless PDF processing + Bedrock Claude Haiku for extraction
- **Extraction Pipeline**: Python 3.12 environment at `enhanced_pipeline_env_312/`
- **Output**: Versioned CSV exports with Mac symbol standardization in `standardized_output/`

## Next Development Priorities
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] Clean up unused virtual environments (.venv, enhanced_pipeline_env, pdf_env)
- [ ] Process additional software PDFs through Simple AI pipeline
- [ ] Additional app shortcuts (Photoshop, Figma, Chrome)
- [ ] Refactor inline styles to proper CSS architecture
- [ ] Mobile responsiveness improvements
- [ ] Performance optimization and caching

## 2026-01-10 Pipeline Cleanup, PNG Support & Library Management Session

### [~18:00 MT] Virtual Environment Cleanup
- ✅ Removed 3 unused virtual environments: `.venv/` (12M), `enhanced_pipeline_env/` (15M), `pdf_env/` (158M)
- ✅ Kept only `enhanced_pipeline_env_312/` (Python 3.12, 395M) — has all required packages (boto3, PyPDF2, etc.)
- ✅ Freed ~185MB of disk space

### [~18:15 MT] Key Standardization Fix — Hyphen Separator
- ✅ Fixed `key_standardizer.py` — Mac shortcuts now properly convert `Command-X` → `⌘ + X`
- ✅ Root cause: regex `re.split(r'[\+\s\-]+')` was splitting hyphens incorrectly
- ✅ Fix: separate logic for `+` vs `-` separators instead of one regex
- ✅ Re-ran pipeline: 689 shortcuts, all Mac shortcuts now use symbols (⌘⌥⇧⌃)

### [~18:30 MT] Python File Cleanup — Removed 20+ Obsolete Files
- ✅ Deleted from `enhanced_pipeline/`: `pipeline_orchestrator.py`, `specialized_parsers.py`, `ai_reviewer.py`, `improved_reviewer.py`, `database_manager.py`, `ai_first_parser.py`, `extract_shortcuts.py`, `example_usage.py`, `test_ai_simulation.py`, `test_problematic_pdfs.py`, `test_hyphen_format.py`, `setup_pipeline.py`, `setup_aws_sso.py`, `check_aws_profiles.py`
- ✅ Deleted root-level: `migrate_existing_data.py`, `test_pdf_compatibility.py`
- ✅ Deleted entire `PDF_Scrapper/` directory (4 Python files — old analysis tools)
- ✅ Cleaned up database files, cache, and test artifacts

### [~19:00 MT] New `shortcut_extractor/` Directory at Root
- ✅ Created clean `shortcut_extractor/` directory with only essential files
- ✅ Moved 5 core Python files: `simple_extraction_engine.py`, `simple_ai_parser.py`, `document_classifier.py`, `key_standardizer.py`, `extraction_engine.py`
- ✅ Created `run_extraction.py` (simple runner) and `test_extractor.py` (test script)
- ✅ Fixed all import paths for same-directory structure
- ✅ Tested and confirmed working — 92 shortcuts extracted from test PDF

### [~19:15 MT] Deleted `enhanced_pipeline/` Directory
- ✅ All essential files already moved to `shortcut_extractor/`
- ✅ Removed `enhanced_pipeline/` entirely
- ✅ Removed `standardized_output/` and `simple_ai_output/` directories

### [~19:30 MT] Output Directory Consolidation
- ✅ Updated all scripts to use existing `output/` directory at root instead of creating new output directories
- ✅ Output structure: `output/csv_exports/`, `output/csv_exports/latest/`, `output/json_exports/`, `output/ndjson_exports/`

### [~20:00 MT] Smart Library Management System
- ✅ Created `library_manager.py` — intelligent tracking and update detection
- ✅ File change detection using SHA256 hashing (`software_versions.json`)
- ✅ Version tracking from filenames (e.g., `VSCode_v1.85_macOS_shortcuts.pdf`)
- ✅ Library status reports (`library_metadata.json`)
- ✅ Searchable library index generation (`library_index.json`) for sticker app
- ✅ Smart batch extraction — only processes new or changed files, skips unchanged

### [~20:15 MT] PNG Image Support via Claude Vision
- ✅ Created `image_ai_parser.py` — extracts shortcuts from PNG screenshots using Claude 3 Haiku Vision
- ✅ Updated `document_classifier.py` — auto-detects PNG files, routes to Vision AI
- ✅ Image preprocessing: validates, resizes (max 1568px), converts to base64 JPEG
- ✅ Tested with `Kiro_crossplatform.png` — extracted 18 shortcuts at 100% confidence
- ✅ Same standardization and output pipeline applies to PNG-extracted shortcuts

### [~20:30 MT] Source Folder Rename
- ✅ Renamed `Shortcut_PDF/` → `source_keyboard_shortcuts/`
- ✅ Updated all references across 11 files (Python scripts, README, docs)
- ✅ Name is now format-agnostic — supports PDFs and PNGs

### [~21:00 MT] Platform Splitting — No More "Cross-platform" or "All"
- ✅ Created `platform_splitter.py` — splits cross-platform shortcuts into separate macOS and Windows entries
- ✅ Updated AI parser prompts: only output "macOS" or "Windows" (no "All", "Cross-platform", "Linux")
- ✅ Linux treated as Windows for shortcut purposes (same Ctrl/Alt/Shift keys)
- ✅ Integrated into extraction pipeline as Step 4 after standardization
- ✅ Tested: 4 original shortcuts → 6 platform-specific entries

### [~21:15 MT] Force Extraction Tool
- ✅ Created `force_extraction.py` — CLI tool for re-scanning
- ✅ Commands: `all` (fresh start), `list` (show tracked), `<software>` (re-extract specific)
- ✅ Better alternative to manually deleting `software_versions.json`

### [~21:30 MT] AWS Lambda Handler for Serverless Deployment
- ✅ Created `aws_lambda_handler.py` — handles S3 upload triggers, scheduled scans, manual extraction, API requests
- ✅ Created `aws_deployment.md` — full deployment guide with S3, Lambda, EventBridge, API Gateway
- ✅ REST API endpoints: `/status`, `/search`, `/applications`

### [~22:00 MT] Terminology Update — "Software" → "Application"
- ✅ Updated library index to use `applications` instead of `software`
- ✅ Updated status reports, API endpoints, README
- ✅ Added Kiro to document classifier software patterns and name map
- ✅ Fixed syntax error in document classifier (duplicate dict entries, missing method def)

## Current Status (2026-01-10)
- **Frontend**: All core pages with Phase 3 auth and save/load complete
- **Backend**: Express server with Prisma + PostgreSQL, JWT auth, layouts API (10-layout limit)
- **Database**: 689+ shortcuts across VS Code, macOS, IntelliJ IDEA, Docker, Vim, Sublime Text, RStudio, Kiro
- **Extraction Pipeline**: `shortcut_extractor/` — Simple AI-only engine with PNG support, platform splitting, library management
- **Output**: Versioned CSV exports with Mac symbol standardization in `output/csv_exports/`
- **Tracking**: `output/software_versions.json` tracks file hashes, extraction dates, version numbers
- **AWS Ready**: Lambda handler, deployment guide, S3 triggers, EventBridge scheduling
- **Source Files**: `source_keyboard_shortcuts/` — PDFs and PNGs

## Next Development Priorities
- [ ] Fix document classifier syntax error (duplicate dict entries at line 53)
- [ ] Run full extraction with platform splitting enabled
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] Add more application shortcuts (Photoshop, Figma, Chrome, Notion)
- [ ] Deploy extraction pipeline to AWS Lambda
- [ ] Build API endpoints for sticker app to query shortcut library

## 2026-01-10 Output Standardization, Cross-Platform Fixes & CLI Platform Session (Continued)

### [~22:30 MT] Document Classifier Syntax Error Fix
- ✅ Fixed syntax error in `document_classifier.py` — duplicate `'figma'` key in `software_patterns` dictionary caused IndentationError
- ✅ Merged duplicate entries and added `'photoshop'` pattern cleanly
- ✅ Improved `_identify_software()` with better filename parsing via `_extract_application_name_from_filename()`

### [~22:45 MT] Terminology Migration — "Software" → "Application" (Full)
- ✅ Renamed `SoftwareVersion` → `ApplicationVersion` dataclass in `library_manager.py`
- ✅ Renamed `software_versions` → `application_versions` throughout library manager
- ✅ New tracking file: `output/application_versions.json` (migrated from `software_versions.json`)
- ✅ Added backward-compatible migration: auto-detects old `software_versions.json` and migrates field names (`software_name` → `application_name`, `pdf_filename` → `file_name`, `pdf_hash` → `file_hash`)
- ✅ Updated `LibraryStatus` fields: `new_software` → `new_applications`, `updated_software` → `updated_applications`
- ✅ Updated CSV headers: `software_name` → `application_name`
- ✅ Updated library index generation to use `application_versions`

### [~23:00 MT] Platform-Specific Output File Naming
- ✅ Changed output grouping from per-application to per-application-per-platform
- ✅ Output filename format: `{application}_{platform}_shortcuts_latest.csv`
- ✅ Examples: `vs_code_macos_shortcuts_latest.csv`, `intellij_idea_windows_shortcuts_latest.csv`
- ✅ Each CSV file now contains shortcuts for exactly one platform
- ✅ Created `NAMING_CONVENTIONS.md` documenting input/output file naming standards

### [~23:15 MT] Platform Detection from Filename
- ✅ Added `_detect_platform_from_filename()` to document classifier
- ✅ Filename-based detection takes priority over text content analysis
- ✅ Supports patterns: `macOS`, `Windows`, `Cross-platform`, `crossplatform`, `cross_platform`

### [~23:30 MT] IntelliJ Cross-Platform PDF Issue — AI Only Extracting Windows
- ✅ Diagnosed: IntelliJ PDF has two sections (Windows keymap + macOS keymap) but AI only extracted Windows
- ✅ Root cause: Claude Haiku processes first section and stops, ignoring second platform section
- ✅ Added multi-section extraction to `simple_ai_parser.py`: `_split_platform_sections()` splits text by section headers, sends separate AI calls per platform
- ✅ User solution: Split `IntelliJ_Cross-platform_shortcuts.pdf` into `IntelliJ_Windows_shortcuts.pdf` + `IntelliJ_macOS_shortcuts.pdf`
- ✅ Result: IntelliJ Windows (104 shortcuts) + IntelliJ macOS (94 shortcuts) — both extracted cleanly

### [~23:45 MT] Image AI Parser — Cross-Platform Fix (Kiro PNG)
- ✅ Diagnosed: Kiro cross-platform PNG has Mac and Windows columns but only Windows shortcuts extracted
- ✅ Root cause 1: Vision prompt didn't explicitly instruct Claude to look for multiple columns
- ✅ Root cause 2: Platform normalization missing — Claude returned `PLATFORM: Mac` but system expected `macOS`
- ✅ Fix 1: Added cross-platform instruction to vision prompt when `classification.platform == 'Cross-platform'`
- ✅ Fix 2: Added platform normalization in `_parse_claude_response()`: `Mac` → `macOS`
- ✅ Result: Kiro now extracts 36 macOS + 36 Windows shortcuts (was 41 Windows-only)

### [~00:00 MT] PDF vs PNG Comparison — RStudio
- ✅ Ran side-by-side extraction of `RStudio_Cross-platform_shortcuts.pdf` vs `.png`
- ✅ PDF results: 97 total (8 macOS + 89 Windows) — poor cross-platform balance
- ✅ PNG results: 92 total (50 macOS + 42 Windows) — much better balance
- ✅ Conclusion: PNG is better for cross-platform documents (Vision AI reads both columns); PDF is better for single-platform documents (faster, more shortcuts)

### [~00:15 MT] CLI Platform for Command-Line Tools
- ✅ Added "CLI" as a new platform type for terminal-based tools (Vim, Git, Docker CLI, etc.)
- ✅ Updated `document_classifier.py`: added `cli_tools` dictionary and `_is_cli_tool()` method
- ✅ Updated `platform_splitter.py`: CLI shortcuts skip platform splitting (universal across OS)
- ✅ Updated AI parser prompts (both simple and vision): added CLI as valid platform option
- ✅ Renamed Vim source files: `Vim_Cross-platform_shortcuts.*` → `Vim_CLI_shortcuts.*`
- ✅ Result: `vim_cli_shortcuts_latest.csv` — single file with all 109 Vim shortcuts
- ✅ Docker also detected as CLI tool: `docker_cli_shortcuts_latest.csv`

### Current Output Structure (2026-01-10 ~00:30 MT)
```
output/csv_exports/latest/
├── docker_cli_shortcuts_latest.csv          (15 shortcuts)
├── intellij_idea_macos_shortcuts_latest.csv (93 shortcuts)
├── intellij_idea_windows_shortcuts_latest.csv (104 shortcuts)
├── kiro_macos_shortcuts_latest.csv          (23 shortcuts)
├── kiro_windows_shortcuts_latest.csv        (24 shortcuts)
├── macos_macos_shortcuts_latest.csv         (59 shortcuts)
├── rstudio_macos_shortcuts_latest.csv       (59 shortcuts)
├── rstudio_windows_shortcuts_latest.csv     (125 shortcuts)
├── sublime_text_macos_shortcuts_latest.csv  (46 shortcuts)
├── vim_cli_shortcuts_latest.csv             (109 shortcuts)
├── vs_code_macos_shortcuts_latest.csv       (85 shortcuts)
└── vs_code_windows_shortcuts_latest.csv     (95 shortcuts)
```

## Current Status (2026-01-10 ~00:30 MT)
- **Frontend**: All core pages with Phase 3 auth and save/load complete
- **Backend**: Express server with Prisma + PostgreSQL, JWT auth, layouts API (10-layout limit)
- **Database**: 856+ shortcuts across VS Code, macOS, IntelliJ IDEA, Docker, Vim, Sublime Text, RStudio, Kiro
- **Extraction Pipeline**: `shortcut_extractor/` — AI-only engine with PNG support, platform splitting, CLI platform, library management
- **Output**: Platform-specific versioned CSV exports in `output/csv_exports/` with `latest/` folder
- **Tracking**: `output/application_versions.json` tracks file hashes, extraction dates, version numbers
- **Platforms**: macOS, Windows, CLI (for terminal tools like Vim, Docker)
- **AWS Ready**: Lambda handler, deployment guide, S3 triggers, EventBridge scheduling
- **Source Files**: `source_keyboard_shortcuts/` — PDFs and PNGs with standardized naming

## 2026-01-10 Text File Support, OSA Platform & Naming Convention Overhaul Session

### [~13:00 MT] Output Cleanup Script
- ✅ Created `cleanup_outputs.py` — clears all output directories, removes `shortcuts.db`, recreates directory structure
- ✅ Cleans `output/csv_exports/`, `output/json_exports/`, `output/ndjson_exports/`, `output/review_queue/`
- ✅ Removes metadata files: `application_versions.json`, `library_index.json`, `library_metadata.json`
- ✅ Recreates empty directory structure including `output/csv_exports/latest/`
- ✅ Generates cleanup log at `output/cleanup_log.json`

### [~13:05 MT] Text File (.txt) Support Added
- ✅ Updated `simple_extraction_engine.py` — file scanning now includes `*.txt` alongside `*.pdf` and `*.png`
- ✅ Updated `document_classifier.py` — added `_classify_txt_document()` method for text file classification
- ✅ Updated `simple_ai_parser.py` — `_extract_text_fallback()` reads `.txt` files directly, `.png` returns filename context, `.pdf` uses PyMuPDF
- ✅ Updated `library_manager.py` — file scanning includes `*.txt`, file type detection shows 📝 TXT
- ✅ All file types (PDF, PNG, TXT) now go through the unified Simple AI parser pipeline
- ✅ Added JupyterLab to `software_patterns` and `_format_software_name()` in document classifier
- ✅ Tested with `jupyterlab_Windows_shortcuts.txt` and `jupyterlab_macOS_shortcuts.txt` — 29 shortcuts each

### [~13:10 MT] Unified AI Pipeline — All File Types Through Simple AI Parser
- ✅ Removed separate image parser routing — PNG files now go through Simple AI parser like PDF and TXT
- ✅ Single extraction path for all file types: file → text extraction → Claude → standardized output
- ✅ Simplified `extract_shortcuts()` method — no more conditional parser selection

### [~13:30 MT] Run Path Fix — Works From Both Root and shortcut_extractor/ Directory
- ✅ Updated `run_extraction.py` — auto-detects whether running from root or `shortcut_extractor/` directory
- ✅ Updated `SimpleExtractionEngine` — accepts optional `library_path` parameter
- ✅ Fixed `../output/application_versions.json` path error by passing correct output path to library manager

### [~14:00 MT] CLI → OSA Platform Naming Convention Overhaul
- ✅ Replaced "CLI" platform with "OSA" (Operating System Agnostic) throughout entire pipeline
- ✅ Updated `document_classifier.py` — `cli_tools` → `osa_tools`, `_is_cli_tool()` → `_is_osa_tool()`, returns 'OSA' instead of 'CLI'
- ✅ Updated `platform_splitter.py` — OSA shortcuts skip platform splitting (universal across OS)
- ✅ Updated `simple_ai_parser.py` — AI prompt instructions use "OSA" instead of "CLI"
- ✅ Updated `image_ai_parser.py` — vision prompt instructions use "OSA" instead of "CLI"
- ✅ Updated `NAMING_CONVENTIONS.md` — documented OSA platform type and behavior
- ✅ Added OSA to `_detect_platform_from_filename()` — recognizes `_OSA_` in filenames
- ✅ Renamed Vim source file: `Vim_CLI_shortcuts.pdf` → `Vim_OSA_shortcuts.pdf`

### [~14:00 MT] OSA Platform Rules Defined
- ✅ **OSA** = Operating System Agnostic — same shortcuts regardless of OS (e.g., Vim, Git)
- ✅ **OSA only applies to source files** — if source filename contains `_OSA_`, generate one output file
- ✅ **Cross-platform** = one source file with both macOS and Windows shortcuts → generates 2+ output files
- ✅ **macOS/Windows** = platform-specific source → generates one output file for that platform
- ✅ OSA detection: explicit `_OSA_` in filename OR known OSA tool (Vim, Git, etc.) with no explicit platform

### [~14:20 MT] Platform Detection Priority Fix
- ✅ Fixed platform detection to prioritize filename over OSA tool detection
- ✅ Logic: check filename platform first → if explicit platform found, use it → only check OSA if no platform in filename
- ✅ Prevents false OSA detection (e.g., VS Code Windows was incorrectly detected as OSA because text contained terminal references)
- ✅ JupyterLab correctly detected as Windows/macOS (not OSA) based on filename

### [~14:30 MT] AI Parser Platform Enforcement
- ✅ Updated AI prompt to strictly enforce source file platform designation
- ✅ Added explicit examples showing correct platform assignment per source file type
- ✅ Key rule: "If source is OSA: ALL shortcuts must be OSA (never Windows or macOS)"
- ✅ Prevents AI from overriding platform based on key combination analysis (e.g., `Ctrl+R` in Vim should be OSA, not Windows)

### [~14:40 MT] Confidence File Bug Investigation
- ⚠️ `vs_code_confidence:_100_shortcuts_latest.csv` still appearing intermittently
- ⚠️ Root cause: AI occasionally outputs malformed shortcut lines with "CONFIDENCE: 100" as platform name
- ⚠️ Needs parser-level validation to reject malformed entries

### Current Output Structure (2026-01-10 ~22:40 MT)
```
output/csv_exports/latest/
├── docker_macos_shortcuts_latest.csv           (29 shortcuts)
├── docker_windows_shortcuts_latest.csv         (29 shortcuts)
├── intellij_idea_macos_shortcuts_latest.csv    (93 shortcuts)
├── intellij_idea_windows_shortcuts_latest.csv  (104 shortcuts)
├── jupyterlab_macos_shortcuts_latest.csv       (29 shortcuts)  ← NEW (TXT source)
├── jupyterlab_windows_shortcuts_latest.csv     (29 shortcuts)  ← NEW (TXT source)
├── kiro_macos_shortcuts_latest.csv             (25 shortcuts)
├── kiro_windows_shortcuts_latest.csv           (29 shortcuts)
├── macos_macos_shortcuts_latest.csv            (61 shortcuts)
├── rstudio_windows_shortcuts_latest.csv        (97 shortcuts)
├── sublime_text_macos_shortcuts_latest.csv     (46 shortcuts)
├── vim_osa_shortcuts_latest.csv                (78 shortcuts)  ← OSA (was CLI)
├── vs_code_macos_shortcuts_latest.csv          (85 shortcuts)
└── vs_code_windows_shortcuts_latest.csv        (95 shortcuts)
```

## Current Status (2026-01-10 ~22:40 MT)
- **Frontend**: All core pages with Phase 3 auth and save/load complete
- **Backend**: Express server with Prisma + PostgreSQL, JWT auth, layouts API (10-layout limit)
- **Database**: 845+ shortcuts across VS Code, macOS, IntelliJ IDEA, Docker, Vim, Sublime Text, RStudio, Kiro, JupyterLab
- **Extraction Pipeline**: `shortcut_extractor/` — AI-only engine with PDF, PNG, and TXT support, OSA platform, library management
- **Output**: Platform-specific versioned CSV exports in `output/csv_exports/` with `latest/` folder
- **Platforms**: macOS, Windows, OSA (Operating System Agnostic — replaces CLI)
- **Source Files**: `source_keyboard_shortcuts/` — PDFs, PNGs, and TXT files with standardized naming
- **Cleanup**: `cleanup_outputs.py` for fresh testing runs

## Next Development Priorities
- [ ] Fix `vs_code_confidence:_100_shortcuts_latest.csv` — add parser validation for malformed AI output
- [ ] Fix RStudio Cross-platform — only generating Windows file, missing macOS shortcuts
- [ ] Ensure Vim OSA generates only one output file (no vim_windows split)
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] Deploy extraction pipeline to AWS Lambda
- [ ] Add more application shortcuts (Photoshop, Figma, Chrome, Notion)

## 2026-01-10 Vim OSA Fix, Cross-Platform Pipeline & Smart Fallback Session (~22:45 MT - ~23:55 MT)

### [~22:45 MT] Cleanup Script Fix
- ✅ Fixed truncated `cleanup_outputs.py` — file was cut off mid-function (`verify_cleanup()` incomplete)
- ✅ Added proper function completion, `__main__` block, and verification step
- ✅ Cleanup now properly removes all CSV files, JSON metadata, and recreates directory structure

### [~22:50 MT] Vim OSA Platform Correction — Post-Processing Fix
- ✅ Strengthened AI parser prompt with absolute platform rules for OSA enforcement
- ✅ Added post-processing step in `simple_extraction_engine.py` — forces all shortcuts to OSA when source file is OSA
- ✅ Key insight: AI prompt changes alone weren't enough — Claude's training data strongly associates `Ctrl+` with Windows
- ✅ Solution: `if classification.platform == 'OSA': shortcut.platform = 'OSA'` after AI extraction
- ✅ Result: `vim_osa_shortcuts_latest.csv` (96 shortcuts) — no more `vim_windows_shortcuts_latest.csv`

### [~23:00 MT] Key Standardizer OSA Support
- ✅ Added OSA platform handling to `key_standardizer.py` — OSA shortcuts keep original format (no Mac/Windows conversion)
- ✅ New display format: `osa_original` — preserves raw key combinations as-is
- ✅ Previously OSA fell into `else` clause and was treated as cross-platform (creating both Mac/Windows formats)
- ✅ Updated statistics reporting to include OSA count

### [~23:05 MT] VS Code Confidence File Fix
- ✅ Added malformed entry validation to `_parse_simple_response()` in `simple_ai_parser.py`
- ✅ Rejects entries where platform/title/shortcut contains invalid values like "CONFIDENCE:", "TITLE:", "PLATFORM:"
- ✅ Validates platform against allowed values: Windows, macOS, OSA, Cross-platform
- ✅ Falls back to source file platform for invalid platform values
- ✅ Result: No more `vs_code_confidence:_100_shortcuts_latest.csv` file

### [~23:10 MT] Key Standardization Order Fix — Critical Pipeline Change
- ✅ Moved key standardization to happen AFTER platform splitting (was before)
- ✅ Root cause of RStudio issue: standardizer was converting Mac shortcuts to Windows format before splitting
- ✅ New pipeline order: AI Extract → OSA Correction → Platform Split → Key Standardize
- ✅ This ensures each platform file gets standardized according to its final platform designation

### [~23:15 MT] Document Structure Analyzer — New Component
- ✅ Created `document_structure_analyzer.py` — analyzes document layout before AI parsing
- ✅ Detects format type: table, sections, list, mixed
- ✅ Detects platform organization: columns, sections, mixed, single
- ✅ Extracts column headers and section headers
- ✅ Generates layout hints for AI parser (e.g., "TABLE FORMAT with columns", "Platforms organized in COLUMNS")
- ✅ Integrated into `simple_ai_parser.py` — structure context passed to Claude prompt
- ✅ RStudio correctly identified as: table format, columns platform organization, 95% confidence

### [~23:20 MT] Cross-Platform AI Prompt Enhancement
- ✅ Updated cross-platform instructions to handle TABLE FORMAT (columns) and SECTION FORMAT (headers)
- ✅ Added explicit instruction: "If you see both Ctrl+L and Cmd+L for the same action, create TWO separate entries"
- ✅ Updated platform rules for cross-platform: analyze each shortcut individually based on key combinations
- ✅ Kiro and Docker cross-platform now working correctly with mixed platforms

### [~23:25 MT] Table Parser — Direct Python Parsing for Table Documents
- ✅ Created `table_parser.py` — parses table-format documents directly without AI
- ✅ Identifies column headers (Description, Windows & Linux, Mac)
- ✅ Parses data rows and creates platform-specific shortcuts based on column position
- ✅ Platform determined by COLUMN HEADER, not key pattern (Ctrl can be macOS too)
- ✅ Test: 4 table rows → 8 shortcuts (4 Windows + 4 macOS) — correct cross-platform splitting

### [~23:30 MT] Cross-Platform Processor — AI Fallback Enhancement
- ✅ Created `cross_platform_processor.py` — post-processes when AI fails to extract mixed platforms
- ✅ Detects single-platform output from cross-platform source files
- ✅ Expands Windows shortcuts to include macOS equivalents (Ctrl→⌘, Alt→⌥, Shift→⇧)
- ✅ Analyzes source text for table structure to find platform pairs

### [~23:35 MT] Python-First Extractor — Hybrid Extraction System
- ✅ Created `python_first_extractor.py` — Python parsing as primary method with AI validation backup
- ✅ Table extraction: identifies columns, parses rows, creates platform-specific shortcuts
- ✅ List extraction: finds shortcut patterns in lines, extracts descriptions
- ✅ Platform determined by document context (column headers), NOT key patterns
- ✅ Key insight from user: "Ctrl doesn't automatically mean Windows — macOS uses Ctrl for shortcuts too"

### [~23:40 MT] Smart Fallback System — Intelligent Error Detection
- ✅ Created `smart_fallback_system.py` — detects extraction problems and applies appropriate fallbacks
- ✅ Problem detection: cross-platform single output, low shortcut count, platform mismatch
- ✅ Fallback strategies: Python-first extraction → cross-platform processor → platform correction
- ✅ Runs AFTER normal pipeline — only applies when problems detected
- ✅ Integrated into extraction engine as final quality check step

### [~23:50 MT] Platform Detection Correction — Ctrl ≠ Windows
- ✅ Fixed `_determine_platform_from_shortcut()` in `python_first_extractor.py`
- ✅ Ctrl and Alt are AMBIGUOUS — used on both macOS and Windows
- ✅ Only strong Mac indicators: ⌘, ⌥, ⇧, ⌃, Cmd, Command, Option
- ✅ Only strong Windows indicators: Win, Windows
- ✅ Ctrl/Alt/Shift return 'Unknown' — let document context (column headers) determine platform
- ✅ Table parser uses column position for platform, not key analysis

### Current Output Structure (2026-01-10 ~23:55 MT)
```
output/csv_exports/latest/
├── docker_macos_shortcuts_latest.csv           (40 shortcuts)
├── docker_windows_shortcuts_latest.csv         (40 shortcuts)
├── intellij_idea_macos_shortcuts_latest.csv    (95 shortcuts)
├── intellij_idea_windows_shortcuts_latest.csv  (103 shortcuts)
├── jupyterlab_macos_shortcuts_latest.csv       (49 shortcuts)
├── jupyterlab_windows_shortcuts_latest.csv     (49 shortcuts)
├── kiro_macos_shortcuts_latest.csv             (25 shortcuts)
├── kiro_windows_shortcuts_latest.csv           (29 shortcuts)
├── macos_macos_shortcuts_latest.csv            (60 shortcuts)
├── rstudio_windows_shortcuts_latest.csv        (97 shortcuts) ← Still missing macOS
├── sublime_text_macos_shortcuts_latest.csv     (46 shortcuts)
├── vim_osa_shortcuts_latest.csv                (96 shortcuts) ← FIXED
├── vs_code_macos_shortcuts_latest.csv          (85 shortcuts)
└── vs_code_windows_shortcuts_latest.csv        (95 shortcuts)
```

### New Files Created This Session
```
shortcut_extractor/
├── document_structure_analyzer.py   # Document layout analysis
├── table_parser.py                  # Direct Python table parsing
├── cross_platform_processor.py      # Cross-platform expansion fallback
├── python_first_extractor.py        # Python-first extraction with AI backup
└── smart_fallback_system.py         # Intelligent error detection and fallback
```

## Current Status (2026-01-10 ~23:55 MT)
- **Extraction Pipeline**: Enhanced with document structure analysis, table parsing, smart fallback system
- **Vim OSA**: ✅ Fixed — single `vim_osa_shortcuts_latest.csv` (96 shortcuts)
- **VS Code Confidence**: ✅ Fixed — malformed AI output now rejected
- **Key Standardization**: ✅ Fixed — runs after platform splitting, OSA shortcuts preserved
- **Cross-Platform**: ✅ Kiro, Docker working — RStudio still needs table parser integration
- **Pipeline Architecture**: AI extraction → OSA correction → platform split → smart fallback → key standardization

## Next Development Priorities
- [ ] Debug and fix table parser for RStudio cross-platform (header detection issue)
- [ ] Run full extraction with smart fallback to verify RStudio generates both macOS and Windows files
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] Deploy extraction pipeline to AWS Lambda
- [ ] Add more application shortcuts (Photoshop, Figma, Chrome, Notion)

## 2026-01-11 Quality Review System, AI Validation & Standardizer Removal Session

### [~00:00 MT] Context Transfer & Smart Fallback Integration Fix
- ✅ Continued from previous session — read key files: `python_first_extractor.py`, `smart_fallback_system.py`, `simple_extraction_engine.py`
- ✅ Fixed smart fallback system not running when 0 shortcuts extracted (was gated behind `if shortcuts:`)
- ✅ Added `no_shortcuts_extracted` problem detection for cross-platform documents
- ✅ RStudio cross-platform now triggers Python-first fallback when table parser returns 0 shortcuts

### [~00:15 MT] Document Structure Analyzer — Vertical Header Detection Fix
- ✅ Fixed column header extraction for RStudio's vertical table layout (headers on separate lines: Description, Windows & Linux, Mac)
- ✅ Root cause: headers were on lines 14-16 individually, not on a single horizontal line
- ✅ Added vertical header pattern detection: checks consecutive lines for Description + Windows + Mac sequence
- ✅ Reordered detection methods: vertical header check runs FIRST (before horizontal header check)
- ✅ Result: Document structure analyzer now correctly finds `['Description', 'Windows & Linux', 'Mac']` column headers

### [~00:30 MT] RStudio Cross-Platform — Now Produces Multiple Output Files
- ✅ Smart fallback system detects table parser failure (0 shortcuts) and applies Python-first extraction
- ✅ RStudio now generates: `rstudio_macos_shortcuts_latest.csv` (145), `rstudio_windows_shortcuts_latest.csv` (354), `rstudio_unknown_shortcuts_latest.csv` (211)
- ⚠️ "Unknown" platform file contains Windows shortcuts where Ctrl/Alt couldn't be disambiguated by list parser
- ⚠️ Python-first extractor using list parsing instead of table parsing for vertical table structure

### [~00:45 MT] Platform Detection Context for Python-First Extractor
- ✅ Updated `_determine_platform_from_shortcut()` to accept `document_context` parameter
- ✅ For cross-platform documents, Ctrl/Alt/Shift shortcuts now classified as Windows (not Unknown)
- ✅ Updated `_find_shortcuts_in_line()` and `_extract_from_list()` to pass document context
- ✅ Reduced "Unknown" platform shortcuts for cross-platform documents

### [~01:00 MT] Quality Review System — New Component
- ✅ Created `quality_reviewer.py` — final validation and error checking for extracted shortcuts
- ✅ Groups output files by application, compares platform counts for cross-platform apps
- ✅ Detects malformed shortcuts using pattern matching (timestamps, incomplete keys, symbols-only)
- ✅ Generates `quality_report.json` with per-application status, confidence scores, and issue summaries
- ✅ Generates `malformed_shortcuts.csv` isolating problematic entries for review
- ✅ Creates `output/csv_exports/review/` folder for all quality analysis files
- ✅ Integrated into extraction engine — runs as final step after all exports

### [~01:15 MT] AI-Powered Malformed Shortcut Validation
- ✅ Created `ai_shortcut_validator.py` — uses Claude Haiku to validate potentially malformed shortcuts
- ✅ Only validates shortcuts flagged as suspicious by pattern matching (not all shortcuts)
- ✅ Batches shortcuts by application for efficient API calls (10 per batch)
- ✅ Separates confirmed malformed from false positives (e.g., Vim single-letter `j` is valid, not malformed)
- ✅ Generates `false_positives.csv` for shortcuts incorrectly flagged by pattern matching
- ✅ Integrated into quality reviewer — AI validation runs during malformed shortcut analysis
- ✅ Improved AI prompt: strict about titles like "+/" being extraction noise, modifier keys alone being incomplete

### [~01:30 MT] Key Standardizer — Disabled for Accuracy
- ✅ Disabled key standardization completely in extraction pipeline
- ✅ Root cause: standardizer was corrupting Mac shortcuts by converting symbols (⌥ → Alt, etc.)
- ✅ Shortcuts now preserved exactly as extracted from source documents
- ✅ Simplified CSV headers: removed `key_combination_standardized` and `key_combination_original` columns
- ✅ Single `key_combination` column now contains original format from source
- ✅ TODO: Re-enable later for sticker space optimization (convert text commands to symbols)

### [~01:45 MT] Fresh Extraction Run — No Standardization
- ✅ Cleaned all outputs and ran fresh extraction with standardizer disabled
- ✅ 12 files processed, 1741 total shortcuts extracted
- ✅ Quality review results: 7 successful apps, 2 problematic (Kiro, RStudio — count imbalance)
- ✅ AI validation found 8 false positives out of 208 flagged shortcuts
- ✅ 200 confirmed malformed shortcuts isolated in review folder

### [~02:00 MT] Spec Creation — Cross-Platform Extraction QA
- ✅ Created `.kiro/specs/cross-platform-extraction-qa.md` — structured development spec
- ✅ Defines requirements for cross-platform detection, quality validation, extraction accuracy, output organization
- ✅ Includes phased implementation tasks and success criteria
- ✅ Documents key decisions and file references from this session

### Current Output Structure (2026-01-11 ~02:00 MT)
```
output/csv_exports/latest/
├── docker_macos_shortcuts_latest.csv           (33 shortcuts)
├── docker_windows_shortcuts_latest.csv         (32 shortcuts)
├── intellij_idea_macos_shortcuts_latest.csv    (99 shortcuts)
├── intellij_idea_windows_shortcuts_latest.csv  (103 shortcuts)
├── jupyterlab_macos_shortcuts_latest.csv       (49 shortcuts)
├── jupyterlab_windows_shortcuts_latest.csv     (49 shortcuts)
├── kiro_macos_shortcuts_latest.csv             (102 shortcuts)
├── kiro_unknown_shortcuts_latest.csv           (34 shortcuts)
├── kiro_windows_shortcuts_latest.csv           (146 shortcuts)
├── macos_macos_shortcuts_latest.csv            (61 shortcuts)
├── rstudio_macos_shortcuts_latest.csv          (145 shortcuts) ← NEW
├── rstudio_unknown_shortcuts_latest.csv        (211 shortcuts)
├── rstudio_windows_shortcuts_latest.csv        (354 shortcuts)
├── sublime_text_macos_shortcuts_latest.csv     (46 shortcuts)
├── vim_osa_shortcuts_latest.csv                (96 shortcuts)
├── vs_code_macos_shortcuts_latest.csv          (85 shortcuts)
└── vs_code_windows_shortcuts_latest.csv        (96 shortcuts)

output/csv_exports/review/
├── quality_report.json                         ← NEW
├── malformed_shortcuts.csv                     ← NEW (200 entries)
└── false_positives.csv                         ← NEW (8 entries)
```

### New Files Created This Session
```
shortcut_extractor/
├── quality_reviewer.py          # Quality validation and error checking
├── ai_shortcut_validator.py     # AI-powered malformed shortcut validation
.kiro/specs/
└── cross-platform-extraction-qa.md  # Development spec for QA system
```

## Current Status (2026-01-11 ~02:00 MT)
- **Extraction Pipeline**: Enhanced with quality review system, AI validation, standardizer disabled
- **RStudio Cross-Platform**: ✅ Now generates macOS file (was missing) — still has "unknown" platform file
- **Quality Review**: ✅ Runs at end of pipeline, generates reports in `review/` folder
- **AI Validation**: ✅ Validates malformed shortcuts, separates false positives
- **Key Standardization**: ⚠️ Disabled — was corrupting Mac shortcuts. Will re-enable for sticker optimization later
- **Pipeline Architecture**: AI extraction → OSA correction → platform split → smart fallback → quality review → AI validation

## Next Development Priorities
- [ ] Fix RStudio "unknown" platform — Python-first extractor needs vertical table parsing
- [ ] Improve Python-first extractor to handle RStudio's vertical table structure
- [ ] Re-enable key standardizer with Mac-safe conversion (symbols only, no text conversion)
- [ ] Integrate standardized CSV exports into main Prisma database
- [ ] Deploy extraction pipeline to AWS Lambda
- [ ] Add more application shortcuts (Photoshop, Figma, Chrome, Notion)

## 2026-01-11 Database Integration, Frontend Fixes & Sticker Design Spec Session

### [~12:00 MT] Output Cleanup & Root Directory Cleanup
- ✅ Ran `cleanup_outputs.py` to clear all extraction outputs for fresh run
- ✅ Removed unnecessary debug/test Python scripts from project root:
  - `debug_early_lines.py`, `debug_header_extraction.py`, `debug_header_step_by_step.py`
  - `debug_python_structure.py`, `debug_rstudio_extraction.py`, `debug_rstudio_table.py`
  - `test_rstudio_classification.py`, `test_rstudio_content.py`, `test_rstudio_fallback.py`, `test_rstudio_integration.py`
  - `simple_text_extractor.py`

### [~12:10 MT] Database Integration — SQLite for Local Development
- ✅ Created `database_loader.js` in `shortcut-sticker/backend/` — loads extracted CSV shortcuts into database via Prisma
- ✅ Switched database from PostgreSQL to SQLite for local development (no server needed)
- ✅ Updated Prisma schema: `provider = "sqlite"`, `DATABASE_URL = "file:./dev.db"`
- ✅ Reset Prisma migrations for SQLite provider
- ✅ Added `csv-parser` dependency to backend `package.json`
- ✅ Added npm scripts: `load-shortcuts`, `clear-shortcuts`, `reload-shortcuts`, `verify-shortcuts`
- ✅ Created `DATABASE_LOADING.md` documentation in backend folder
- ✅ App configurations with categories and icon colors for all 9 applications

### [~12:15 MT] Database Loader Features
- ✅ Reads CSV files from `output/csv_exports/latest/`
- ✅ Creates/updates applications with proper categories and colors
- ✅ Platform mapping: `windows→windows`, `macos→mac`, `osa→both`, `unknown→both`
- ✅ Prevents duplicate entries via findFirst checks
- ✅ CLI interface: `load`, `clear`, `reload`, `verify` commands
- ✅ Detailed loading statistics and per-app breakdown

### [~12:20 MT] Full Extraction Pipeline Run
- ✅ Created AWS SSO login alias: `awslogin` → `aws sso login --profile "developer playground"`
- ✅ Added shell aliases to `~/.zshrc`: `awslogin`, `awsstatus`, `awslogout`
- ✅ Created Kiro steering rule for Python environment: `.kiro/steering/python-environment.md`
- ✅ Ran full extraction pipeline using `enhanced_pipeline_env_312` Python environment
- ✅ Results: 12 files processed, 1765 total shortcuts, 100% success rate, ~195s total time
- ✅ Quality review: 8 successful apps, 2 problematic (Kiro, RStudio — count imbalance)

### [~12:25 MT] Database Loading with Real Extracted Data
- ✅ Loaded all extracted shortcuts into SQLite database via `npm run reload-shortcuts`
- ✅ Results: 709 shortcuts created, 114 duplicates skipped, 0 errors
- ✅ Database breakdown: VS Code (176), IntelliJ IDEA (174), Vim (96), JupyterLab (62), macOS (57), Photoshop (50), Sublime Text (46), Docker (48)
- ✅ Verified API working: `GET /api/shortcuts` returns formatted data, `GET /api/health` returns OK

### [~12:30 MT] Frontend Multi-App Layout Fix
- ✅ Fixed `CreateLayout.jsx` — multi-app mode now properly fetches and displays shortcuts
- ✅ Root cause: `fetchShortcuts()` was gated behind `if (!selectedApp)` which only worked for single-app mode
- ✅ Fix: Changed gate to check `layoutType === 'single' ? selectedApp : selectedApps.length > 0`
- ✅ Updated `useEffect` dependencies to include `selectedApps` and `layoutType`
- ✅ Fixed `checkPlatforms()` to accept array of app names for multi-app platform detection
- ✅ Updated app selection handler to pass all selected apps to `checkPlatforms()`
- ✅ Added search expansion: when searching, shows results from ALL apps (not just selected)
- ✅ Added status indicator showing which apps are currently displayed

### [~12:45 MT] Frontend & Backend Servers Running
- ✅ Backend running on http://localhost:3001 with real shortcut data
- ✅ Frontend running on http://localhost:5173 via Vite
- ✅ BrowseShortcuts page displaying all 8 applications with real extracted data
- ✅ CreateLayout page multi-app selection working with shortcuts in left panel

### [~13:00 MT] Sticker Layout Visual Design — Spec Decision
- ✅ User decided to create a formal spec for sticker layout visual design improvements
- ✅ Vision: Canva-like graphic design tool for keyboard shortcut stickers
- ✅ Key constraints identified:
  - 2 sticker sizes: 3.75×3.75" and 3×3"
  - 3 text sizes controlling shortcut count per layout
  - Sections and shortcuts controlled by text size and sticker size
  - Early version: predetermined characteristics, later: user customization
- ✅ Reference designs: SVG files in `Sticker Layouts/` folder (Vim, VS Code examples)
- ✅ Target file: `shortcut-sticker/frontend/src/pages/CreateLayout.jsx`

## Current Status (2026-01-11 ~13:00 MT)
- **Frontend**: All core pages working, multi-app layout fix applied, real data displayed
- **Backend**: Express server with Prisma + SQLite (local dev), JWT auth, layouts API
- **Database**: 709 shortcuts across 8 applications loaded from extraction pipeline
- **Extraction Pipeline**: Mature — 1765 shortcuts from 12 files, quality review system active
- **Database Integration**: `database_loader.js` bridges extraction pipeline → web app database
- **Local Dev**: SQLite database (no PostgreSQL server needed), both servers running
- **AWS**: SSO login alias configured, extraction pipeline uses Bedrock Claude
- **Steering Rules**: Python environment path documented in `.kiro/steering/python-environment.md`

## Next Development Priorities
- [ ] Create spec for sticker layout visual design (Canva-like design tool)
- [ ] Implement sticker size constraints (3.75×3.75" and 3×3")
- [ ] Add 3 text size options controlling shortcut count per layout
- [ ] Match sticker design to SVG examples in `Sticker Layouts/`
- [ ] Fix RStudio/Kiro cross-platform count imbalance (find separate OS source files)
- [ ] Re-enable key standardizer with Mac-safe mode for sticker space optimization
- [ ] Deploy to production (PostgreSQL + hosting)

## 2026-04-10 Sticker Layout Visual Design — Phase 1 Implementation Session

### [~09:00 MT] Sticker Layout Visual Design Spec Created
- ✅ Created initial spec at `.kiro/specs/sticker-layout-visual-design.md`
- ✅ Defined 5 color palettes (Classic, VS Code, Kiro, Dark, Monochrome)
- ✅ Defined 2 sticker sizes: 3.75" (16" laptops) and 3" (15" or smaller)
- ✅ Defined 3 text sizes (small/medium/large) with capacity calculations
- ✅ Defined standardized key symbols for macOS (⌘⌥⌃⇧⌫⏎) and Windows (⊞, Ctrl, Alt, ⇧, Del, ↵)
- ✅ Defined typography system (Inter/SF Pro for text, SF Mono/Consolas for keys)
- ✅ Defined spacing rules for both sticker sizes
- ✅ Defined section limits per text size (small: 6, medium: 4, large: 4)

### [~09:30 MT] User Spec Review & Refinements
- ✅ Clarified terminology: output is a "print-ready image" not a "sticker" (sticker = paper)
- ✅ Added controlled color palette system (simple 3-color palettes, expandable later)
- ✅ Added standardized key symbols requirement under typography
- ✅ Clarified sticker sizes: 3.75" for 16" laptop palm rest, 3" for 15" or smaller
- ✅ Added Preview Mode concept (separate from editing mode for true-to-print rendering)
- ✅ Added template library and color palette library to Phase 4
- ✅ Resolved open questions: no custom sizes, RGB only (CMYK handled by printer), system fonts only, no app logos
- ✅ Added professional printing option (die-cut stickers mailed to user) alongside home printing

### [~10:00 MT] User Created Kiro-Style Deterministic Spec
- ✅ User rewrote spec as `.kiro/specs/sticker-layout-visual-design-kiro.md`
- ✅ Spec defines deterministic rules, constraints, and behaviors (not user stories)
- ✅ Includes: fixed output dimensions, safe areas (bleed + inner safe zone), typography rules, layout rules, capacity rules, color palettes, spacing parameters, behavioral requirements, export rules, layout invariants, non-goals, validation checklist
- ✅ Key behavioral requirements: BR-1 (text size recalculates everything), BR-2 (preview = export parity), BR-3 (deterministic output), BR-4 (platform updates symbols)

### [~10:30 MT] Design System Constants File Created
- ✅ Created `shortcut-sticker/frontend/src/constants/designSystem.js`
- ✅ Exported: `COLOR_PALETTES`, `TYPOGRAPHY`, `KEY_SYMBOLS`, `IMAGE_SIZES`, `TEXT_SIZES`, `SECTION_LIMITS`
- ✅ Exported spacing configs: `SPACING_375`, `SPACING_3`, `getSpacing()`
- ✅ Helper functions: `formatShortcutKey()` (platform-aware symbol replacement), `getMaxShortcuts()`, `getMaxSections()`
- ✅ Key symbol mapping: case-insensitive replacement of text keys (cmd→⌘, ctrl→Ctrl, shift→⇧, etc.)

### [~11:00 MT] CreateLayout.jsx Phase 1 Updates
- ✅ Imported design system constants into CreateLayout component
- ✅ Replaced `layoutSize` state with `imageSize` state (3.75 or 3)
- ✅ Added `colorPalette` state with 5 palette options
- ✅ Added image size selection to initial setup (with laptop size guidance)
- ✅ Added text size selection to initial setup (with dynamic capacity display)
- ✅ Added color palette selection with visual color swatches
- ✅ Updated canvas to use dynamic sizing from `IMAGE_SIZES[imageSize]`
- ✅ Updated canvas borders and sections to use selected color palette
- ✅ Updated section headers to use `TYPOGRAPHY.sizes[textSize]` font sizes
- ✅ Updated shortcut rendering with proper font families (monospace for keys, primary for descriptions)
- ✅ Updated shortcut key display with `formatShortcutKey()` for standardized symbols
- ✅ Updated section limits to use `getMaxSections(textSize)`
- ✅ Updated total shortcut limits to use `getMaxShortcuts(imageSize, textSize)`
- ✅ Updated spacing throughout canvas to use `getSpacing(imageSize)`

### [~11:30 MT] Bug Fix — `sizes` Variable Reference Error
- ⚠️ Runtime error: `Can't find variable: sizes` at line 627
- Root cause: Old `sizes` array and `layoutSize` references not fully replaced in initial setup screen
- Status: Identified — needs fix in the "Choose Layout Size" section that still references old `sizes.map()`

## Current Status (2026-04-10 ~12:00 MT)
- **Frontend**: Phase 1 visual design partially implemented — design system created, canvas updated, bug in initial setup screen
- **Backend**: Express server with Prisma + SQLite (local dev), JWT auth, layouts API
- **Database**: 709 shortcuts across 8 applications loaded from extraction pipeline
- **Spec**: Deterministic visual design spec at `.kiro/specs/sticker-layout-visual-design-kiro.md`
- **Design System**: `shortcut-sticker/frontend/src/constants/designSystem.js` with palettes, typography, symbols, sizes

## Next Development Priorities
- [ ] Fix `sizes` variable reference error in CreateLayout.jsx initial setup screen
- [ ] Test all 5 color palettes on canvas
- [ ] Test both sticker sizes (3.75" and 3") canvas rendering
- [ ] Test text size changes and capacity recalculation
- [ ] Verify standardized key symbols display correctly
- [ ] Implement Preview Mode (Phase 2)
- [ ] Implement SVG/PNG export at 300 DPI (Phase 3)
- [ ] Add template library and color palette library (Phase 4)

## 2026-04-10 Phase 1 Completion & Phase 2 Export/Save Session (Afternoon)

### [~13:00 MT] Phase 1 Bug Fixes — `sizes` Variable & Layout References
- ✅ Fixed `sizes.map()` error on line 453 — replaced with `Object.values(IMAGE_SIZES).map()`
- ✅ Replaced all `layoutSize` references with `imageSize` throughout component
- ✅ Updated `addSection()` to use `getMaxSections(textSize)` from design system
- ✅ Updated `MAX_TOTAL_SHORTCUTS` to dynamically use `getMaxShortcuts(imageSize, textSize)`
- ✅ Updated `startLayout()` to check `imageSize` instead of `layoutSize`
- ✅ Updated "Create Layout" button disabled logic to use `imageSize`

### [~13:15 MT] Initial Setup Screen — Image Size, Text Size, Color Palette Selection
- ✅ Added image size selection (3.75" and 3") with laptop size descriptions
- ✅ Added text size selection (small/medium/large) with dynamic capacity counts per image size
- ✅ Added color palette selection with visual color swatches (5 palettes in 2-column grid)
- ✅ Progressive disclosure — options appear after previous selections made

### [~13:30 MT] Canvas Controls Update
- ✅ Updated layout controls to show current image size, text size, and palette
- ✅ Made text size and palette changeable via dropdowns during design
- ✅ "Add Section" button properly disabled based on `getMaxSections(textSize)`
- ✅ "Start Over" resets all design system state (imageSize, textSize, colorPalette)

### [~14:00 MT] Character Spacing & Key Formatting
- ✅ Updated `formatShortcutKey()` in designSystem.js to add " + " between keys
- ✅ Normalizes separators: `Ctrl-K` → `Ctrl + K`, `⌘K` → `⌘ + K`
- ✅ Handles existing `+` signs and normalizes spacing
- ✅ Removed `maxWidth: '60px'` and `textOverflow: 'ellipsis'` from key column to prevent truncation

### [~14:15 MT] Left Sidebar App Icon Enhancement
- ✅ Added app name tooltip on hover (`title={shortcut.app}`)
- ✅ Added `cursor: 'help'` to indicate hoverable icon
- ✅ Removed small print text under icon (too cluttered)

### [~14:30 MT] Shortcut Filtering Fix
- ✅ Fixed `fetchShortcuts()` — now always filters by selected app(s)
- ✅ Removed "All Apps" tab showing unfiltered shortcuts from entire database
- ✅ Left sidebar now only shows shortcuts from the app(s) selected during setup

### [~15:00 MT] PNG Export at 300 DPI — Phase 2 Priority 1
- ✅ Created `shortcut-sticker/frontend/src/utils/exportCanvas.js` with `exportToPNG()` and `exportToSVG()`
- ✅ Installed `html2canvas` dependency for DOM-to-canvas capture
- ✅ Export scales from display size to print size (600px → 1125px for 3.75", 480px → 900px for 3")
- ✅ Added "📥 Export PNG" button to canvas controls (green, disabled when no shortcuts)
- ✅ Auto-generates filename: `sticker-{app}-{size}-{textSize}-{palette}.png`
- ✅ Shows "Exporting..." state during capture

### [~15:30 MT] Export Quality Fixes
- ✅ Added `layoutTitle` state and title input field above canvas controls
- ✅ Title displays centered at top of canvas, scales with text size
- ✅ Fixed section header cutoff — changed from `<input>` to `<div>`, increased line-height to 1.5
- ✅ Hide delete buttons during export (`!isExporting` condition + `.no-export` class)
- ✅ Hide empty placeholder slots during export (filter chain removes null shortcuts)
- ✅ Fixed text alignment — added `textAlign: 'left'` to key and description columns
- ✅ Added 100ms delay before capture to allow React re-render after `setIsExporting(true)`

### [~16:00 MT] Print CSS for Home Printing
- ✅ Created `shortcut-sticker/frontend/src/styles/print.css`
- ✅ `@media print` rules: hide everything except canvas, force color printing, remove shadows
- ✅ `@page` size set to 4in × 4in with 0.125in bleed margin
- ✅ Added `data-print-canvas` attribute and `print-size-*` classes to canvas
- ✅ Print at actual sticker size (3.75" or 3") — not full page

### [~16:15 MT] Logo Integration
- ✅ Copied logo from `Sticker Layouts/hands on keyboard logo .png` to `frontend/public/logo.png`
- ✅ Added logo at bottom right of canvas with absolute positioning
- ✅ Logo scales with text size (40px/50px/60px), opacity 0.7
- ✅ Appears in canvas preview, PNG exports, and print output

### [~16:30 MT] Zoom Controls
- ✅ Added `canvasZoom` state with preset levels (50%, 75%, 100%, 150%, 200%)
- ✅ Zoom buttons in canvas controls — active level highlighted in blue
- ✅ Ctrl/Cmd + scroll wheel for smooth zooming
- ✅ Trackpad pinch-to-zoom with touch event handlers (`handleTouchStart/Move/End`)
- ✅ Zoom only affects sticker canvas — sidebar and controls stay normal size
- ✅ CSS `transform: scale()` with smooth 0.2s transition

### [~17:00 MT] SVG Export Button
- ✅ Added `handleExportSVG()` function — prepares layout data and calls `exportToSVG()`
- ✅ Added purple "📄 Export SVG" button next to PNG button
- ✅ Disabled when no shortcuts on canvas

### [~17:15 MT] Save/Load Layouts
- ✅ Created `shortcut-sticker/frontend/src/utils/layoutStorage.js`
  - `saveLayoutToFile()` — downloads layout as JSON
  - `loadLayoutFromFile()` — reads JSON file and validates
  - `saveToLocalStorage()` / `loadFromLocalStorage()` — auto-save/recovery
  - `serializeLayout()` — captures all layout state
  - `validateLayout()` — checks required fields
- ✅ Added `handleSaveLayout()` — saves to JSON file + localStorage
- ✅ Added `handleLoadLayout()` — file input, validates, restores all state
- ✅ Added "💾 Save Layout" button (blue) and "📂 Load Layout" label (amber) to controls
- ✅ Auto-generates filename: `layout-{app}-{date}.json`

### [~17:30 MT] Syntax Error Fix — Missing Closing Div
- ✅ Fixed missing `</div>` for zoom wrapper div — caused Vite SWC parse error
- ✅ Root cause: adding zoom wrapper div introduced extra nesting level without matching close

## Current Status (2026-04-10 ~18:00 MT)
- **Frontend**: Phase 1 complete, Phase 2 ~90% complete
  - ✅ Design system with 5 palettes, 3 text sizes, 2 image sizes
  - ✅ PNG export at 300 DPI (1125×1125 or 900×900)
  - ✅ SVG export button added
  - ✅ Save/load layouts (JSON file + localStorage)
  - ✅ Zoom controls (buttons + scroll + trackpad pinch)
  - ✅ Print CSS for home printing at actual size
  - ✅ Logo integration
- **Backend**: Express server with Prisma + SQLite, JWT auth, layouts API
- **Database**: 709 shortcuts across 8 applications
- **Remaining**: Template library, polish, print testing

## Next Development Priorities
- [ ] Test SVG export in Illustrator/Inkscape
- [ ] Create 3-5 pre-made templates (VS Code, Vim, macOS, Chrome)
- [ ] Add auto-save to localStorage on interval
- [ ] Print test on home printer (inkjet and laser)
- [ ] Excalidraw-style UI redesign (deferred — use tool first, then decide)
- [ ] Test all color palettes in export
- [ ] Test both image sizes in export

## 2026-04-10 Phase 2 Testing, Search Fixes & Print Legibility Session (Evening)

### [~19:00 MT] Search Functionality Overhaul
- ✅ Fixed search to show results across ALL apps when typing (not just selected app)
- ✅ Backend search simplified — replaced complex Prisma query with JavaScript filtering (was causing 500 errors)
- ✅ Backend now searches across app name, description, and keys (case-insensitive)
- ✅ Added search by application name (type "vim" to see all Vim shortcuts)
- ✅ Fixed platform filter blocking search results — Vim has platform "both" which didn't match ["mac", "windows"]
- ✅ Platform filter now only applies when NOT searching (search shows all results regardless of platform)
- ✅ Updated search placeholder: "Search apps, shortcuts, or commands..."
- ✅ Added contextual help text: "Showing shortcuts from selected app(s)" vs "Searching apps, shortcuts, and commands"
- ✅ Added debug logging to fetchShortcuts for troubleshooting (emoji-prefixed console logs)

### [~19:30 MT] Search Panel UI Improvements
- ✅ Increased key column width from 80px to 120px (long shortcuts like "Cmd+K Cmd+S" now fit)
- ✅ Added word-break wrapping for long key combinations
- ✅ Left-aligned keys (was center-aligned)
- ✅ Reduced key font size from 12px to 11px for better fit
- ✅ Changed app icon hover cursor from question mark (`cursor: help`) to normal arrow (`cursor: default`)
- ✅ Made header row (App | Key | Description | ♥) sticky at top of scroll area

### [~20:00 MT] Save/Load Strategy Clarification
- ✅ Clarified save/load behavior: Save does BOTH file download AND localStorage save
- ✅ Created `SAVE_LOAD_STRATEGY.md` documenting hybrid approach:
  - Free/anonymous users: File-based save/load (no account needed)
  - Registered users (future): Cloud storage in-app
- ✅ SVG export purpose clarified: vector format for future professional printing service

### [~20:30 MT] Key Spacing Improvements
- ✅ Updated `formatShortcutKey()` to handle symbols adjacent to letters (⌘K → ⌘ + K)
- ✅ Added regex for symbol-to-letter and letter-to-symbol spacing
- ✅ All shortcuts now have consistent " + " spacing between keys

### [~21:00 MT] PNG Export Dimension Fix
- ✅ Fixed export capturing wrong dimensions due to zoom (666×666 instead of 600×600)
- ✅ Changed export to use design system's fixed displayWidth/displayHeight instead of measuring DOM
- ✅ Export now always uses correct base dimensions regardless of zoom level
- ✅ Added debug logging: export dimensions, display dimensions, scale factor, canvas size
- ✅ Confirmed correct output: 600×600 display → 1125×1125 export at 1.88x scale

### [~21:30 MT] Print Legibility — Font Size Overhaul
- ✅ Increased all font sizes ~60-80% for print legibility:
  - Small: headers 18px (was 11), keys 15px (was 9), descriptions 13px (was 8)
  - Medium: headers 22px (was 13), keys 18px (was 11), descriptions 16px (was 10)
  - Large: headers 26px (was 16), keys 22px (was 14), descriptions 19px (was 12)
- ✅ Changed canvas from `minHeight` to strict `height` (600×600 or 480×480 — never grows)
- ✅ Sticker is now a fixed-size container — content must fit within boundaries

### [~22:00 MT] Strict Section/Shortcut Limits for Guaranteed Legibility
- ✅ Implemented per-text-size limits for sections and shortcuts per section:
  - Small: 6 sections × 12 shortcuts = 72 max
  - Medium: 4 sections × 10 shortcuts = 40 max
  - Large: 4 sections × 7 shortcuts = 28 max
- ✅ `getMaxShortcutsPerSection()` helper function added to design system
- ✅ Section limits enforced when switching text sizes (auto-trims excess sections)
- ✅ Capacity indicator with color coding: green (0-70%), yellow (70-90%), red (90-100%)

### [~22:30 MT] Backend Search Route Fix (Required Server Restart)
- ✅ Simplified backend search from complex Prisma `OR` query to JavaScript filtering
- ✅ Fetches all shortcuts, filters in JavaScript for app name, description, and keys
- ✅ More reliable than Prisma nested queries that were causing 500 errors
- ✅ Required backend server restart to pick up route changes

## Current Status (2026-04-10 ~22:30 MT)
- **Frontend**: Phase 2 ~95% complete
  - ✅ Search works across all apps, shortcuts, and commands
  - ✅ PNG export at correct dimensions (1125×1125 or 900×900)
  - ✅ Save/load layouts (JSON file + localStorage)
  - ✅ Zoom controls (buttons + scroll + trackpad pinch)
  - ✅ Print-optimized font sizes for legibility
  - ✅ Strict section/shortcut limits per text size
  - ✅ Capacity indicator with color coding
  - ⚠️ SVG export has text positioning issues (deferred)
  - ⚠️ Font sizes and section limits need fine-tuning against real printed examples
- **Backend**: Express server with simplified search route
- **Database**: 709 shortcuts across 8 applications

## Next Development Priorities
- [ ] Fine-tune font sizes and section limits against printed examples from `Sticker Layouts/` folder
- [ ] Print test with new font sizes on home printer
- [ ] Fix SVG export text positioning (low priority — PNG is primary export)
- [ ] Add auto-save to localStorage on layout changes
- [ ] Add "Recover Last Session" on startup
- [ ] Create template library (3-5 pre-made templates)
- [ ] Remove debug console.log statements from fetchShortcuts

## 2026-04-10 Phase 3: User Authentication, Save System & Layout Management (Late Evening)

### [~23:00 MT] Section Width & Text Wrapping Fix
- ✅ Fixed description text truncation — removed `whiteSpace: 'nowrap'` and `textOverflow: 'ellipsis'`
- ✅ Added `wordBreak: 'break-word'` and `hyphens: 'auto'` for long descriptions
- ✅ Changed alignment from `center` to `flex-start` so key and description align at top when text wraps
- ✅ Sticker container now uses `overflow: 'hidden'` and `minHeight: 0` to prevent section overflow

### [~23:15 MT] Strict Section Limits Update
- ✅ Revised section limits for guaranteed legibility:
  - Small: 4 sections × 10 shortcuts = 40 max
  - Medium: 4 sections × 8 shortcuts = 32 max
  - Large: 4 sections × 6 shortcuts = 24 max
- ✅ Empty drop slots now respect MAX_SHORTCUTS_PER_SECTION limit
- ✅ Limit checks added to empty slot drop handlers
- ✅ Visual capacity indicator per section header (X/Y count, color-coded)
- ✅ Auto-trim shortcuts per section when switching to smaller text size

### [~23:30 MT] AI Layout Discussion & Decision to Defer
- ✅ Discussed AI-powered layout optimization (smart auto-arrange, capacity prediction)
- ✅ Decision: Defer AI features to Phase 4 — focus on core product first
- ✅ Rationale: Need real users, print testing, and revenue before adding API costs
- ✅ Created git branch strategy: commit Phase 2, branch for AI exploration later

### [~23:45 MT] Phase 2 Commit
- ✅ Committed with message: "feat: Phase 2 complete - fixed layout with strict limits and text wrapping"
- ✅ All Phase 2 goals achieved: search, save/load, export, font sizes, strict limits

### [~00:00 MT] Database Schema Update for Phase 3
- ✅ Updated Prisma schema — simplified Layout model to store JSON data
- ✅ Removed LayoutShortcut junction table (no longer needed)
- ✅ Added CASCADE delete on user relationships
- ✅ Migration applied: `20260124054913_update_layout_schema`

### [~00:15 MT] Authentication API Implementation
- ✅ Created `src/routes/auth.js` — JWT authentication with bcryptjs
  - POST `/register` — Create user, return JWT token
  - POST `/login` — Verify credentials, return JWT token
  - GET `/me` — Get current user info (protected)
  - POST `/logout` — Client-side token removal
  - PUT `/profile` — Update name and email (protected)
  - PUT `/password` — Change password with current password verification (protected)
  - DELETE `/account` — Delete account with password confirmation (protected, CASCADE deletes layouts)
- ✅ JWT tokens expire in 7 days, stored in localStorage

### [~00:30 MT] Layouts CRUD API
- ✅ Created `src/routes/layouts.js` — Full CRUD with ownership checks
  - GET `/` — Get all user's layouts
  - GET `/:id` — Get single layout (ownership verified)
  - POST `/` — Create layout (10-layout limit enforced)
  - PUT `/:id` — Update layout (ownership verified)
  - DELETE `/:id` — Delete layout (ownership verified)
- ✅ 10 layout limit per user enforced at API level

### [~00:45 MT] Frontend Authentication Integration
- ✅ Created `src/contexts/AuthContext.jsx` — Global auth state with register, login, logout, updateProfile, changePassword, deleteAccount
- ✅ Created `src/components/AuthModal.jsx` — Combined login/register modal
- ✅ Updated `src/pages/SignIn.jsx` — Connected to auth API, redirects on success
- ✅ Updated `src/pages/SignUp.jsx` — Connected to auth API, redirects on success
- ✅ Added AuthProvider wrapper in `main.jsx`
- ✅ Tested registration via curl — JWT token returned successfully

### [~01:00 MT] UserHome Page (Profile/Account Management)
- ✅ Created `src/pages/UserHome.jsx` — Comprehensive user account page with 4 tabs:
  - **Profile** — Edit first name, last name, email
  - **Saved Layouts** — View, load, delete layouts (shows X/10 count with limit warning)
  - **Security** — Change password with current password verification
  - **Danger Zone** — Delete account with password confirmation and warning
- ✅ Replaced old placeholder Profile page with UserHome
- ✅ Dark mode support throughout
- ✅ Redirects to /signin if not authenticated

### [~01:15 MT] SaveModal Component
- ✅ Created `src/components/SaveModal.jsx` — Unified save/export modal
- ✅ **Logged-in users**: "Save to My Layouts" button (saves to account)
- ✅ **Guest users**: Warning about temporary storage + "Save to Browser" option + Sign In/Create Account links
- ✅ **Export options for all users**: Download as JSON, Export as PNG, Export as SVG
- ✅ Layout name input with validation

### [~01:30 MT] SaveModal Integration into CreateLayout
- ✅ Integrated SaveModal into CreateLayout.jsx
- ✅ Added `handleSaveToAccount()` — saves layout to user's account via API
- ✅ Added `handleSaveToBrowser()` — saves to localStorage with temporary warning
- ✅ Added `handleDownloadJSON()` — downloads layout as JSON file
- ✅ Added `handleExportPNGFromModal()` and `handleExportSVGFromModal()` — export from modal
- ✅ "Save Layout" button opens SaveModal instead of directly saving
- ✅ Default layout name auto-generated from selected app(s)

## Current Status (2026-04-10 ~01:30 MT)
- **Frontend**: Phase 3 complete
  - ✅ User authentication (register, login, logout)
  - ✅ User profile management (edit name/email, change password, delete account)
  - ✅ Saved layouts with 10-layout limit and X/10 count display
  - ✅ SaveModal with different flows for logged-in vs guest users
  - ✅ Export options: JSON, PNG, SVG
  - ✅ Guest users: browser storage + file download
  - ✅ Registered users: persistent account storage
- **Backend**: Express server with JWT auth, layouts API, 10-layout limit
- **Database**: SQLite with updated schema (JSON layout storage, CASCADE deletes)

## Next Development Priorities
- [ ] Update navigation to show user menu when logged in (name + logout)
- [ ] Load saved layouts from account into CreateLayout editor
- [ ] Print test with current font sizes on home printer
- [ ] Fine-tune section limits against real printed examples
- [ ] Fix SVG export text positioning (low priority)
- [ ] Add auto-save to localStorage on layout changes
- [ ] Mobile responsiveness improvements
