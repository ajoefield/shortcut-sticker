# Technical Decisions

## Architecture
- **Frontend**: React with React Router
- **Backend**: Express.js with Prisma ORM
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS + Inline CSS (for conflict resolution)

## Key Decisions & Rationale

### Database Design
- Single `shortcuts` table with `platform` column instead of separate OS tables
- Unique constraint on `(keys, appId, platform)` to prevent duplicates
- Separate `apps` table for better normalization

### Frontend State Management
- React hooks for local state (no Redux needed for MVP)
- Local favorites storage (will migrate to backend later)
- Separate search states for main page vs modal

### Styling Approach
- Started with Tailwind classes
- Switched to inline CSS when global conflicts occurred
- Prioritized functionality over perfect architecture during MVP phase

### API Design
- RESTful endpoints: `/api/shortcuts/apps`, `/api/shortcuts/search`
- Includes related data to minimize API calls
- Error handling with proper HTTP status codes

## Performance Considerations
- Auto-fit grid layout for responsive design
- Scrollable modals for large datasets
- Efficient search filtering with real-time updates

## Security Notes
- Environment variables for database credentials
- CORS enabled for development
- Input validation on search queries

## [2026-01-09] Extraction Pipeline Architecture

### Pipeline Design
- **Modular architecture**: Classifier → Extractor → Validator → Database
- **Multi-stage extraction**: Direct text (PyPDF2/PyMuPDF) → OCR (Tesseract/Textract) → AI-enhanced (Bedrock Claude)
- **Confidence scoring**: 0-100% per shortcut, threshold-based auto-approval vs human review queue
- **Deduplication**: MD5 hash on (software, platform, key_combination) prevents duplicates

### AWS AI Decision (Bedrock + Textract over OpenAI)
- **Bedrock Claude 3 Haiku**: $0.25/1M input tokens vs OpenAI GPT-4 at $10/1M (40x cheaper)
- **AWS Textract**: Purpose-built document OCR, free tier of 1,000 pages/month
- **SSO authentication**: Profile `'developer playground'` via `boto3.Session(profile_name=...)`
- **Fallback strategy**: AI only reviews low-confidence items; pipeline works without AI enabled

### Python Environment
- **Python 3.12** (not 3.13 — PyMuPDF and pandas have build failures on 3.13)
- **Virtual environment**: `enhanced_pipeline_env_312/`
- **Key dependencies**: PyPDF2, PyMuPDF (fitz), boto3, pandas, opencv-python, pytesseract

### Export Formats
- **CSV**: Per-software files, spreadsheet compatible
- **JSON**: Structured with metadata envelope
- **NDJSON**: Newline-delimited JSON for streaming/bulk imports
- **Prisma schema**: Auto-generated for database migration

### Known Extraction Challenges
- ~~**Sublime Text PDFs**: Mac symbols (⌘⌥⇧⌃) in concatenated text without clear separators~~ → Solved by Simple AI parser
- ~~**Docker PDFs**: CLI commands rather than keyboard shortcuts~~ → Simple AI parser correctly extracts Docker commands
- ~~**Vim Cheat Sheets**: Single-character keys (h/j/k/l) and colon commands (:w, :q)~~ → Simple AI parser extracts 96 shortcuts
- ~~**Browser-generated PDFs**: Text concatenated without whitespace~~ → PyMuPDF + Claude handles all formats

### [2026-01-09] Simplified Pipeline Architecture (AI-Only)

#### Decision: Replace Multi-Stage Pipeline with Simple AI Parser
- **Problem**: Complex routing (classifier → specialized parser → AI fallback → review) was fragile and inconsistent
- **Solution**: Single-path AI-only extraction using Claude Haiku with structured text output
- **Result**: 689 shortcuts (was 287), 100% success rate (was ~67%), consistent quality across all PDFs

#### Simple AI Parser Design
- **Engine**: `simple_extraction_engine.py` — one path, no routing
- **Parser**: `simple_ai_parser.py` — Claude Haiku with structured text format
- **Format**: `SHORTCUT: key | TITLE: action | PLATFORM: platform | CONFIDENCE: score`
- **Why not JSON**: Claude's JSON responses truncate/malform on large documents; structured text is 100% reliable
- **Why not Textract**: Browser-generated PDFs throw UnsupportedDocumentException; PyMuPDF text extraction is universal

#### Key Combination Standardization
- **Standardizer**: `key_standardizer.py` — platform-aware key formatting
- **Mac symbols**: Command→⌘, Option→⌥, Shift→⇧, Control→⌃, Enter→↩, Delete→⌫, Escape→⎋
- **Separator handling**: Supports `+`, `-`, and space separators (Apple docs use hyphens)
- **CSV output**: Both `key_combination_standardized` and `key_combination_original` columns preserved
- **Windows format**: Consistent `Ctrl+Alt+Shift+Key` text format

#### Versioned Output System
- **File naming**: `{software}_shortcuts_{version}_{timestamp}.csv`
- **Latest folder**: `standardized_output/csv_exports/latest/` always has current versions
- **Run summary**: `extraction_summary_{version}_{timestamp}.json` with statistics
- **No overwrites**: Each run creates new versioned files

#### File Naming Convention for Source PDFs
- **Standard**: `{Software}_{Platform}_shortcuts.pdf`
- **Platforms**: Windows, macOS, Linux, Cross-platform
- **Documented**: `enhanced_pipeline/FILE_NAMING_CONVENTION.md`

### Database Storage
- **Pipeline database**: SQLite (`shortcuts.db`) for extraction pipeline
- **Production database**: PostgreSQL via Prisma for the web application
- **Migration path**: Standardized CSV exports → seed scripts import into Prisma
- **Key files**: `standardized_output/csv_exports/latest/` ready for database import

## [2026-01-10] Pipeline Cleanup & Architecture Simplification

### Directory Structure Consolidation
- **Decision**: Moved all essential extraction scripts to `shortcut_extractor/` at workspace root
- **Deleted**: `enhanced_pipeline/` (moved essentials), `PDF_Scrapper/` (obsolete), `standardized_output/`, `simple_ai_output/`
- **Rationale**: Single clean directory with 7 core Python files vs 20+ scattered across multiple directories
- **Output**: Consolidated to existing `output/` directory — no more multiple output folders

### Virtual Environment Cleanup
- **Kept**: `enhanced_pipeline_env_312/` (Python 3.12, 395M, all dependencies)
- **Removed**: `.venv/` (12M, empty), `enhanced_pipeline_env/` (15M, incomplete), `pdf_env/` (158M, old)
- **Rationale**: Only one environment had the complete package set (boto3, PyPDF2, PyMuPDF, pandas)

### Source Folder Naming
- **Decision**: Renamed `Shortcut_PDF/` → `source_keyboard_shortcuts/`
- **Rationale**: Format-agnostic name — supports PDFs and PNGs, clearly describes purpose

## [2026-01-10] PNG Image Support via Claude Vision

### Image AI Parser Design
- **Engine**: `image_ai_parser.py` — Claude 3 Haiku with vision capabilities
- **Preprocessing**: PIL validates image, resizes to max 1568px, converts to base64 JPEG
- **Prompt**: Same structured text format as PDF parser (`SHORTCUT: key | TITLE: action`)
- **Integration**: Document classifier auto-detects `.png` files, routes to Vision AI
- **Cost**: ~$0.02-0.08 per image (slightly more than text-only PDF processing)

### Why Claude Vision over Textract
- **Textract**: Purpose-built for documents but fails on browser-generated PDFs and screenshots
- **Claude Vision**: Handles any image format, understands context, extracts structured data
- **Result**: Single AI provider (Bedrock Claude) handles both PDFs and PNGs

## [2026-01-10] Smart Library Management

### File Tracking System
- **`software_versions.json`**: SHA256 hash per file, extraction date, shortcut count, version number
- **`library_metadata.json`**: Last scan time, pending updates, new/updated applications
- **`library_index.json`**: Searchable index for sticker app with all shortcuts, categories, platforms
- **Smart extraction**: Compares file hashes — only processes new or changed files
- **Force extraction**: `force_extraction.py` CLI for selective or complete re-scanning

### Version Detection
- **Filename patterns**: Extracts version from `VSCode_v1.85_macOS_shortcuts.pdf`
- **File hashing**: SHA256 detects any file modification regardless of naming
- **Extraction versioning**: Incremental version number per application tracks re-extraction history

## [2026-01-10] Platform Strategy — No "Cross-platform"

### Decision: Only macOS and Windows Platforms
- **Problem**: "Cross-platform" and "All" entries don't work for sticker app — users must choose their OS
- **Solution**: `platform_splitter.py` converts cross-platform shortcuts into separate macOS and Windows entries
- **Linux**: Treated as Windows (same Ctrl/Alt/Shift key combinations, no ⌘ key)
- **AI prompts updated**: Parsers instructed to only output "macOS" or "Windows"
- **Splitting logic**: `⌘ + C / Ctrl+C` → two entries: macOS `⌘ + C` and Windows `Ctrl+C`
- **Universal keys**: F1, F5, arrow keys → duplicated for both platforms

### Extraction Pipeline Steps (Updated)
1. **Classify** — Detect file type (PDF/PNG), identify application and platform
2. **Extract** — Simple AI parser (PDF) or Image AI parser (PNG)
3. **Standardize** — Mac symbols (⌘⌥⇧⌃) for macOS, text format (Ctrl+Shift) for Windows
4. **Split platforms** — Convert any cross-platform entries into separate macOS/Windows rows
5. **Export** — Versioned CSV files with latest copies

## [2026-01-10] Terminology — "Application" not "Software"

### Decision: Use "Application" Throughout
- **Rationale**: Users think in terms of "applications" (VS Code, Figma), not "software"
- **Updated**: Library index uses `applications` key, status reports say "Applications", API endpoint is `/applications`
- **Database implication**: The `apps` table in Prisma already uses "app" — consistent with "application"

## [2026-01-10] AWS Serverless Architecture (Designed)

### Lambda Handler Design
- **File**: `aws_lambda_handler.py` — single handler for multiple event types
- **S3 trigger**: New PDF/PNG uploaded → automatic extraction
- **EventBridge**: Daily scheduled scans for library updates
- **API Gateway**: REST endpoints for sticker app (`/status`, `/search`, `/applications`)
- **Smart processing**: Uses library manager to skip unchanged files even in Lambda

### Estimated Monthly Costs
- Lambda: $5-15, S3: $1-5, Bedrock: $10-30, API Gateway: $1-5
- **Total**: ~$17-55/month for full serverless extraction pipeline

### Current File Structure
```
shortcut_extractor/
├── simple_extraction_engine.py  # Main entry point with smart extraction
├── simple_ai_parser.py          # PDF extraction via Claude Haiku
├── image_ai_parser.py           # PNG extraction via Claude Vision
├── document_classifier.py       # File type detection and routing
├── key_standardizer.py          # Mac symbols (⌘⌥⇧⌃) formatting
├── platform_splitter.py         # Cross-platform → macOS + Windows
├── extraction_engine.py         # Data structures (ExtractedShortcut)
├── library_manager.py           # Smart tracking and library index
├── force_extraction.py          # CLI for re-scanning
├── aws_lambda_handler.py        # Serverless deployment handler
├── run_extraction.py            # Simple runner script
└── test_extractor.py            # Test script
```

## [2026-01-10] Output Standardization — Platform-Specific Files (~00:30 MT)

### Decision: One CSV Per Application Per Platform
- **Problem**: Output files like `vs_code_shortcuts_latest.csv` contained mixed macOS and Windows shortcuts
- **Solution**: Group shortcuts by `{application}_{platform}` when exporting
- **Output format**: `{application}_{platform}_shortcuts_latest.csv`
- **Examples**: `vs_code_macos_shortcuts_latest.csv`, `intellij_idea_windows_shortcuts_latest.csv`, `vim_cli_shortcuts_latest.csv`
- **Rationale**: Database seeding requires platform-specific data; users select their OS in the sticker app

### Decision: Filename-Based Platform Detection Priority
- **Problem**: Text content analysis was unreliable for platform detection (e.g., RStudio PDF detected as "Windows" despite having Mac section)
- **Solution**: Added `_detect_platform_from_filename()` — checks filename patterns before falling back to text analysis
- **Patterns**: `macOS`, `Windows`, `Cross-platform`, `crossplatform`, `CLI`
- **Rationale**: Filename is explicitly set by the user and is always correct; text analysis is a heuristic

## [2026-01-10] Terminology Migration — Full Implementation

### Decision: `application_versions.json` Replaces `software_versions.json`
- **Renamed**: `SoftwareVersion` → `ApplicationVersion`, `software_versions` → `application_versions`
- **Migration**: Auto-detects old `software_versions.json` and migrates field names
- **Field mapping**: `software_name` → `application_name`, `pdf_filename` → `file_name`, `pdf_hash` → `file_hash`
- **Backward compatible**: Old files are read and migrated transparently

## [2026-01-10] Cross-Platform Image Extraction Fix

### Problem: Vision AI Only Extracting One Platform Column
- **Symptom**: Kiro cross-platform PNG had Mac + Windows columns but only Windows shortcuts extracted
- **Root cause 1**: Vision prompt didn't explicitly instruct Claude to look for multiple columns
- **Root cause 2**: Claude returned `PLATFORM: Mac` but system expected `macOS` — silent drop
- **Fix 1**: Added cross-platform instruction block to vision prompt when `classification.platform == 'Cross-platform'`
- **Fix 2**: Platform normalization in `_parse_claude_response()`: `Mac` → `macOS`
- **Result**: Kiro now extracts both platforms (36 macOS + 36 Windows)

### PDF vs PNG for Cross-Platform Documents
- **PDF**: More total shortcuts but poor cross-platform balance (RStudio: 97 total, only 8 macOS)
- **PNG**: Fewer total but better balance (RStudio: 92 total, 50 macOS + 42 Windows)
- **Recommendation**: Use PNG for cross-platform sources, PDF for single-platform sources
- **Reason**: Vision AI reads spatial layout (columns); text AI reads linearly (misses second sections)

## [2026-01-10] CLI Platform — Third Platform Type

### Decision: Add "CLI" Platform for Terminal Tools
- **Problem**: Vim, Git, Docker CLI shortcuts are identical across macOS/Windows/Linux — splitting into OS-specific files was wrong
- **Solution**: Added "CLI" as a third platform alongside macOS and Windows
- **CLI tools detected**: Vim, Neovim, Emacs, Nano, Git, tmux, screen, Bash, Zsh, Fish, Docker
- **Detection**: `_is_cli_tool()` checks against `cli_tools` dictionary + filename indicators + text content
- **Platform splitter**: CLI shortcuts skip splitting entirely (universal across OS)
- **AI prompts**: Updated both simple and vision parsers to accept "CLI" as valid platform

### Updated Platform Model
| Platform | Description | Key Format | Example |
|----------|-------------|------------|---------|
| macOS | Mac desktop apps | ⌘ ⌥ ⇧ ⌃ symbols | `⌘ + C` |
| Windows | Windows desktop apps | Ctrl/Alt/Shift text | `Ctrl+C` |
| CLI | Terminal/command-line tools | Raw keys/commands | `:w`, `h`, `dd` |

### Updated Extraction Pipeline Steps
1. **Classify** — Detect file type (PDF/PNG), identify application, detect platform (macOS/Windows/Cross-platform/CLI)
2. **Extract** — Simple AI parser (PDF) or Image AI parser (PNG), with multi-section support for cross-platform PDFs
3. **Standardize** — Mac symbols (⌘⌥⇧⌃) for macOS, text format (Ctrl+Shift) for Windows, raw format for CLI
4. **Split platforms** — Convert cross-platform entries into separate macOS/Windows rows; CLI entries pass through unchanged
5. **Export** — Platform-specific versioned CSV files: `{app}_{platform}_shortcuts_{version}_{timestamp}.csv`

### Updated File Structure
```
shortcut_extractor/
├── simple_extraction_engine.py  # Main entry point — groups output by app+platform
├── simple_ai_parser.py          # PDF extraction — multi-section support for cross-platform
├── image_ai_parser.py           # PNG extraction — cross-platform column detection, Mac→macOS normalization
├── document_classifier.py       # CLI tool detection, filename-based platform detection
├── key_standardizer.py          # Mac symbols (⌘⌥⇧⌃) formatting
├── platform_splitter.py         # Cross-platform → macOS + Windows; CLI passthrough
├── extraction_engine.py         # Data structures (ExtractedShortcut)
├── library_manager.py           # ApplicationVersion tracking, backward migration from SoftwareVersion
├── force_extraction.py          # CLI for re-scanning
├── aws_lambda_handler.py        # Serverless deployment handler
├── run_extraction.py            # Simple runner script
└── test_extractor.py            # Test script
```

### Source File Naming Convention
```
Input:  {ApplicationName}_{Platform}_shortcuts.{pdf|png}
Output: {application}_{platform}_shortcuts_latest.csv

Platforms: macOS, Windows, Cross-platform, CLI
Examples:
  VSCode_macOS_shortcuts.pdf      → vs_code_macos_shortcuts_latest.csv
  VSCode_Windows_shortcuts.pdf    → vs_code_windows_shortcuts_latest.csv
  Vim_CLI_shortcuts.pdf           → vim_cli_shortcuts_latest.csv
  Kiro_Cross-platform_shortcuts.png → kiro_macos_shortcuts_latest.csv + kiro_windows_shortcuts_latest.csv
```

## [2026-01-10] Text File (.txt) Support (~22:40 MT)

### Decision: Add TXT as Third Input Format
- **Problem**: User had JupyterLab shortcuts in plain text/markdown format — pipeline only supported PDF and PNG
- **Solution**: Added `.txt` support across entire pipeline (scanning, classification, extraction, library management)
- **Text extraction**: Direct file read — no parsing libraries needed
- **AI processing**: Same Claude Haiku structured text format as PDF and PNG
- **Classification**: New `_classify_txt_document()` method with high confidence (95%) for text files

### Decision: Unified AI Pipeline for All File Types
- **Problem**: Three separate extraction paths (PDF parser, image parser, text parser) added complexity
- **Solution**: All file types route through single Simple AI parser
- **`_extract_text_fallback()` handles file differences**:
  - `.txt` → direct file read
  - `.pdf` → PyMuPDF text extraction
  - `.png` → returns filename context for AI
- **Rationale**: One path, fewer bugs, easier to maintain. The AI handles format differences naturally.

## [2026-01-10] OSA Platform — Replaces CLI (~22:40 MT)

### Decision: Replace "CLI" with "OSA" (Operating System Agnostic)
- **Problem**: "CLI" was a developer concept. Users think "works everywhere" not "command line interface"
- **Solution**: Renamed CLI → OSA throughout entire pipeline
- **OSA definition**: Shortcuts that are identical regardless of operating system (Vim, Git, Docker CLI, etc.)
- **Files updated**: `document_classifier.py`, `platform_splitter.py`, `simple_ai_parser.py`, `image_ai_parser.py`, `library_manager.py`, `NAMING_CONVENTIONS.md`

### OSA Platform Rules
- **OSA only applies to source files** — determined by filename, not AI inference
- **`_OSA_` in filename** → generate single output file (e.g., `Vim_OSA_shortcuts.pdf` → `vim_osa_shortcuts.csv`)
- **Known OSA tools** (Vim, Git, etc.) with no explicit platform in filename → detected as OSA
- **Cross-platform** → generate separate macOS and Windows output files (minimum 2)
- **macOS/Windows** → generate single platform-specific output file

### Updated Platform Model
| Platform | Description | Key Format | Output Files | Example Source |
|----------|-------------|------------|-------------|----------------|
| macOS | Mac desktop apps | ⌘ ⌥ ⇧ ⌃ symbols | 1 file | `VSCode_macOS_shortcuts.pdf` |
| Windows | Windows desktop apps | Ctrl/Alt/Shift text | 1 file | `VSCode_Windows_shortcuts.pdf` |
| OSA | OS-agnostic tools | Raw keys/commands | 1 file | `Vim_OSA_shortcuts.pdf` |
| Cross-platform | Both platforms in one source | Mixed | 2+ files | `Kiro_Cross-platform_shortcuts.png` |

### Platform Detection Priority (Updated)
1. **Filename explicit platform** (highest priority): `_macOS_`, `_Windows_`, `_OSA_`, `_Cross-platform_`
2. **Known OSA tools** (only if no explicit platform): Vim, Git, Docker, tmux, etc.
3. **Text content analysis** (lowest priority, fallback only): Mac/Windows indicator counting

### Decision: Remove Text Content from OSA Detection
- **Problem**: `_is_osa_tool()` scanned text for terminal keywords ("command line", "terminal", "shell") — caused false positives (VS Code Windows detected as OSA)
- **Solution**: Removed text content analysis from OSA detection entirely
- **OSA now determined only by**: explicit `_OSA_` in filename OR known OSA tool with no explicit platform
- **Rationale**: Heuristics should never override explicit naming conventions

## [2026-01-10] AI Parser Platform Enforcement (~22:40 MT)

### Decision: Strict Platform Assignment from Source File
- **Problem**: AI extracted Vim shortcuts as "Windows" (seeing `Ctrl+R`) despite source being OSA
- **Solution**: Updated AI prompt with explicit platform enforcement rules and examples
- **Key instruction**: "If source is OSA: ALL shortcuts must be OSA (never Windows or macOS)"
- **Added examples**: `SHORTCUT: Ctrl+R | TITLE: Redo | PLATFORM: OSA | CONFIDENCE: 95`
- **Ongoing challenge**: LLM training data strongly associates `Ctrl+` with Windows — examples help more than rules

### Updated Source File Naming Convention
```
Input:  {ApplicationName}_{Platform}_shortcuts.{pdf|png|txt}
Output: {application}_{platform}_shortcuts_latest.csv

Platforms: macOS, Windows, OSA, Cross-platform
Extensions: .pdf, .png, .txt

Examples:
  VSCode_macOS_shortcuts.pdf           → vs_code_macos_shortcuts_latest.csv
  VSCode_Windows_shortcuts.pdf         → vs_code_windows_shortcuts_latest.csv
  Vim_OSA_shortcuts.pdf                → vim_osa_shortcuts_latest.csv (single file)
  Kiro_Cross-platform_shortcuts.png    → kiro_macos_shortcuts_latest.csv + kiro_windows_shortcuts_latest.csv
  jupyterlab_macOS_shortcuts.txt       → jupyterlab_macos_shortcuts_latest.csv
  jupyterlab_Windows_shortcuts.txt     → jupyterlab_windows_shortcuts_latest.csv
```

### Updated Extraction Pipeline Steps
1. **Classify** — Detect file type (PDF/PNG/TXT), identify application, detect platform (macOS/Windows/OSA/Cross-platform)
2. **Extract** — Unified Simple AI parser for all file types (text extraction varies by format)
3. **Standardize** — Mac symbols (⌘⌥⇧⌃) for macOS, text format (Ctrl+Shift) for Windows, raw format for OSA
4. **Split platforms** — Convert cross-platform entries into separate macOS/Windows rows; OSA entries pass through unchanged
5. **Export** — Platform-specific versioned CSV files: `{app}_{platform}_shortcuts_{version}_{timestamp}.csv`

### Known Issues (2026-01-10 ~22:40 MT)
- **`vs_code_confidence:_100_shortcuts_latest.csv`**: AI occasionally outputs malformed lines with "CONFIDENCE: 100" as platform — needs parser-level validation
- **Vim OSA leakage**: AI still classifies some `Ctrl+` shortcuts as "Windows" despite OSA instruction — needs stronger prompt or post-processing override
- **RStudio Cross-platform**: Only generating Windows file — AI not extracting macOS shortcuts from the PDF

## [2026-01-10] Vim OSA Fix, Cross-Platform Pipeline & Smart Fallback (~23:55 MT)

### Decision: Post-Processing Override for OSA Platform
- **Problem**: AI prompt engineering couldn't override Claude's `Ctrl+` = Windows training bias
- **Solution**: Post-processing step forces all shortcuts to OSA when `classification.platform == 'OSA'`
- **Rationale**: Three-line code fix is more reliable than increasingly complex prompt instructions
- **Lesson**: Don't fight AI training data — fix the output programmatically

### Decision: Key Standardizer OSA Support
- **Problem**: OSA platform fell into `else` clause, treated as cross-platform (creating Mac/Windows format pairs)
- **Solution**: Added explicit `elif platform == 'osa'` branch that preserves original key format
- **New display format**: `osa_original` — no conversion applied
- **Rationale**: OSA shortcuts should remain in their raw form (`:w`, `Ctrl+R`, `dd`) without platform-specific formatting

### Decision: Key Standardization AFTER Platform Splitting
- **Problem**: Standardizer ran before platform splitting, converting Mac shortcuts to Windows format → splitter couldn't find Mac shortcuts
- **Solution**: Reordered pipeline: Extract → OSA Correction → Platform Split → Standardize
- **Impact**: RStudio cross-platform now correctly preserves Mac shortcuts through the split step
- **Lesson**: Pipeline step ordering is a critical architectural decision

### Decision: Malformed AI Output Validation
- **Problem**: AI occasionally outputs `PLATFORM: CONFIDENCE: 100` creating spurious files like `vs_code_confidence:_100_shortcuts_latest.csv`
- **Solution**: Added validation in `_parse_simple_response()` — rejects entries containing cross-field keywords
- **Checks**: Platform must be in `['Windows', 'macOS', 'OSA', 'Cross-platform']`, no field contamination
- **Fallback**: Invalid platform → use source file's classification platform

### Decision: Document Structure Analyzer
- **New component**: `document_structure_analyzer.py`
- **Purpose**: Analyze document layout BEFORE AI parsing to provide better context
- **Detects**: Format type (table/sections/list/mixed), platform organization (columns/sections/mixed/single)
- **Outputs**: Column headers, section headers, platform indicators, layout hints, confidence score
- **Integration**: Structure analysis passed to AI prompt as additional context
- **RStudio result**: Correctly identified as "table format, columns platform organization, 95% confidence"

### Decision: Hybrid Extraction Architecture (Python-First + AI Fallback)
- **Architecture**: Python parsing as primary → AI validation as backup → Smart fallback for problems
- **New components**:
  - `table_parser.py` — Direct Python parsing for table-format documents
  - `python_first_extractor.py` — Python-first extraction with table/list/unstructured strategies
  - `cross_platform_processor.py` — Expands single-platform output to cross-platform pairs
  - `smart_fallback_system.py` — Detects problems and applies appropriate fallbacks
- **When Python-first runs**: After normal AI pipeline, only when problems detected (cross-platform single output, low count, platform mismatch)
- **Rationale**: AI works great for most files; Python parsing is more reliable for structured tables

### Decision: Smart Fallback System (Post-Pipeline Quality Check)
- **Problem**: Cross-platform files sometimes only produce single-platform output
- **Solution**: Run quality checks after extraction, apply targeted fallbacks
- **Problem detection**:
  1. Cross-platform file with single platform output → Python-first extraction fallback
  2. Low shortcut count for known apps → Python-first extraction fallback
  3. Platform mismatch (OSA file with Windows/Mac) → Platform correction
- **Design choice**: Runs AFTER normal pipeline, not instead of it — targeted, not universal

### Critical Correction: Ctrl ≠ Windows
- **Problem**: Multiple components assumed `Ctrl+` shortcuts are Windows-only
- **Reality**: macOS uses Ctrl extensively (Ctrl+C in terminal, Ctrl+2 in RStudio, Ctrl+L in console apps)
- **Fix**: `_determine_platform_from_shortcut()` returns 'Unknown' for ambiguous keys (Ctrl, Alt, Shift)
- **Strong Mac indicators**: ⌘, ⌥, ⇧, ⌃ (symbols), Cmd, Command, Option (text)
- **Strong Windows indicators**: Win, Windows (only these are unambiguous)
- **Platform determination**: Use document context (column headers, filename) not key pattern analysis

### Updated Extraction Pipeline Steps (2026-01-10 ~23:55 MT)
1. **Classify** — Detect file type (PDF/PNG/TXT), identify application, detect platform
2. **Analyze Structure** — Document structure analyzer detects format type and platform organization
3. **Extract** — AI parser (with structure context) OR table parser for known table-format cross-platform docs
4. **OSA Correction** — Force all shortcuts to OSA when source file is OSA
5. **Cross-Platform Processing** — Expand single-platform output for cross-platform sources
6. **Platform Split** — Convert cross-platform entries into separate macOS/Windows rows; OSA passthrough
7. **Smart Fallback** — Detect problems (single output, low count, mismatch) and apply Python-first fallback
8. **Key Standardize** — Mac symbols (⌘⌥⇧⌃) for macOS, text format for Windows, raw format for OSA
9. **Export** — Platform-specific versioned CSV files

### Updated File Structure (2026-01-10 ~23:55 MT)
```
shortcut_extractor/
├── simple_extraction_engine.py      # Main pipeline orchestrator (8-step process)
├── simple_ai_parser.py              # AI extraction with structure context
├── document_structure_analyzer.py   # NEW: Document layout analysis
├── table_parser.py                  # NEW: Direct Python table parsing
├── python_first_extractor.py        # NEW: Python-first hybrid extraction
├── cross_platform_processor.py      # NEW: Cross-platform expansion fallback
├── smart_fallback_system.py         # NEW: Intelligent error detection
├── document_classifier.py           # File type detection and routing
├── key_standardizer.py              # Mac symbols formatting + OSA support
├── platform_splitter.py             # Cross-platform → macOS + Windows; OSA passthrough
├── extraction_engine.py             # Data structures (ExtractedShortcut)
├── library_manager.py               # ApplicationVersion tracking
├── image_ai_parser.py               # PNG extraction via Claude Vision
├── force_extraction.py              # CLI for re-scanning
├── aws_lambda_handler.py            # Serverless deployment handler
├── run_extraction.py                # Simple runner script
└── test_extractor.py                # Test script
```

### Known Issues (2026-01-10 ~23:55 MT)
- **RStudio Cross-platform**: Table parser not recognizing RStudio PDF table headers — needs header detection debugging
- **RStudio workaround**: Cross-platform processor and smart fallback system in place but table parser `can_parse_table()` returning False

## [2026-01-11] Quality Review System — Post-Pipeline Validation

### Decision: Quality Review as Final Pipeline Step
- **Problem**: No visibility into extraction quality — malformed shortcuts mixed with good data, platform imbalances undetected
- **Solution**: `quality_reviewer.py` runs after all exports, analyzes `latest/` folder, generates reports in `review/` folder
- **Checks performed**:
  1. Platform count balance for cross-platform apps (configurable tolerance per app)
  2. Malformed shortcut detection via pattern matching + AI validation
  3. Missing platform detection (cross-platform app should have both Windows and macOS)
  4. Confidence score calculation per application
- **Output**: `quality_report.json` (summary), `malformed_shortcuts.csv` (bad data), `false_positives.csv` (incorrectly flagged)

### Decision: AI-Powered Malformed Shortcut Validation
- **Problem**: Pattern-based malformed detection too aggressive — flagged valid shortcuts like Vim's `j` and RStudio's `Home`
- **Solution**: `ai_shortcut_validator.py` uses Claude Haiku to verify shortcuts flagged by pattern matching
- **Only validates flagged shortcuts** — not all shortcuts (cost-efficient)
- **Batches by application** (10 per batch) for efficient API calls
- **Separates confirmed malformed from false positives** — prevents valid shortcuts from being discarded
- **Cost**: ~$0.001 per batch of 10 shortcuts using Claude Haiku

### Decision: Review Folder Structure
- **Location**: `output/csv_exports/review/`
- **Files**:
  - `quality_report.json` — per-application status, confidence scores, issue summaries
  - `malformed_shortcuts.csv` — confirmed bad data with AI validation results
  - `false_positives.csv` — shortcuts incorrectly flagged by pattern matching (actually valid)
- **Rationale**: Clean separation — `latest/` has production data, `review/` has quality analysis

## [2026-01-11] Key Standardizer — Disabled

### Decision: Disable Key Standardization Entirely
- **Problem**: Standardizer corrupting Mac shortcuts — converting symbols (⌥) to text, splitting on `+` incorrectly, producing malformed output like `⌥` with title `+/`
- **Root cause**: Standardizer designed for text→symbol conversion was also processing already-symbolic shortcuts
- **Solution**: Disabled standardization step in pipeline, simplified CSV to single `key_combination` column
- **CSV format change**: Removed `key_combination_standardized` and `key_combination_original` — now just `key_combination`
- **Future plan**: Re-enable with Mac-safe mode (convert text→symbols only, never symbols→text)
- **Lesson**: Preserve original data. Standardization is a presentation concern, not a data concern.

### Updated CSV Header Format
```
Before: application_name,platform,key_combination_standardized,key_combination_original,title,description,category,confidence_score,extraction_method
After:  application_name,platform,key_combination,title,description,category,confidence_score,extraction_method
```

## [2026-01-11] Smart Fallback Fix — Zero Shortcut Case

### Decision: Always Run Smart Fallback (Remove `if shortcuts:` Gate)
- **Problem**: Smart fallback system only ran when shortcuts existed (`if shortcuts:`), but the exact case it was designed for (table parser returning 0 shortcuts) was gated out
- **Solution**: Removed the `if shortcuts:` condition — fallback system now always runs
- **Impact**: RStudio cross-platform immediately went from 0 shortcuts to 710 via Python-first fallback
- **Lesson**: Guard clauses should protect against invalid states, not prevent fallback mechanisms from executing

## [2026-01-11] Document Structure Analyzer — Vertical Header Support

### Decision: Support Vertical Table Headers (Separate Lines)
- **Problem**: RStudio PDF has headers on separate lines (line 14: "Description", line 15: "Windows & Linux", line 16: "Mac") — original code only detected horizontal headers on a single line
- **Solution**: Added vertical header pattern detection — checks consecutive lines for Description + platform keyword + "Mac" sequence
- **Detection priority**: Vertical header check runs FIRST (before horizontal), since it's more specific
- **Validation**: Checks that data rows with shortcut patterns follow the header sequence
- **Result**: Column headers correctly extracted as `['Description', 'Windows & Linux', 'Mac']`

## [2026-01-11] Updated Extraction Pipeline Steps
1. **Classify** — Detect file type (PDF/PNG/TXT), identify application, detect platform
2. **Analyze Structure** — Document structure analyzer detects format type and platform organization
3. **Extract** — AI parser (with structure context) OR table parser for known table-format cross-platform docs
4. **OSA Correction** — Force all shortcuts to OSA when source file is OSA
5. **Cross-Platform Processing** — Expand single-platform output for cross-platform sources
6. **Platform Split** — Convert cross-platform entries into separate macOS/Windows rows; OSA passthrough
7. **Smart Fallback** — Detect problems (single output, low count, mismatch, zero shortcuts) and apply Python-first fallback
8. **Export** — Platform-specific versioned CSV files (no standardization — original format preserved)
9. **Quality Review** — Validate platform counts, detect malformed shortcuts, AI-validate flagged entries, generate reports

### Updated File Structure (2026-01-11)
```
shortcut_extractor/
├── simple_extraction_engine.py      # Main pipeline orchestrator (9-step process)
├── simple_ai_parser.py              # AI extraction with structure context
├── document_structure_analyzer.py   # Document layout analysis (vertical header support)
├── table_parser.py                  # Direct Python table parsing
├── python_first_extractor.py        # Python-first hybrid extraction
├── cross_platform_processor.py      # Cross-platform expansion fallback
├── smart_fallback_system.py         # Intelligent error detection (zero-shortcut fix)
├── quality_reviewer.py              # NEW: Post-pipeline quality validation
├── ai_shortcut_validator.py         # NEW: AI-powered malformed shortcut verification
├── document_classifier.py           # File type detection and routing
├── key_standardizer.py              # DISABLED — Mac symbols formatting (corrupting data)
├── platform_splitter.py             # Cross-platform → macOS + Windows; OSA passthrough
├── extraction_engine.py             # Data structures (ExtractedShortcut)
├── library_manager.py               # ApplicationVersion tracking
├── image_ai_parser.py               # PNG extraction via Claude Vision
├── force_extraction.py              # CLI for re-scanning
├── aws_lambda_handler.py            # Serverless deployment handler
├── run_extraction.py                # Simple runner script
└── test_extractor.py                # Test script
```

### Known Issues (2026-01-11)
- **RStudio "unknown" platform**: Python-first extractor uses list parsing for vertical table — produces "Unknown" platform for ambiguous Ctrl/Alt shortcuts
- **RStudio count imbalance**: Windows=565 vs macOS=145 (74.3% imbalance) — Python-first extractor not parsing vertical table structure correctly
- **Kiro count imbalance**: Windows=180 vs macOS=102 (43.3% imbalance) — Python-first extractor same issue
- **Key standardizer disabled**: Shortcuts stored in original format — sticker app will need presentation-layer formatting

## [2026-01-11] Database Integration — SQLite for Local Development

### Decision: Switch from PostgreSQL to SQLite for Local Dev
- **Problem**: PostgreSQL service not running (`ECONNREFUSED`), requires `brew services start` and server management
- **Solution**: Changed Prisma provider to `sqlite`, `DATABASE_URL = "file:./dev.db"`
- **Rationale**: Zero-config database for local development — no server process, no port conflicts, no authentication
- **Production plan**: Switch back to PostgreSQL when deploying (just change provider + URL in `.env`)
- **Migration**: Reset Prisma migrations (`rm -rf prisma/migrations`, `npx prisma migrate dev --name init`)

### Decision: Database Loader Script (`database_loader.js`)
- **Purpose**: Bridge between extraction pipeline (Python → CSV) and web app (Node.js → Prisma → SQLite)
- **Location**: `shortcut-sticker/backend/database_loader.js`
- **CSV source**: `../../output/csv_exports/latest/` (relative to backend directory)
- **Platform mapping**: `windows→windows`, `macos→mac`, `osa→both`, `unknown→both`
- **OSA rationale**: OSA shortcuts work on all platforms, so they appear for both `mac` and `windows` in the sticker app
- **Duplicate prevention**: `findFirst` check before creating each shortcut
- **CLI commands**: `load`, `clear`, `reload`, `verify` via npm scripts

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

### Database Loading Results (Real Extracted Data)
- **Total shortcuts loaded**: 709 (from 1765 extracted — duplicates and platform mapping reduce count)
- **Applications**: 8 (VS Code 176, IntelliJ IDEA 174, Vim 96, JupyterLab 62, macOS 57, Photoshop 50, Sublime Text 46, Docker 48)
- **npm scripts added**: `load-shortcuts`, `clear-shortcuts`, `reload-shortcuts`, `verify-shortcuts`

## [2026-01-11] Frontend Multi-App Layout Fix

### Decision: Unified App Selection Gate for Single/Multi Mode
- **Problem**: `fetchShortcuts()` gated behind `if (!selectedApp)` — only worked for single-app mode, blocked multi-app
- **Solution**: Changed gate to `layoutType === 'single' ? selectedApp : selectedApps.length > 0`
- **useEffect dependencies**: Added `selectedApps`, `layoutType` to trigger re-fetch on multi-app changes

### Decision: Multi-App Platform Detection
- **Problem**: `checkPlatforms()` only accepted single app name string
- **Solution**: Updated to accept `string | string[]`, filters shortcuts for all selected apps
- **Platform aggregation**: Shows union of platforms across all selected apps

### Decision: Search Expansion in Layout View
- **Problem**: Search only filtered within selected apps — couldn't discover shortcuts from other apps
- **Solution**: When search term is active, show results from ALL apps; when empty, show only selected apps
- **Rationale**: Users may want to add a shortcut from an app they didn't initially select

## [2026-01-11] Development Environment Configuration

### AWS SSO Shell Aliases
- **Added to `~/.zshrc`**:
  - `awslogin` → `aws sso login --profile "developer playground"`
  - `awsstatus` → `aws sts get-caller-identity --profile "developer playground"`
  - `awslogout` → `aws sso logout`

### Kiro Steering Rule — Python Environment
- **File**: `.kiro/steering/python-environment.md` (inclusion: always)
- **Purpose**: Ensures extraction pipeline always uses correct Python environment
- **Environment**: `/Users/joefeelap/Create Web Apps/enhanced_pipeline_env_312`
- **Usage**: `enhanced_pipeline_env_312/bin/python shortcut_extractor/run_extraction.py`

## [2026-01-11] Sticker Layout Visual Design — Spec Planning

### Decision: Use Spec Workflow for Sticker Design (Not Chat)
- **Rationale**: Complex multi-constraint feature (sticker sizes × text sizes × section counts × shortcut limits) needs structured planning
- **Reference designs**: SVG files in `Sticker Layouts/` folder (Vim white/black, VS Code Mac white, VS Code optimized)
- **Key constraints identified**:
  - 2 sticker sizes: 3.75×3.75" and 3×3"
  - 3 text sizes controlling max shortcuts per layout
  - Sections and shortcuts controlled by size + text combination
  - Early version: predetermined characteristics
  - Later version: user customization
- **Target file**: `shortcut-sticker/frontend/src/pages/CreateLayout.jsx`
- **Approach**: Canva-like graphic design flow for keyboard shortcut stickers

### Updated System Architecture (2026-01-11)
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
Sticker Design Tool (CreateLayout.jsx)
```

## [2026-04-10] Sticker Layout Visual Design — Design System Architecture

### Decision: Centralized Design System Constants
- **File**: `shortcut-sticker/frontend/src/constants/designSystem.js`
- **Rationale**: Single source of truth for all visual parameters — eliminates magic numbers in components
- **Exports**: `COLOR_PALETTES`, `TYPOGRAPHY`, `KEY_SYMBOLS`, `IMAGE_SIZES`, `TEXT_SIZES`, `SECTION_LIMITS`, spacing configs, helper functions

### Decision: 5 Predefined Color Palettes (No Custom Colors)
- **Palettes**: Classic (#00AAFF), VS Code (#007ACC), Kiro (#8B5CF6), Dark (#60A5FA bg:#1F2937), Monochrome (#000000)
- **Structure**: Each palette has 7 properties: `background`, `border`, `sectionBackground`, `sectionBorder`, `text`, `textSecondary`, `placeholder`
- **Text constraint**: Always black (#000000) or white (#FFFFFF) for print readability
- **Rationale**: Controlled palettes guarantee print quality. Custom colors risk illegible output. Expand palette library in Phase 4.

### Decision: System Fonts Only (No Custom/External Fonts)
- **Primary**: `"Inter", "SF Pro", system-ui, -apple-system, sans-serif`
- **Monospace**: `"SF Mono", "Consolas", "Monaco", monospace`
- **Rationale**: Predictable layout calculations — system fonts have known metrics, enabling accurate shortcut capacity predictions. Custom fonts would require font loading, embedding for export, and unpredictable text width calculations.

### Decision: Standardized Key Symbols with Platform-Aware Formatting
- **macOS symbols**: ⌘ (Command), ⌥ (Option), ⌃ (Control), ⇧ (Shift), ⌫ (Delete), ⏎ (Return), ⇥ (Tab), ⎋ (Escape)
- **Windows symbols**: ⊞ (Windows), Ctrl, Alt, ⇧ (Shift), Del, ↵ (Enter), Tab, Esc
- **Implementation**: `formatShortcutKey(key, platform)` — case-insensitive word-boundary replacement
- **Rationale**: Standardized symbols match physical keyboard labels, look professional in print, and save horizontal space vs text labels

### Decision: Two Fixed Image Sizes (No Custom Sizes)
| Size | Physical | Pixels @300DPI | Display | Use Case |
|------|----------|----------------|---------|----------|
| 3.75" | 3.75×3.75" | 1125×1125 | 600×600px | 16" laptop palm rest |
| 3" | 3×3" | 900×900 | 480×480px | 15" or smaller laptop |
- **Rationale**: Fixed sizes enable predetermined capacity tables and spacing rules. Custom sizes would require dynamic calculation of every parameter.

### Decision: Capacity Tables (Deterministic Shortcut Limits)
| Sticker Size | Small Text | Medium Text | Large Text |
|-------------|-----------|------------|-----------|
| 3.75" | 60 | 42 | 28 |
| 3" | 48 | 36 | 24 |
- **Section limits**: Small=6, Medium=4, Large=4
- **Max per section**: 12
- **Rationale**: Predetermined limits ensure text remains legible at print size. Capacity = f(sticker_size, text_size) is a pure function.

### Decision: Size-Specific Spacing Parameters
- **3.75" sticker**: 30px outer padding, 3px border, 20px border radius, 12px section gap/padding
- **3" sticker**: 24px outer padding, 2.5px border, 16px border radius, 10px section gap/padding
- **Implementation**: `getSpacing(imageSize)` returns the correct spacing config
- **Rationale**: Smaller stickers need tighter spacing to maximize usable area while maintaining visual hierarchy

### Decision: Deterministic Spec Over User Stories
- **Old spec**: `.kiro/specs/sticker-layout-visual-design.md` — user stories with acceptance criteria
- **New spec**: `.kiro/specs/sticker-layout-visual-design-kiro.md` — deterministic rules, constraints, invariants
- **Rationale**: Print-ready output requires pixel precision. User stories describe intent; deterministic specs describe exact behavior. The new spec includes behavioral requirements (BR-1 through BR-4), layout invariants, export rules, and a validation checklist.

### Decision: "Image" Not "Sticker" in System Terminology
- **Rationale**: The system produces a digital image file. "Sticker" refers to the physical paper it's printed on. This distinction clarifies system boundaries — we control image quality/dimensions/DPI, not paper/adhesive/die-cut.
- **Impact**: Internal variable names use `imageSize` not `stickerSize`, export functions produce "images" not "stickers"

### Decision: RGB Color Space Only (No CMYK)
- **Rationale**: Home printers use RGB. Professional printers handle CMYK conversion. Adding CMYK export adds complexity with no user benefit — the print shop converts RGB→CMYK as part of their standard workflow.

### Decision: Preview Mode Separate from Editing Mode
- **Editing mode**: Shows canvas with editing controls, drag-drop zones, section management
- **Preview mode**: Renders using same layout and font metrics as export (BR-2: ±1px tolerance)
- **Rationale**: Editing needs interactive affordances (borders, placeholders, buttons) that shouldn't appear in print output. Preview shows exactly what will be exported.

### Updated Component Architecture (2026-04-10)
```
shortcut-sticker/frontend/src/
├── constants/
│   └── designSystem.js          # NEW: Palettes, typography, symbols, sizes, spacing, helpers
├── pages/
│   └── CreateLayout.jsx         # UPDATED: Consumes design system, dynamic sizing/palette/typography
└── shell/
    └── AppShell.jsx             # Existing: Dark mode context, navigation
```

### Updated System Architecture (2026-04-10)
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
Design System (designSystem.js) ← NEW
    ↓
Sticker Design Tool (CreateLayout.jsx)
    ↓
Export (SVG/PNG @300DPI) ← PLANNED
    ↓
Print (Home inkjet/laser OR Professional die-cut) ← PLANNED
```

## [2026-04-10] Phase 1 Completion — Design System Integration

### Decision: Replace Hardcoded Values with Design System Constants
- **Problem**: CreateLayout.jsx had hardcoded sizes, colors, and spacing throughout
- **Solution**: All values now sourced from `designSystem.js` — palettes, typography, spacing, limits
- **Impact**: Changing a palette or text size propagates everywhere automatically
- **Key functions**: `getSpacing(imageSize)`, `getMaxShortcuts(imageSize, textSize)`, `getMaxSections(textSize)`, `formatShortcutKey(key, platform)`

### Decision: Key Formatting with " + " Separator
- **Problem**: Shortcuts displayed as `⌘K` or `Ctrl-K` — inconsistent and hard to read
- **Solution**: `formatShortcutKey()` normalizes all separators to ` + ` format
- **Result**: `⌘ + K`, `Ctrl + Shift + P`, `⌥ + ⌘ + ⎋`
- **Rationale**: Consistent spacing improves readability on printed stickers

### Decision: Always Filter Shortcuts by Selected App(s)
- **Problem**: "All Apps" tab showed every shortcut in the database, not just selected app's shortcuts
- **Solution**: `fetchShortcuts()` always applies `appsToFilter` — no unfiltered mode
- **Rationale**: Users selected an app for a reason; showing Docker shortcuts when designing a VS Code sticker is confusing

## [2026-04-10] Phase 2 — PNG Export at 300 DPI

### Decision: html2canvas for PNG Export
- **Library**: `html2canvas` — captures DOM elements as canvas, then exports as PNG
- **Scale factor**: `displayWidth / exportWidth` (e.g., 600px → 1125px = 1.875x scale)
- **Export dimensions**: 3.75" → 1125×1125px, 3" → 900×900px (both at 300 DPI)
- **Why html2canvas over canvas API**: Captures actual rendered DOM including fonts, colors, borders — no manual redrawing needed
- **Limitation**: Export quality depends on browser rendering; some CSS effects may not capture perfectly

### Decision: isExporting State with 100ms Delay
- **Problem**: Setting `isExporting = true` hides placeholders, but html2canvas captures before React re-renders
- **Solution**: `await new Promise(resolve => setTimeout(resolve, 100))` between state change and capture
- **Rationale**: React state updates are batched and async; DOM capture is synchronous. The delay ensures the DOM reflects the new state.

### Decision: `.no-export` Class for Hidden Elements
- **Problem**: Delete buttons and placeholder text appeared in exports
- **Solution**: Dual approach — `!isExporting` conditional rendering in JSX + `.no-export` class for html2canvas `ignoreElements`
- **Rationale**: Belt and suspenders. Conditional rendering handles React elements; class-based filtering handles any DOM elements html2canvas might still see.

## [2026-04-10] Phase 2 — SVG Export

### Decision: SVG Generation from Layout Data
- **Approach**: Generate SVG markup programmatically from layout state (not DOM capture)
- **Font embedding**: Uses Google Fonts `@import` in SVG `<style>` block
- **Dimensions**: Match PNG export (1125×1125 or 900×900) with proper viewBox
- **Scale factor**: Display-to-export ratio applied to all coordinates and sizes
- **Limitation**: SVG text rendering may differ slightly from browser rendering

## [2026-04-10] Phase 2 — Save/Load Layouts

### Decision: JSON File Format for Layout Persistence
- **Format**: JSON with version field (`"version": "1.0"`) for future compatibility
- **State captured**: layoutType, selectedApp(s), imageSize, textSize, colorPalette, layoutTitle, customSections, selectedShortcuts, selectedPlatforms
- **Validation**: `validateLayout()` checks required fields before restoring state
- **Filename**: `layout-{app}-{YYYY-MM-DD}.json`

### Decision: Dual Storage — File + localStorage
- **File save**: User-initiated, downloads JSON for permanent storage
- **localStorage**: Auto-saves on every manual save for crash recovery
- **Recovery**: `loadFromLocalStorage()` returns layout + timestamp for "Recover Last Session" prompt
- **Rationale**: File save is explicit and portable; localStorage is implicit and protective

## [2026-04-10] Phase 2 — Print Support

### Decision: CSS @media print for Home Printing
- **Approach**: Pure CSS solution — no JavaScript needed for print
- **Page size**: `@page { size: 4in 4in; margin: 0.125in; }` — matches sticker with bleed
- **Visibility**: `[data-print-canvas]` and children visible; everything else hidden
- **Color**: `-webkit-print-color-adjust: exact` forces color printing (browsers default to B&W)
- **Shadows**: Removed in print — `box-shadow: none !important`
- **Rationale**: CSS-only approach works across all browsers without JavaScript print APIs

## [2026-04-10] Phase 2 — Zoom Controls

### Decision: CSS Transform Scale for Canvas Zoom
- **Approach**: `transform: scale(${canvasZoom})` on wrapper div around canvas
- **Scope**: Only the sticker canvas zooms — sidebar and controls stay at normal size
- **Presets**: 50%, 75%, 100%, 150%, 200% buttons
- **Smooth zoom**: Ctrl/Cmd + scroll wheel with 0.1 increments
- **Touch zoom**: Two-finger pinch on trackpad with distance calculation
- **Limits**: Min 0.5 (50%), Max 2.0 (200%)
- **Transition**: `transition: transform 0.2s ease` for smooth animation
- **Export note**: Export always captures at 100% scale regardless of zoom level — zoom is display-only

## [2026-04-10] UI Redesign Decision — Deferred

### Decision: Finish Features Before UI Redesign (Path A)
- **Context**: User wanted Excalidraw-style canvas (full browser window, pinned sidebar, floating zoomable sticker)
- **Options**: (A) Finish features first, then redesign; (B) Redesign now, then add features
- **Chosen**: Path A — complete save/load, templates, and polish first
- **Rationale**: 
  1. Tool is close to complete MVP — save/load and templates are 1-2 sessions away
  2. Real usage data will inform UI decisions better than speculation
  3. Current zoom controls provide adequate zoom functionality
  4. UI redesign is 2-3 hours of refactoring with risk of breaking existing features
- **Plan**: Use tool for 1 week, note pain points, then decide on UI redesign scope
- **Documentation**: Full redesign plan in `CANVAS_REDESIGN_PROPOSAL.md`

### Updated Data Flow (2026-04-10)
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
Save Layout (JSON file + localStorage)
    ↓
Export (PNG @300DPI via html2canvas, SVG via programmatic generation)
    ↓
Print (Home inkjet/laser via CSS @media print, OR Professional die-cut)
```

## [2026-04-10] Search Architecture Simplification (Evening)

### Decision: JavaScript Filtering Over Prisma Complex Queries
- **Problem**: Backend search using Prisma `OR` with nested `app: { name: { contains: ... } }` caused 500 errors
- **Solution**: Fetch all shortcuts with app info, filter in JavaScript
- **Search fields**: App name, description, keys (all case-insensitive `includes()`)
- **Rationale**: More reliable, easier to debug, handles all edge cases without Prisma query complexity
- **Tradeoff**: Fetches all data on each search (acceptable for current dataset size of ~700 shortcuts)

### Decision: Skip Platform Filter During Search
- **Problem**: Vim shortcuts have platform "both" which didn't match ["mac", "windows"] filter
- **Solution**: Platform filter only applies when NOT searching; search shows all results
- **Rationale**: When searching, users want to find everything matching their query regardless of platform
- **Behavior**: No search → filter by selected app(s) + platform(s); With search → show all matching results

## [2026-04-10] PNG Export Dimension Fix

### Decision: Use Design System Constants Instead of DOM Measurement
- **Problem**: `canvasElement.offsetWidth` returned 666px (affected by CSS zoom transform) instead of 600px
- **Solution**: Hardcoded display dimensions in export function matching design system constants
- **Export dimensions**: `{ '3.75': { width: 1125, height: 1125, displayWidth: 600, displayHeight: 600 }, '3': { width: 900, height: 900, displayWidth: 480, displayHeight: 480 } }`
- **Scale factor**: Always 1.875x (correct) instead of variable based on zoom level
- **Rationale**: Export should produce identical output regardless of user's current zoom level

## [2026-04-10] Print Legibility — Font Size Strategy

### Decision: Increase All Font Sizes 60-80% for Print
- **Problem**: Original font sizes (8-16px on 600px display) were illegible when printed at 3.75"
- **Root cause**: Sizes were designed for screen viewing, not physical printing
- **New sizes**:
  | Text Size | Header | Key | Description |
  |-----------|--------|-----|-------------|
  | Small | 18px (was 11) | 15px (was 9) | 13px (was 8) |
  | Medium | 22px (was 13) | 18px (was 11) | 16px (was 10) |
  | Large | 26px (was 16) | 22px (was 14) | 19px (was 12) |
- **Status**: Needs fine-tuning against real printed examples from `Sticker Layouts/` folder

### Decision: Fixed Canvas Height (Not Min-Height)
- **Problem**: `minHeight` allowed sections to overflow the sticker border when text was large
- **Solution**: Changed to strict `height: 600px` (3.75") or `height: 480px` (3")
- **Rationale**: A physical sticker has a fixed size. The digital canvas must enforce the same constraint.
- **Consequence**: Content that doesn't fit is clipped — forces users to reduce shortcuts or use smaller text

## [2026-04-10] Strict Section/Shortcut Limits

### Decision: Enforce Per-Text-Size Limits for Guaranteed Legibility
- **Problem**: Users could create layouts with too many shortcuts that would be illegible when printed
- **Philosophy**: "Don't leave it to users — that's how you get unsatisfied customers"
- **Solution**: Strict limits enforced by the system:
  | Text Size | Max Sections | Max Per Section | Max Total |
  |-----------|-------------|-----------------|-----------|
  | Small | 6 | 12 | 72 |
  | Medium | 4 | 10 | 40 |
  | Large | 4 | 7 | 28 |
- **Enforcement**: `getMaxShortcutsPerSection(textSize)` and `getMaxSections(textSize)` used throughout
- **Auto-trim**: Switching to a text size with fewer max sections automatically removes excess sections
- **Status**: Numbers need fine-tuning against real printed examples

### Decision: Color-Coded Capacity Indicator
- **Implementation**: Visual indicator showing used/max shortcuts with color feedback
- **Green** (0-70%): Plenty of space
- **Yellow** (70-90%): Getting full ⚡
- **Red** (90-100%): Almost at limit ⚠️
- **Rationale**: Immediate visual feedback prevents users from overcrowding layouts

## [2026-04-10] Save/Load Strategy — Hybrid Approach

### Decision: File-Based Save + Browser Storage (Both)
- **Save button**: Downloads JSON file AND saves to localStorage
- **Load button**: Upload JSON file to restore layout
- **Auto-save**: localStorage backup on every manual save
- **Future**: Registered users get cloud storage; file-based remains for anonymous users
- **Business model**: Free (file save) → Pro (cloud storage) → Print Service (professional printing)

### Updated Data Flow
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
Express API (localhost:3001) — simplified JavaScript search filtering
    ↓
React Frontend (localhost:5173)
    ↓
Design System (designSystem.js) — print-optimized font sizes, strict limits
    ↓
Sticker Design Tool (CreateLayout.jsx) — fixed-size canvas, capacity enforcement
    ↓
Save Layout (JSON file download + localStorage)
    ↓
Export (PNG @300DPI via html2canvas — uses design system dimensions, not DOM)
    ↓
Print (Home inkjet/laser at actual size — guaranteed legible text)
```

## [2026-04-10] Phase 3: Authentication & Layout Management

### Decision: JWT Authentication with bcryptjs
- **Stack**: bcryptjs (10 rounds) + jsonwebtoken (7-day expiry)
- **Token storage**: localStorage on client, `Authorization: Bearer <token>` header
- **Middleware**: `authenticateToken()` verifies JWT on all protected routes
- **Security**: Password required for account deletion, current password required for password change
- **Rationale**: Simple, stateless auth suitable for MVP. Can add refresh tokens, token blacklisting later.

### Decision: JSON Blob Layout Storage (Not Normalized)
- **Problem**: Layout model expected simple position-based system, but app evolved to flexible sections with names, text sizes, palettes
- **Option A (chosen)**: Store entire layout as JSON string in single `data` column
- **Option B (deferred)**: Normalized schema with Layout → Section → SectionShortcut tables
- **Rationale**: JSON matches existing file-based save/load, flexible as layout structure evolves, faster to implement
- **Trade-off**: Can't query by specific layout fields (e.g., "find all layouts using VSCode palette")
- **Migration path**: Can normalize later when analytics/querying needs arise

### Decision: 10 Layout Limit Per User
- **Enforcement**: Backend API checks `prisma.layout.count()` before creating new layout
- **Error**: Returns 400 with "Maximum 10 layouts allowed. Please delete an old layout first."
- **Display**: UserHome shows "Saved Layouts (X/10)" with "Limit reached" warning at 10
- **Rationale**: Prevents abuse, keeps storage manageable, generous enough for most users
- **Future**: Can increase limit for premium tier

### Decision: CASCADE Delete on User Relationships
- **Schema**: `onDelete: Cascade` on Layout → User and Shortcut → App relations
- **Behavior**: Deleting a user automatically deletes all their layouts
- **Rationale**: Clean data, no orphaned records, simpler account deletion logic

### Decision: Dual Save Strategy (Guest vs Authenticated)
- **Guest users**: Save to localStorage (temporary) + download as JSON file
- **Authenticated users**: Save to account (persistent, up to 10 layouts)
- **Both**: Can export as PNG (print-ready), SVG (vector), JSON (source file)
- **Warning**: Guests see "Sign in to save permanently. Browser storage is temporary."
- **Terminology**: "Save your layouts" not "cloud storage" — simpler, more honest language
- **Rationale**: Don't block functionality for guests, but encourage sign-up for persistence

### Decision: SaveModal Component (Unified Save/Export)
- **Single component**: Adapts UI based on `isAuthenticated` state
- **Logged-in flow**: Layout name input → "Save to My Layouts" button
- **Guest flow**: Warning banner → "Save to Browser" button → Sign In/Create Account links
- **Export section**: Always visible — JSON, PNG, SVG options for all users
- **Integration**: Replaces old `handleSaveLayout()` which directly downloaded JSON + saved to localStorage

### Decision: Defer AI Layout Features to Phase 4
- **Discussed**: AI auto-arrange, capacity prediction, conversational layout assistant
- **Deferred because**:
  1. Core product not yet validated with real users
  2. No print testing done yet
  3. AI API costs need revenue to justify
  4. Adds complexity before basics are proven
- **Strategy**: Commit Phase 2, branch for AI exploration, focus Phase 3 on auth/save
- **Revisit when**: Real users creating stickers, revenue stream established, data on what users struggle with

### Decision: Section Text Wrapping (Not Truncation)
- **Problem**: Description text was truncated with ellipsis, cutting off important information
- **Solution**: Removed `whiteSpace: 'nowrap'`, `textOverflow: 'ellipsis'`, `substring()` truncation
- **Added**: `wordBreak: 'break-word'`, `hyphens: 'auto'` for long words
- **Alignment**: Changed from `center` to `flex-start` so key and description align at top when text wraps
- **Container**: Added `overflow: 'hidden'` and `minHeight: 0` to prevent section overflow past sticker border

### Updated Data Flow (Phase 3)
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
  ├── /api/shortcuts — search and browse
  ├── /api/auth — register, login, profile, password, delete account
  └── /api/layouts — CRUD with 10-limit, JWT protected
    ↓
React Frontend (localhost:5173)
  ├── AuthContext — global auth state
  ├── SaveModal — adaptive save/export (guest vs authenticated)
  ├── UserHome — profile, layouts (X/10), security, danger zone
  └── CreateLayout — design tool with strict limits
    ↓
Export (PNG @300DPI, SVG, JSON)
    ↓
Print (Home inkjet/laser at actual size)
```

### Files Created/Modified (Phase 3)
```
Backend:
  prisma/schema.prisma          — Updated Layout model (JSON storage, CASCADE)
  src/routes/auth.js            — Authentication + profile + password + delete account
  src/routes/layouts.js         — Layouts CRUD with 10-limit
  src/server.js                 — Updated auth route import

Frontend:
  src/contexts/AuthContext.jsx   — Global auth state (register, login, logout, updateProfile, changePassword, deleteAccount)
  src/components/AuthModal.jsx   — Login/register modal (available but not primary)
  src/components/SaveModal.jsx   — Unified save/export modal (guest vs authenticated flows)
  src/pages/SignIn.jsx           — Connected to auth API
  src/pages/SignUp.jsx           — Connected to auth API
  src/pages/UserHome.jsx         — 4-tab account management (Profile, Layouts, Security, Danger Zone)
  src/pages/CreateLayout.jsx     — SaveModal integration, auth context, save functions
  src/main.jsx                   — AuthProvider wrapper, UserHome route
```
