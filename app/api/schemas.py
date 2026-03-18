from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class InterventionCreate(BaseModel):
    title: str
    description: str
    location: str
    type: str

class SendToChefRequest(BaseModel):
    chef_id: int

class SendToWorkerRequest(BaseModel):
    worker_id: int

class InterventionOut(BaseModel):
    id: int
    title: str
    description: str | None
    type: str
    location: str 
    status: str
    created_by: int
    assigned_to: int | None
    validated_by: int | None
    created_at: datetime
    validated_at: datetime | None
    
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role_name: str