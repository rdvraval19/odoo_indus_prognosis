from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from database import get_db
from models import User
import random

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "changethisinsecretkey123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str = ""
    role: str = "staff"

class LoginRequest(BaseModel):
    email: str
    password: str

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = pwd_context.hash(req.password)
    user = User(email=req.email, hashed_password=hashed, full_name=req.full_name, role=req.role)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id}

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role, "user_id": user.id}

# Temporary in-memory OTP store (fine for hackathon)
otp_store = {}

class SendOtpRequest(BaseModel):
    email: str

class VerifyOtpRequest(BaseModel):
    email: str
    otp: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

@router.post("/send-otp")
def send_otp(req: SendOtpRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")
    otp = str(random.randint(100000, 999999))
    otp_store[req.email] = otp
    print(f"OTP for {req.email}: {otp}")  # shows in uvicorn terminal
    return {"message": f"OTP sent to {req.email}. Check server console for demo OTP."}

@router.post("/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    stored = otp_store.get(req.email)
    if not stored or stored != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return {"message": "OTP verified"}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored = otp_store.get(req.email)
    if not stored or stored != req.otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = pwd_context.hash(req.new_password)
    db.commit()
    del otp_store[req.email]  # clear OTP after use
    return {"message": "Password reset successful"}