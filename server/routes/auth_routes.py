from fastapi import APIRouter, HTTPException
from models.user_model import User
from app.database import db
from passlib.hash import bcrypt
from utils.jwt_handler import create_token, verify_token
from fastapi import Depends
from utils.jwt_handler import get_current_user
from bson import ObjectId


router = APIRouter()

@router.post("/signup")
async def signup(user: User):
    if not user.name or not user.email or not user.password:
        raise HTTPException(status_code=400, detail="Name, email, and password are required")
    print("Received signup request with user:", user)
    if await db.users.find_one({"email": user.email}):
        print("Email already exists:", user.email)
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed_pwd = bcrypt.hash(user.password)
    result = await db.users.insert_one({"name": user.name, "email": user.email, "password": hashed_pwd})
    token = create_token(str(result.inserted_id))
    return {"message": "User created successfully", "token": token}

@router.post("/login")
async def login(user: User):
    db_user = await db.users.find_one({"email": user.email})
    if not db_user or not bcrypt.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(str(db_user["_id"]))
    return {"message": "Login Successfully", "token": token}

@router.get("/me")
async def get_user_info(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user["email"],
        "user_id": str(user["_id"]),
        "name": user.get("name", "")
    }