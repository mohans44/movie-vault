# Flick Deck Frontend

React + Vite frontend for Flick Deck.

## Features
- Home carousels (trending, latest, regional, recommendations)
- Movie details, cast/crew, reviews, where-to-watch
- Person details and filmography
- Auth, profile edit, watchlist, watched movies
- Mobile-first responsive UI

## Requirements
- Node.js 18+
- Running backend API (default `http://localhost:8000`)

## Setup
```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:
```env
VITE_BASE_URL=http://localhost:8000
```

## Run
```bash
npm run dev
```

App runs at `http://localhost:5173`.

## Build & Quality
```bash
npm run lint
npm run build
```

## Deploy
- Build frontend with `npm run build` and deploy `frontend/dist`.
- Set `VITE_BASE_URL` to your deployed backend URL.
- Ensure backend CORS allows your frontend origin.
