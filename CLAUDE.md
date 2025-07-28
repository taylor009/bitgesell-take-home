# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Node.js/React assessment project designed to test refactoring, optimization, and testing skills. The codebase contains intentional issues that need to be fixed.

## Architecture

### Backend (Express.js)
- **Entry point**: `backend/src/index.js` - Express server running on port 3001
- **Routes**:
  - `/api/items` - Items CRUD operations (backend/src/routes/items.js:14-66)
  - `/api/stats` - Statistics endpoint (backend/src/routes/stats.js:8-21)
- **Data storage**: JSON file at `data/items.json`
- **Key issues**:
  - Blocking I/O with `fs.readFileSync` in items.js
  - Stats endpoint recalculates on every request without caching
  - Missing validation and tests

### Frontend (React)
- **Entry point**: `frontend/src/index.js`
- **Main components**:
  - `App.js` - Router setup
  - `Items.js` - List view with potential memory leak
  - `ItemDetail.js` - Detail view
  - `DataContext.js` - State management
- **Proxy**: Frontend proxies `/api` requests to backend on port 3001
- **Key issues**:
  - Memory leak in Items.js fetch
  - Missing pagination and search implementation
  - No virtualization for large lists

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm start           # Start server (production)
npm run dev         # Start with nodemon (development)
npm test            # Run Jest tests
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start           # Start React dev server on port 3000
npm test            # Run React tests
npm run build       # Build for production
```

## Testing Guidelines

- Backend uses Jest with Supertest for API testing
- Frontend uses React Testing Library
- Test files should be placed next to the files they test with `.test.js` extension
- Focus on both happy path and error cases

## Key Refactoring Tasks

1. **Backend blocking I/O**: Replace `fs.readFileSync` with async alternatives in items.js
2. **Stats caching**: Implement caching strategy for `/api/stats` endpoint
3. **Memory leak**: Fix component unmount issue in frontend Items.js
4. **Pagination**: Implement server-side pagination with search query support
5. **Virtualization**: Add react-window or similar for large list performance

## Important Notes

- The backend data path assumes the project structure with data folder at root level
- CORS is configured to allow requests from localhost:3000
- Both frontend and backend have separate package.json files requiring separate npm installs