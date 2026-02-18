# Flick Deck Backend

Express + MongoDB backend for Flick Deck.

## What It Handles
- Auth (signup/login with JWT)
- User profile updates (name, username, password)
- Watchlist and logged movies
- Ratings/reviews CRUD
- Recommendation endpoint
- TMDB proxy endpoints

## Requirements
- Node.js 18+
- MongoDB
- TMDB API key

## Setup
```bash
cd backend
npm install
cp .env.example .env
```

Set env values in `backend/.env`:
```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/flickdeck
SECRET_KEY=replace-with-a-strong-secret
TMDB_API_KEY=your_tmdb_api_key
```

## Run
```bash
npm run dev
# or
npm start
```

Backend runs at `http://localhost:8000` by default.

## Core Routes
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/movies/proxy/tmdb/*`
- `POST /api/user/add-to-watchlist` (auth)
- `POST /api/user/remove-from-watchlist` (auth)
- `GET /api/user/get-logged` (auth)
- `GET /api/user/get-watchlist` (auth)
- `POST /api/user/recommended-movies` (auth)
- `PUT /api/user/profile` (auth)
- `POST /api/ratings/add-rating` (auth)
- `PUT /api/ratings/edit-rating` (auth)
- `DELETE /api/ratings/delete-rating` (auth)
- `GET /api/ratings/get-ratings/:movieId`

## Notes
- Most user/rating routes require `Authorization: Bearer <token>`.
- If DB is unavailable, DB-backed endpoints return service errors until reconnect.
