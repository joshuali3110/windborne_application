# Backend

FastAPI service that queries the WindBorne balloon constellation, enriches it with wind data from Open-Meteo, and caches the merged result in Redis.

## Setup

### 1. Create a virtual environment and install dependencies

```bash
cd back-end
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment variables

Create a `.env` file in `back-end/` (gitignored) with:

```
REDIS_URL=redis://localhost:6379
```

`app.py` loads this automatically via `python-dotenv` — no need to `export` or `source` it manually. In production (Render), `REDIS_URL` is set as a real environment variable, so `.env` is only needed locally.

### 3. Start Redis

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

```bash
docker run --name redis -p 6379:6379 -d redis
```

If the container already exists and just needs restarting:

```bash
docker start redis
```

Optional: verify Redis is reachable:

```bash
docker exec -it redis redis-cli ping
```

### 4. Start FastAPI with Uvicorn

```bash
source venv/bin/activate
uvicorn app:app --reload
```

## Testing

Server runs at `http://127.0.0.1:8000`.

```bash
curl http://127.0.0.1:8000/        # health check
curl http://127.0.0.1:8000/data    # queried/cached balloon + wind data
```

## Termination

```bash
# FastAPI: Ctrl + C

# Redis
docker stop redis        # stop, keep container for later
docker rm redis           # remove container entirely (after stopping)
```
