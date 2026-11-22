import heapq
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="HarvestLink API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory starter list (we will swap this to MongoDB Atlas via Repository Pattern next)
produce_items = [
    {"id": 1, "name": "Fresh Tomatoes", "farm": "Green Valley Farm", "spoilage_hours": 18, "qty_kg": 45},
    {"id": 2, "name": "Sweet Corn", "farm": "Sunrise Plot", "spoilage_hours": 48, "qty_kg": 80},
    {"id": 3, "name": "Leafy Spinach", "farm": "Riverbend Growers", "spoilage_hours": 12, "qty_kg": 25},
]


class ProduceCreate(BaseModel):
    name: str
    farm: str
    spoilage_hours: int
    qty_kg: float


@app.get("/")
def home():
    return {"message": "HarvestLink backend is running!"}


@app.get("/api/status")
def status():
    return {
        "project": "HarvestLink",
        "status": "connected",
        "features": ["produce-demand", "google-maps-delivery", "jwt-auth"],
    }


@app.get("/api/produce/priority")
def get_priority_produce():
    # Min-heap (DSA): smallest spoilage_hours comes out first so urgent produce is delivered first
    heap = []
    for item in produce_items:
        heapq.heappush(heap, (item["spoilage_hours"], item["id"], item))

    prioritized = []
    while heap:
        _, _, item = heapq.heappop(heap)
        prioritized.append(item)

    return {"items": prioritized}


@app.post("/api/produce")
def add_produce(payload: ProduceCreate):
    new_id = max([p["id"] for p in produce_items], default=0) + 1
    new_item = {
        "id": new_id,
        "name": payload.name,
        "farm": payload.farm,
        "spoilage_hours": payload.spoilage_hours,
        "qty_kg": payload.qty_kg,
    }
    produce_items.append(new_item)
    return {"created": new_item}
