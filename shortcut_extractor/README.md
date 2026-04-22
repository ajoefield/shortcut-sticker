# Shortcut Extractor

A simple, reliable AI-powered tool for extracting keyboard shortcuts from PDF files and converting them to standardized CSV format. **Designed for the Keyboard Shortcut Sticker App** - intelligently manages a library of shortcuts with automatic update detection.

## Features

- **🤖 Simple AI-only approach** - Uses AWS Bedrock Claude for reliable extraction
- **🖼️ PNG image support** - Extract shortcuts from screenshots using Claude Vision
- **✨ Beautiful Mac symbols** - Converts shortcuts to ⌘⌥⇧⌃ symbols for macOS
- **📝 Consistent Windows format** - Uses Ctrl+Shift+P format for Windows
- **🔄 Smart update detection** - Only processes changed or new files (PDF/PNG)
- **📚 Library management** - Tracks software versions and changes
- **☁️ AWS-ready** - Designed for serverless deployment
- **🎯 Sticker app integration** - Generates searchable library index
- **📊 High accuracy** - 689+ shortcuts extracted with 100% success rate

## Quick Start

### Local Usage
1. **Setup AWS credentials:**
   ```bash
   aws sso login --profile 'developer playground'
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Smart extraction (only processes changed PDFs):**
   ```bash
   python run_extraction.py
   ```

4. **Test with single PDF:**
   ```bash
   python test_extractor.py
   ```

### Library Management
```bash
# Check library status
python library_manager.py

# Force extraction of specific software
python -c "
from simple_extraction_engine import SimpleExtractionEngine
engine = SimpleExtractionEngine(aws_profile='developer playground')
# This will intelligently skip unchanged PDFs
engine.extract_and_export(Path('../source_keyboard_shortcuts'), Path('../output'))
"
```

## File Structure

```
shortcut_extractor/
├── simple_extraction_engine.py  # 🎯 Main entry point with smart extraction
├── simple_ai_parser.py          # 🤖 AI extraction engine  
├── document_classifier.py       # 📄 PDF classification
├── key_standardizer.py          # ✨ Key formatting (⌘ symbols)
├── extraction_engine.py         # 📊 Data structures
├── library_manager.py           # 📚 Smart library management
├── aws_lambda_handler.py        # ☁️ AWS Lambda deployment
├── run_extraction.py            # 🚀 Simple runner script
├── test_extractor.py            # 🧪 Test script
├── requirements.txt             # 📦 Dependencies
├── README.md                    # 📖 This file
├── AWS_SETUP.md                # ☁️ AWS configuration guide
├── aws_deployment.md           # 🚀 AWS deployment guide
└── FILE_NAMING_CONVENTION.md   # 📝 PDF naming standards
```

## Input

- **PDF files** in `source_keyboard_shortcuts/` directory
- **PNG images** in `source_keyboard_shortcuts/` directory (screenshots of shortcuts)
- **Naming convention:** `{Software}_{Platform}_shortcuts.pdf` or `{Software}_{Platform}_screenshot.png`
- **Examples:** 
  - `VSCode_macOS_shortcuts.pdf`
  - `Sublime_macOS_shortcuts.pdf`
  - `VSCode_Windows_screenshot.png`
  - `Figma_macOS_shortcuts_v2024.png`

## Output

- **Versioned CSV files** in `output/csv_exports/`
- **Latest copies** in `output/csv_exports/latest/`
- **Mac shortcuts** with beautiful symbols: `⌘ + X`, `⇧ + ⌘ + Z`
- **Windows shortcuts** with consistent format: `Ctrl+Shift+P`

## Example Results

| Software | Platform | Key Combination | Title | Description |
|----------|----------|----------------|-------|-------------|
| macOS | macOS | ⌘ + X | Cut | Cut selected item |
| Sublime Text | macOS | ⌘ + ⇧ + P | Command Palette | Open command palette |
| VS Code | Windows | Ctrl+Shift+P | Command Palette | Show command palette |

## Smart Library Management

The system intelligently tracks software versions and only processes PDFs that have changed:

### Automatic Detection
- **New applications** - Automatically detected and processed
- **Version updates** - Detects version changes in filenames (e.g., `VSCode_v1.85_macOS_shortcuts.pdf`)
- **File changes** - Uses SHA256 hashing to detect PDF modifications
- **Metadata tracking** - Maintains extraction history and statistics

### Library Index for Sticker App
Generates `library_index.json` with:
```json
{
  "applications": {
    "vscode_macos": {
      "name": "VS Code",
      "platform": "macOS", 
      "shortcut_count": 85,
      "version_info": {...}
    }
  },
  "shortcuts": [...],  // All shortcuts with application references
  "categories": [...], // Available categories
  "platforms": [...]   // Available platforms
}
```

### AWS Integration
- **S3 triggers** - Automatic processing when PDFs uploaded
- **Scheduled scans** - Daily checks for updates
- **API endpoints** - REST API for sticker app integration
- **Cost optimization** - Only processes what's needed

## Sticker App Integration

This extractor is designed as the backend for a **Keyboard Shortcut Sticker Application** that:

1. **Maintains shortcut library** - Automatically updated from PDFs
2. **Provides search API** - Find shortcuts by application, platform, or keyword  
3. **Supports sticker design** - Users select shortcuts for custom stickers
4. **Ensures readability** - Optimized formatting for physical/digital stickers
5. **Handles updates** - Seamlessly incorporates new application versions