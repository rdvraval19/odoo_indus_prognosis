from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from database import get_db
from models import (Receipt, ReceiptLine, Delivery, DeliveryLine,
                    StockLedger, Product, StatusEnum, LedgerTypeEnum)
import datetime, random, string

router = APIRouter(tags=["operations"])

def gen_ref(prefix="WH"):
    return prefix + "/" + "".join(random.choices(string.digits, k=5))

def get_stock(product_id: int, db: Session) -> float:
    result = db.query(func.sum(StockLedger.qty_delta)).filter(
        StockLedger.product_id == product_id).scalar()
    return float(result or 0)

# ---- RECEIPTS ----

class ReceiptLineIn(BaseModel):
    product_id: int
    quantity: float

class ReceiptCreate(BaseModel):
    contact: str = ""
    scheduled_date: Optional[str] = None
    lines: List[ReceiptLineIn]

@router.post("/receipts")
def create_receipt(req: ReceiptCreate, db: Session = Depends(get_db)):
    r = Receipt(
        reference=gen_ref("IN"),
        contact=req.contact,
        status=StatusEnum.draft,
        scheduled_date=datetime.datetime.utcnow()
    )
    db.add(r)
    db.flush()
    for line in req.lines:
        db.add(ReceiptLine(receipt_id=r.id, product_id=line.product_id, quantity=line.quantity))
    db.commit()
    db.refresh(r)
    return r

@router.get("/receipts")
def list_receipts(db: Session = Depends(get_db)):
    return db.query(Receipt).all()

@router.get("/receipts/{receipt_id}")
def get_receipt(receipt_id: int, db: Session = Depends(get_db)):
    r = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not r:
        raise HTTPException(404, "Receipt not found")
    return r

@router.post("/receipts/{receipt_id}/validate")
def validate_receipt(receipt_id: int, db: Session = Depends(get_db)):
    r = db.query(Receipt).filter(Receipt.id == receipt_id).first()
    if not r:
        raise HTTPException(404, "Receipt not found")
    if r.status == StatusEnum.done:
        raise HTTPException(400, "Already validated")
    for line in r.lines:
        db.add(StockLedger(
            product_id=line.product_id,
            qty_delta=line.quantity,          # +qty
            type=LedgerTypeEnum.receipt,
            ref_id=r.id,
            timestamp=datetime.datetime.utcnow()
        ))
    r.status = StatusEnum.done
    db.commit()
    return {"ok": True, "message": "Receipt validated, stock increased"}

# ---- DELIVERIES ----

class DeliveryLineIn(BaseModel):
    product_id: int
    quantity: float

class DeliveryCreate(BaseModel):
    contact: str = ""
    lines: List[DeliveryLineIn]

@router.post("/deliveries")
def create_delivery(req: DeliveryCreate, db: Session = Depends(get_db)):
    d = Delivery(
        reference=gen_ref("OUT"),
        contact=req.contact,
        status=StatusEnum.draft,
        scheduled_date=datetime.datetime.utcnow()
    )
    db.add(d)
    db.flush()
    for line in req.lines:
        db.add(DeliveryLine(delivery_id=d.id, product_id=line.product_id, quantity=line.quantity))
    db.commit()
    db.refresh(d)
    return d

@router.get("/deliveries")
def list_deliveries(db: Session = Depends(get_db)):
    return db.query(Delivery).all()

@router.get("/deliveries/{delivery_id}")
def get_delivery(delivery_id: int, db: Session = Depends(get_db)):
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(404, "Delivery not found")
    return d

@router.post("/deliveries/{delivery_id}/validate")
def validate_delivery(delivery_id: int, db: Session = Depends(get_db)):
    d = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not d:
        raise HTTPException(404, "Delivery not found")
    if d.status == StatusEnum.done:
        raise HTTPException(400, "Already validated")
    # Check stock before deducting
    for line in d.lines:
        current = get_stock(line.product_id, db)
        if current < line.quantity:
            product = db.query(Product).filter(Product.id == line.product_id).first()
            raise HTTPException(400, f"Product '{product.name}' has insufficient stock. Available: {current}, Required: {line.quantity}")
    for line in d.lines:
        db.add(StockLedger(
            product_id=line.product_id,
            qty_delta=-line.quantity,           # -qty
            type=LedgerTypeEnum.delivery,
            ref_id=d.id,
            timestamp=datetime.datetime.utcnow()
        ))
    d.status = StatusEnum.done
    db.commit()
    return {"ok": True, "message": "Delivery validated, stock decreased"}

# ---- TRANSFER ----

class TransferCreate(BaseModel):
    product_id: int
    from_location_id: int
    to_location_id: int
    quantity: float

@router.post("/transfers")
def create_transfer(req: TransferCreate, db: Session = Depends(get_db)):
    db.add(StockLedger(
        product_id=req.product_id,
        from_location_id=req.from_location_id,
        to_location_id=req.to_location_id,
        qty_delta=0,                            # total stock unchanged
        type=LedgerTypeEnum.transfer,
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()
    return {"ok": True, "message": "Transfer logged"}

# ---- ADJUSTMENT ----

class AdjustmentCreate(BaseModel):
    product_id: int
    counted_qty: float    # what you physically counted

@router.post("/adjustments")
def create_adjustment(req: AdjustmentCreate, db: Session = Depends(get_db)):
    recorded = get_stock(req.product_id, db)
    delta = req.counted_qty - recorded        # +ve or -ve
    db.add(StockLedger(
        product_id=req.product_id,
        qty_delta=delta,
        type=LedgerTypeEnum.adjustment,
        timestamp=datetime.datetime.utcnow()
    ))
    db.commit()
    return {"ok": True, "delta": delta, "message": f"Stock adjusted by {delta}"}

# ---- LEDGER ----

@router.get("/ledger")
def get_ledger(db: Session = Depends(get_db)):
    entries = db.query(StockLedger).order_by(StockLedger.timestamp.desc()).limit(200).all()
    result = []
    for e in entries:
        result.append({
            "id": e.id,
            "product_id": e.product_id,
            "product_name": e.product.name if e.product else "",
            "qty_delta": e.qty_delta,
            "type": e.type,
            "ref_id": e.ref_id,
            "timestamp": e.timestamp,
            "from_location_id": e.from_location_id,
            "to_location_id": e.to_location_id,
        })
    return result

# ---- STATS (Dashboard KPIs) ----

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from models import StatusEnum
    total_products = db.query(Product).count()
    receipts_todo = db.query(Receipt).filter(Receipt.status == StatusEnum.draft).count()
    receipts_waiting = db.query(Receipt).filter(Receipt.status == StatusEnum.waiting).count()
    receipts_done = db.query(Receipt).filter(Receipt.status == StatusEnum.done).count()
    deliveries_todo = db.query(Delivery).filter(Delivery.status == StatusEnum.draft).count()
    deliveries_waiting = db.query(Delivery).filter(Delivery.status == StatusEnum.waiting).count()
    deliveries_done = db.query(Delivery).filter(Delivery.status == StatusEnum.done).count()

    # Low stock products
    products = db.query(Product).all()
    low_stock = []
    for p in products:
        stock = get_stock(p.id, db)
        if stock <= p.low_stock_threshold:
            low_stock.append({"id": p.id, "name": p.name, "sku": p.sku, "on_hand": stock})

    return {
        "total_products": total_products,
        "receipts": {"todo": receipts_todo, "waiting": receipts_waiting, "done": receipts_done},
        "deliveries": {"todo": deliveries_todo, "waiting": deliveries_waiting, "done": deliveries_done},
        "low_stock_products": low_stock
    }