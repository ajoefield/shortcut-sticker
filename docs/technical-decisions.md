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