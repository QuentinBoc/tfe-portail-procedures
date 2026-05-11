import re
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator

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
    @field_validator('email')
    @classmethod
    def force_domain(cls, v: str) -> str:
        authorized_domains = ["atheneecomines.be"]
        domain = v.split('@')[-1]
        if domain not in authorized_domains:
            raise ValueError("Seules les adresses @atheneecomines.be sont acceptées")
        return v
    
    @field_validator('password') 
    @classmethod 
    def check_password_strength(cls, v: str) -> str:
        if (len(v) < 8 or len(v) > 32 ):
            raise ValueError("Le mot de passe doit contenir min 8 caractères et 32 caractères maximum")
        if not any(char.isupper() for char in v): 
            raise ValueError("Le mot de passe doit contenir au moins une majuscule.") 
        if not any(char.isdigit() for char in v): 
            raise ValueError("Le mot de passe doit contenir au moins un chiffre.") 
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v): 
            raise ValueError("Le mot de passe doit contenir au moins un caractère spécial.") 
        return v
    
class UserOut(BaseModel):
    full_name: str
    id: int
    email: str
    
    model_config = ConfigDict(from_attributes=True)
