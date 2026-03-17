from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    targetExam: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: UUID
    name: str
    email: str
    targetExam: str
    createdAt: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: UserOut
