# Database Loading for Shortcut Sticker

This document explains how to load extracted keyboard shortcuts from the extraction pipeline into the PostgreSQL database.

## Overview

The `database_loader.js` script reads CSV files from the extraction pipeline and loads them into the PostgreSQL database using Prisma. It handles:

- Creating/updating applications with proper categories and colors
- Loading shortcuts with platform-specific mappings
- Preventing duplicate entries
- Providing detailed loading statistics

## Setup

### 1. Install Dependencies

```bash
cd shortcut-sticker/backend
npm install
```

This will install the new `csv-parser` dependency along with existing dependencies.

### 2. Environment Variables

Make sure your `.env` file contains the DATABASE_URL:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/shortcut_sticker"
```

### 3. Database Schema

Ensure your database is set up with the latest Prisma schema:

```bash
npx prisma migrate dev
```

## Usage

### Load Shortcuts from CSV Files

```bash
npm run load-shortcuts
```

This will:
- Read all `*_shortcuts_latest.csv` files from `../../output/csv_exports/latest/`
- Create/update applications in the database
- Load shortcuts with proper platform mapping
- Skip duplicates
- Show detailed statistics

### Clear All Shortcuts

```bash
npm run clear-shortcuts
```

Removes all shortcuts and apps from the database (useful for testing).

### Reload (Clear + Load)

```bash
npm run reload-shortcuts
```

Clears the database and loads fresh data from CSV files.

### Verify Database Contents

```bash
npm run verify-shortcuts
```

Shows current database statistics and breakdown by application.

## CSV File Format

The loader expects CSV files with this format:

```csv
application_name,platform,key_combination,title,description,category,confidence_score,extraction_method
VS Code,Windows,Ctrl+Shift+P,Command Palette,Open command palette,General,100,simple_ai_claude
```

### Required Fields
- `application_name`: Name of the application
- `platform`: Platform (windows/macos/osa/unknown)
- `key_combination`: The keyboard shortcut
- `title`: Short description of the action
- `description`: Longer description (optional, defaults to title)

### Platform Mapping
- `windows` → `windows`
- `macos` → `mac`
- `osa` → `both`
- `unknown` → `both`

## Application Configuration

The loader includes predefined configurations for common applications:

```javascript
const appConfigs = {
  'vs_code': { 
    name: 'VS Code', 
    category: 'Development', 
    description: 'Visual Studio Code - Code Editor', 
    iconColor: '#007ACC' 
  },
  // ... more apps
};
```

For unknown applications, it will:
- Convert `app_key` to "App Key" format
- Set category to "Other"
- Use default gray color

## File Naming Convention

CSV files should follow this pattern:
```
{app_name}_{platform}_shortcuts_latest.csv
```

Examples:
- `vs_code_windows_shortcuts_latest.csv`
- `vim_osa_shortcuts_latest.csv`
- `docker_macos_shortcuts_latest.csv`

## Integration with Extraction Pipeline

The database loader is designed to work with the extraction pipeline:

1. **Extract shortcuts**: Run the extraction pipeline to generate CSV files
2. **Load database**: Use `npm run load-shortcuts` to load into PostgreSQL
3. **Verify**: Use `npm run verify-shortcuts` to check results

## Error Handling

The loader handles common issues:
- Missing CSV files (shows warning)
- Malformed CSV data (skips invalid rows)
- Duplicate shortcuts (skips with counter)
- Database connection issues (shows clear error)

## Statistics

After loading, you'll see statistics like:

```
📊 DATABASE LOADING SUMMARY
==================================================
📱 Apps created/updated: 4
✅ Shortcuts created: 156
⏭️  Shortcuts skipped (duplicates): 12
❌ Errors: 0
🎯 Success rate: 100.0%
```

## Troubleshooting

### "No CSV files found"
- Make sure you've run the extraction pipeline first
- Check that files exist in `output/csv_exports/latest/`
- Verify file naming follows the expected pattern

### "Database connection failed"
- Check your DATABASE_URL environment variable
- Ensure PostgreSQL is running
- Verify database exists and is accessible

### "Prisma client not found"
- Run `npm install` to install dependencies
- Run `npx prisma generate` to generate the client

## Development

To test the database loader with sample data:

```bash
# Generate sample CSV files (from project root)
python3 generate_sample_data.py

# Load sample data
cd shortcut-sticker/backend
npm run load-shortcuts
```