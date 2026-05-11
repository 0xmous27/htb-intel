from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = Path(__file__).parent / "data" / "output.json"


@app.get("/api/techniques")
def get_techniques():
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE) as f:
        return json.load(f)


@app.get("/api/categories")
def get_categories():
    if not DATA_FILE.exists():
        return []
    with open(DATA_FILE) as f:
        data = json.load(f)
    return [{"category": c["category"], "count": len(c["techniques"])} for c in data]
