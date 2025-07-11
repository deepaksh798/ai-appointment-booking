from jose import jwt, JWTError
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# Environment variables
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM")

security = HTTPBearer()

# Generate a new token
def create_token(user_id: str):
    return jwt.encode(
        {"user_id": user_id},
        SECRET_KEY,
        algorithm=ALGORITHM
    )

# Decode and verify a token
def verify_token(token: str):
    print("Verifying token:", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except JWTError:
        return None

# Dependency to extract user from token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    user_id = verify_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"user_id": user_id}
