from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import Product, StockLedger

router = APIRouter(prefix="/products", tags=["products"])

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str = ""
    uom: str = "pcs"
    cost_per_unit: float = 0.0
    low_stock_threshold: int = 10

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    cost_per_unit: Optional[float] = None
    low_stock_threshold: Optional[int] = None

def get_stock(product_id: int, db: Session) -> float:
    result = db.query(func.sum(StockLedger.qty_delta)).filter(
        StockLedger.product_id == product_id
    ).scalar()
    return float(result or 0)

@router.get("/")
def list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    result = []
    for p in products:
        stock = get_stock(p.id, db)
        result.append({
            "id": p.id, "name": p.name, "sku": p.sku,
            "category": p.category, "uom": p.uom,
            "cost_per_unit": p.cost_per_unit,
            "on_hand": stock,
            "free_to_use": stock,
            "low_stock": stock <= p.low_stock_threshold
        })
    return result

@router.post("/")
def create_product(req: ProductCreate, db: Session = Depends(get_db)):
    p = Product(**req.dict())
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

@router.patch("/{product_id}")
def update_product(product_id: int, req: ProductUpdate, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in req.dict(exclude_none=True).items():
        setattr(p, field, value)
    db.commit()
    db.refresh(p)
    return p

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(p)
    db.commit()
    return {"ok": True}