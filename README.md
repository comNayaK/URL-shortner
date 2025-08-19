
# URL Shortener (Node.js + MongoDB + Redis)

A clean, production-style URL shortener like Bitly, built with **Express**, **MongoDB** (persistent store), and **Redis** (cache + analytics).  
It supports:
- Shortening long URLs via a REST endpoint
- Redirecting short codes to original URLs
- Tracking click counts (analytics) with Redis and periodic persistence to MongoDB
- Docker Compose setup for one-command local run

## Features

- **POST `/api/shorten`** → Create a short URL from a `longUrl`  
- **GET `/:code`** → Redirect to the original URL and increment click counter  
- **GET `/api/stats/:code`** → Fetch analytics for a shortened link

## Tech Stack

- Node.js, Express
- MongoDB (Mongoose)
- Redis (ioredis)
- nanoid
- Helmet, CORS, Morgan

## Quick Start (Docker)

```bash
# 1) Copy env template (optional, defaults work with docker-compose)
cp .env.example .env

# 2) Build and run
docker compose up --build
```

The API will be available at **http://localhost:8080**.

### Example Requests

**Shorten a URL**
```bash
curl -X POST http://localhost:8080/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl": "https://www.example.com/a/very/long/url"}'
```

Response:
```json
{
  "_id": "665e...",
  "code": "Ab12xYz",
  "longUrl": "https://www.example.com/a/very/long/url",
  "shortUrl": "http://localhost:8080/Ab12xYz",
  "clicks": 0,
  "createdAt": "2025-08-19T12:34:56.789Z",
  "updatedAt": "2025-08-19T12:34:56.789Z",
  "__v": 0
}
```

**Redirect**
```bash
open http://localhost:8080/Ab12xYz
```

**Stats**
```bash
curl http://localhost:8080/api/stats/Ab12xYz
```

## Local Development (without Docker)

Make sure MongoDB and Redis are running locally.

```bash
# 1) Install deps
npm install

# 2) Copy env file and edit if needed
cp .env.example .env
# - set MONGO_URI=mongodb://localhost:27017/url_shortener
# - set REDIS_URL=redis://localhost:6379

# 3) Start dev server (with auto-reload)
npm run dev
```

## Project Structure

```
.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── .env.example
├── .gitignore
├── src
│   ├── config.js
│   ├── server.js
│   ├── models
│   │   └── Url.js
│   └── routes
│       └── index.js
└── README.md
```

## Notes

- Clicks are tracked in Redis and periodically persisted back to MongoDB every 10 clicks. You can adjust this strategy.
- For production, consider:
  - Authentication (e.g., API key/JWT)
  - Custom domains for short links
  - Rate limiting
  - Background workers for analytics
  - Proper logging and monitoring
