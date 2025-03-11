from fastapi import APIRouter
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.database import users_collection
from app.models import UserSignup, UserLogin
from fastapi import HTTPException, Request
from starlette.responses import RedirectResponse, JSONResponse
import httpx
from app.config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, SECRET_KEY, JWT_ALGORITHM
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

@router.get("/auth/google")
async def google_login():
    """ Redirects user to Google OAuth login page """
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return RedirectResponse(google_auth_url)

@router.post("/auth/google/callback")
async def google_callback(request: Request):
    """ Handles the OAuth2 callback """
    data = await request.json()
    code = data.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code missing")
    
    token_url = "https://oauth2.googleapis.com/token"
    
    async with httpx.AsyncClient() as client:
        token_response = await client.post(token_url, data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI
        })
    
    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(status_code=400, detail="Failed to obtain access token")

    # Fetch user profile
    async with httpx.AsyncClient() as client:
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
    
    user_data = user_response.json()

    # Store user in MongoDB
    existing_user = await users_collection.find_one({"email": user_data["email"]})
    if not existing_user:
        await users_collection.insert_one(user_data)

    # Set session cookie
    response = JSONResponse(content={"user": user_data})
    response.set_cookie(key="access_token", value=access_token, httponly=True)
    return response

@router.get("/auth/user")
async def get_user(request: Request):
    """ Returns user data if authenticated """
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    user = await users_collection.find_one({"access_token": access_token})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return JSONResponse(content={"user": user})

@router.get("/auth/logout")
async def logout():
    """ Logs out the user """
    response = JSONResponse(content={"message": "Logged out"})
    response.delete_cookie("access_token")
    return response

@router.post("/auth/signup")
async def signup(user: UserSignup):
    """ Signup with First Name, Last Name, Email & Password """
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user.password)
    await users_collection.insert_one({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "password": hashed_password
    })

    return {"message": "Signup successful"}

@router.post("/auth/login")
async def login(user: UserLogin):
    """ Login with Email & Password """
    db_user = await users_collection.find_one({"email": user.email})
    
    if not db_user or not pwd_context.verify(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        data={"email": db_user["email"], "first_name": db_user["first_name"], "last_name": db_user["last_name"]},
        expires_delta=timedelta(hours=1)
    )

    return {"token": token, "first_name": db_user["first_name"], "last_name": db_user["last_name"]}