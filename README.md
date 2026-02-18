# Flick Deck

Flick Deck is a full-stack movie discovery and tracking app.

## Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + MongoDB + JWT auth
- Data: TMDB proxy + user-specific watchlist/log/reviews

## Prerequisites
- Node.js 18+
- MongoDB running locally or remotely
- TMDB API key

## Backend
```bash
cd backend
npm install
cp .env.example .env   # create if missing; see values below
npm run dev            # or npm start
```

Required backend env values (`backend/.env`):
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/flickdeck
SECRET_KEY=replace-with-a-strong-secret
TMDB_API_KEY=your_tmdb_api_key
```

## Frontend
```bash
cd frontend
npm install
cp .env.example .env   # optional; defaults to localhost backend
npm run dev
```

Frontend env (`frontend/.env`):
```env
VITE_BASE_URL=http://localhost:8000
```

## Production Build
```bash
cd frontend
npm run build
```

## Deploy Notes
- Set the same `VITE_BASE_URL` to your deployed backend URL.
- Set backend env vars (`MONGO_URI`, `SECRET_KEY`, `TMDB_API_KEY`) in your host.
- Ensure CORS origin allows your frontend domain.
