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

class AssignRequest(BaseModel):
    assignee_id: int


class InterventionOut(BaseModel):
    id: int
    title: str
    description: str | None
    type: str
    location: str 
    status: str
    assigned_to: int | None
    assigned_at: datetime | None
    created_by: int
    created_at: datetime
    validated_by: int | None
    validated_at: datetime | None
    processing_by: int | None
    processing_at: datetime | None
    rejected_by: int | None
    rejected_at: datetime | None
    closed_by: int | None
    closed_at: datetime | None
    
    
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role_name: str
    
class UserOut(BaseModel):
    full_name: str
    id: int
    
    model_config = ConfigDict(from_attributes=True)
