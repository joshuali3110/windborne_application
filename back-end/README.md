# Testing the Backend Locally

## Activate Virtual Environment

```bash
source venv/bin/activate
```

## Open Docker Desktop

## Start Redis

```bash
docker run --name redis -p 6379:6379 -d redis
```

### If Restarting Redi

```bash
docker start redis
```

### (optional) Test that Redis is running

```bash
docker exec -it redis redis-cli
ping
exit
```

## Start FastAPI with Uvicorn

```bash
uvicorn app:app --reload
```

## Testing

Server starts at http://127.0.0.1:8000, http://127.0.0.1:8000/data for queried data

```bash
curl http://127.0.0.1:8000/
curl http://127.0.0.1:8000/data
```

## Termination

FastAPI: `Ctrl + C`
Redis: `docker stop redis`
To remove Redis container after stopped: `docker rm redis`
