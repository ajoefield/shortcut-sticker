# Database & API Reference Rule

When working with frontend-backend connections, always check these files first:

## Database Schema
- **Location:** `shortcut-sticker/backend/prisma/schema.prisma`
- **Contains:** All table structures, relationships, field types

## API Endpoints
- **Location:** `shortcut-sticker/backend/src/routes/`
- **Files to check:**
  - `shortcuts.js` - shortcut data, apps list
  - `layouts.js` - layout CRUD operations  
  - `auth.js` - user authentication
- **Server config:** `shortcut-sticker/backend/src/server.js`

## Frontend API Calls
- **Base URL:** `http://localhost:3001/api/`
- **Pattern:** Always check existing routes before creating new endpoints

## Key Tables
- `apps` - application list (VS Code, Figma, etc.)
- `shortcuts` - keyboard shortcuts with app relations
- `layouts` - user-created sticker layouts
- `users` - user accounts

## Quick Reference
- Apps: `GET /api/shortcuts/apps`
- Shortcuts: `GET /api/shortcuts?app={appName}&search={term}`
- Layouts: `GET/POST /api/layouts`

Always verify endpoint exists in routes before frontend implementation.