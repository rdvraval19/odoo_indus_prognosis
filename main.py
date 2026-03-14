from models import *
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

app = FastAPI(title="CoreInventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Import all routers later here

@app.get("/")
def root():
    return {"message": "CoreInventory API is running"}