from fastapi import FastAPI
import requests

def query_constellation():
    url = 'https://a.windbornesystems.com/treasure/00.json'
    response = requests.get(url)
    if response.status_code == 200:
        # Parse the JSON data
        data = response.json()
        print(data)
    else:
        print(f"Corrupted data: {response.status_code}")

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.get("/data")
async def get_data():
    return {"message": "Backend is working!"}
