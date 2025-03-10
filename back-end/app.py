from fastapi import FastAPI
import requests
import httpx
import asyncio
import math
import redis
import json

# def query_constellation():
#     url = 'https://a.windbornesystems.com/treasure/00.json'
#     response = requests.get(url)
#     if response.status_code == 200:
#         # Parse the JSON data
#         data = response.json()
#         print(data)
#     else:
#         print(f"Corrupted data: {response.status_code}")

app = FastAPI()

constellation_url = 'https://a.windbornesystems.com/treasure/'
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
CACHE_KEY = "cached_data"
CACHE_EXPIRY = 3600

def sanitize_json(data):
    """Replace NaN, Infinity, and -Infinity with None (or a string)."""
    if isinstance(data, float) and (math.isnan(data) or math.isinf(data)):
        return "NaN"  # Change to "NaN" if you prefer a string instead of None
    elif isinstance(data, dict):
        return {k: sanitize_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json(item) for item in data]
    return data

async def query_hour(client, hour_num):
    try:
        url = constellation_url + str(hour_num).zfill(2) + '.json'
        print("querying", url)
        response = await client.get(url)
        response.raise_for_status()

        # try:
        raw_json = response.json()
        sanitized = sanitize_json(raw_json)
        return {hour_num: sanitized}
        # except ValueError:
        #     return {hour_num: f"Error: Invalid JSON response (status {response.status_code})"}
    except httpx.HTTPStatusError as e:
        return {hour_num: f"Error {e.response.status_code}: {str(e)}"}
    except json.JSONDecodeError:
        return {hour_num: "Invalid JSON Response"}
    except Exception as e:
        return {hour_num: f"Unexpected error: {str(e)}"}

async def query_constellation():
    async with httpx.AsyncClient() as client:
        tasks = [query_hour(client, hour) for hour in range(24)]
        results = await asyncio.gather(*tasks)
    merged_results = {k: v for d in results for k, v in d.items()}

    # merged_results = {}
    # for hour in range(24):
    #     current_hour_list = []
    #     for point in merged_results[str(hour)]:

    redis_client.set(CACHE_KEY, json.dumps(merged_results), ex=CACHE_EXPIRY)
    return merged_results

async def background_scheduler():
    """Continuously fetch and cache data every hour."""
    await asyncio.sleep(5)
    while True:
        await query_constellation()
        await asyncio.sleep(CACHE_EXPIRY)  # Wait for an hour

@app.get("/")
def read_root():
    return {"message": "Backend is working!"}

@app.on_event("startup")
async def start_background_task():
    asyncio.create_task(background_scheduler())

@app.get("/data")
async def get_data():
    """Return cached data if available, otherwise fetch and cache asynchronously."""
    cached_data = redis_client.get(CACHE_KEY)

    if cached_data:
        return json.loads(cached_data)

    # Fetch data if cache is empty
    return await query_constellation()
