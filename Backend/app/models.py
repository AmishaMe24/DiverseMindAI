from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = None  # Optional for Google OAuth users

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr

class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
