from fastapi import FastAPI
import requests
import httpx
import asyncio
import math

# def query_constellation():
#     url = 'https://a.windbornesystems.com/treasure/00.json'
#     response = requests.get(url)
#     if response.status_code == 200:
#         # Parse the JSON data
#         data = response.json()
#         print(data)
#     else:
#         print(f"Corrupted data: {response.status_code}")

constellation_url = 'https://a.windbornesystems.com/treasure/'

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Backend is working!"}

def sanitize_json(data):
    """Replace NaN, Infinity, and -Infinity with None (or a string)."""
    if isinstance(data, float) and (math.isnan(data) or math.isinf(data)):
        return "None"  # Change to "NaN" if you prefer a string instead of None
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

        try:
            raw_json = response.json()
            sanitized = sanitize_json(raw_json)
            return {hour_num: sanitized}
        except ValueError:
            return {hour_num: f"Error: Invalid JSON response (status {response.status_code})"}
    except httpx.HTTPStatusError as e:
        return {hour_num: f"Error {e.response.status_code}: {str(e)}"}
    except Exception as e:
        return {hour_num: f"Unexpected error: {str(e)}"}

@app.get("/query-constellation")
async def query_constellation():
    async with httpx.AsyncClient() as client:
        tasks = [query_hour(client, hour) for hour in range(24)]
        results = await asyncio.gather(*tasks)
    # hour_1 = results.get("1", [])
    # print(len(hour_1))
    merged_results = {k: v for d in results for k, v in d.items()}
    print(len(merged_results[1]))
    return merged_results
