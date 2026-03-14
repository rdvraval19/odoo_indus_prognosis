from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Warehouse, Location

router = APIRouter(tags=["warehouses"])

class WarehouseCreate(BaseModel):
    name: str
    short_code: str = ""
    address: str = ""

class LocationCreate(BaseModel):
    name: str
    short_code: str = ""
    warehouse_id: int

@router.get("/warehouses")
def list_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@router.post("/warehouses")
def create_warehouse(req: WarehouseCreate, db: Session = Depends(get_db)):
    w = Warehouse(**req.dict())
    db.add(w)
    db.commit()
    db.refresh(w)
    return w

@router.get("/locations")
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.post("/locations")
def create_location(req: LocationCreate, db: Session = Depends(get_db)):
    loc = Location(**req.dict())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc