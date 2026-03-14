from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime

class RoleEnum(str, enum.Enum):
    manager = "manager"
    staff = "staff"

class StatusEnum(str, enum.Enum):
    draft = "Draft"
    waiting = "Waiting"
    ready = "Ready"
    done = "Done"
    cancelled = "Cancelled"

class LedgerTypeEnum(str, enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    transfer = "transfer"
    adjustment = "adjustment"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.staff)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_code = Column(String)
    address = Column(String)
    locations = relationship("Location", back_populates="warehouse")

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    short_code = Column(String)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    warehouse = relationship("Warehouse", back_populates="locations")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, index=True)
    category = Column(String)
    uom = Column(String)  # unit of measure e.g. kg, pcs
    cost_per_unit = Column(Float, default=0.0)
    low_stock_threshold = Column(Integer, default=10)

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True)
    contact = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.draft)
    responsible_user_id = Column(Integer, ForeignKey("users.id"))
    scheduled_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    lines = relationship("ReceiptLine", back_populates="receipt")

class ReceiptLine(Base):
    __tablename__ = "receipt_lines"
    id = Column(Integer, primary_key=True, index=True)
    receipt_id = Column(Integer, ForeignKey("receipts.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    receipt = relationship("Receipt", back_populates="lines")
    product = relationship("Product")

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String, unique=True)
    contact = Column(String)
    status = Column(Enum(StatusEnum), default=StatusEnum.draft)
    responsible_user_id = Column(Integer, ForeignKey("users.id"))
    scheduled_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    lines = relationship("DeliveryLine", back_populates="delivery")

class DeliveryLine(Base):
    __tablename__ = "delivery_lines"
    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Float, nullable=False)
    delivery = relationship("Delivery", back_populates="lines")
    product = relationship("Product")

class StockLedger(Base):
    __tablename__ = "stock_ledger"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    from_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    to_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    qty_delta = Column(Float, nullable=False)  # positive = stock in, negative = stock out
    type = Column(Enum(LedgerTypeEnum), nullable=False)
    ref_id = Column(Integer, nullable=True)   # receipt/delivery/transfer id
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    product = relationship("Product")