from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Warehouse, Location

router = APIRouter(tags=["warehouses"])

class WarehouseCreate(BaseModel):
    name: str
    short_code: str = ""
    address: str = ""

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    short_code: Optional[str] = None
    address: Optional[str] = None

class LocationCreate(BaseModel):
    name: str
    short_code: str = ""
    warehouse_id: int

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    short_code: Optional[str] = None
    warehouse_id: Optional[int] = None

@router.get("/warehouses")
def list_warehouses(db: Session = Depends(get_db)):
    return db.query(Warehouse).all()

@router.post("/warehouses")
def create_warehouse(req: WarehouseCreate, db: Session = Depends(get_db)):
    w = Warehouse(**req.dict())
    db.add(w); db.commit(); db.refresh(w)
    return w

@router.patch("/warehouses/{wid}")
def update_warehouse(wid: int, req: WarehouseUpdate, db: Session = Depends(get_db)):
    w = db.query(Warehouse).filter(Warehouse.id == wid).first()
    if not w: raise HTTPException(404, "Warehouse not found")
    for k, v in req.dict(exclude_none=True).items():
        setattr(w, k, v)
    db.commit(); db.refresh(w)
    return w

@router.delete("/warehouses/{wid}")
def delete_warehouse(wid: int, db: Session = Depends(get_db)):
    w = db.query(Warehouse).filter(Warehouse.id == wid).first()
    if not w: raise HTTPException(404, "Warehouse not found")
    db.delete(w); db.commit()
    return {"ok": True}

@router.get("/locations")
def list_locations(db: Session = Depends(get_db)):
    return db.query(Location).all()

@router.post("/locations")
def create_location(req: LocationCreate, db: Session = Depends(get_db)):
    loc = Location(**req.dict())
    db.add(loc); db.commit(); db.refresh(loc)
    return loc

@router.patch("/locations/{lid}")
def update_location(lid: int, req: LocationUpdate, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == lid).first()
    if not loc: raise HTTPException(404, "Location not found")
    for k, v in req.dict(exclude_none=True).items():
        setattr(loc, k, v)
    db.commit(); db.refresh(loc)
    return loc

@router.delete("/locations/{lid}")
def delete_location(lid: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == lid).first()
    if not loc: raise HTTPException(404, "Location not found")
    db.delete(loc); db.commit()
    return {"ok": True}