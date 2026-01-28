from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import timedelta
from app.auth import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)

router = APIRouter()

# JSON body for login
class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/token")
def login(request: LoginRequest):
    user = authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/protected")
def protected_route(username: str = Depends(get_current_user)):
    return {"message": f"Hello {username}, you accessed a protected route!"}
