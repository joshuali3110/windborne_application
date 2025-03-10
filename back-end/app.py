from fastapi import FastAPI
import requests
import httpx
import asyncio
import math
import redis
import json
from datetime import datetime
import pytz
from fastapi.middleware.cors import CORSMiddleware
import os

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows React frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

constellation_url = 'https://a.windbornesystems.com/treasure/'
open_meteo_url = 'https://api.open-meteo.com/v1/forecast'
redis_url = os.getenv("REDIS_URL")
redis_client = redis.Redis.from_url(redis_url, decode_responses=True, ssl=True)
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

        latitudes = "?latitude="
        longitudes = "&longitude="
        full_hour_data = []
        num_locs_in_req = 0
        wind_data = []
        num_balloons = 15
        for i in range(num_balloons):#len(sanitized)):
            if isinstance(sanitized[i][0], str):
                continue
            
            latitudes += str(sanitized[i][0])
            longitudes += str(sanitized[i][1])
            full_hour_data.append({"lat" : sanitized[i][0], "lon" : sanitized[i][1], "altitude" : sanitized[i][2]})
            num_locs_in_req += 1

            if num_locs_in_req == 200 or i == num_balloons - 1:#len(sanitized) - 1:
                print("querying", num_locs_in_req)
                url = open_meteo_url + latitudes + longitudes + '&hourly=wind_speed_180m,wind_direction_180m&timezone=America%2FLos_Angeles&past_days=1&forecast_days=1'
                wind_data_200 = await client.get(url)
                wind_data_200.raise_for_status()
                wind_data_200 = wind_data_200.json()

                wind_data = wind_data + wind_data_200
                latitudes = "?latitude="
                longitudes = "&longitude="
                num_locs_in_req = 0
            else:
                latitudes += ","
                longitudes += ","
        
        la_tz = pytz.timezone("America/Los_Angeles")
        current_la_hour = datetime.now(la_tz).hour
        hour_index = current_la_hour + 24 - hour_num

        for i in range(len(full_hour_data)):
            current_loc_data = wind_data[i]
            full_hour_data[i]["wind_speed"] = current_loc_data["hourly"]["wind_speed_180m"][hour_index]
            full_hour_data[i]["wind_direction"] = current_loc_data["hourly"]["wind_direction_180m"][hour_index]

        return {hour_num: full_hour_data}
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
