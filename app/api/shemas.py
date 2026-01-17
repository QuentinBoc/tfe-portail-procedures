from datetime import datetime
from pydantic import BaseModel

class LoginRequest(BaseModel):
    email: str
    password: str

class InterventionCreate(BaseModel):
    title: str
    description: str
    location: str

class SendToChefRequest(BaseModel):
    chef_id: int

class SendToWorkerRequest(BaseModel):
    worker_id: int

class InterventionOut(BaseModel):
    id: int
    title: str
    description: str | None
    location: str 
    status: str
    created_at: datetime | None
    updated_at: datetime | None
    created_by_id: int
    assigned_to_id: int | None
    
class Config:
    orm_mode = True