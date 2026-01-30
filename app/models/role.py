from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    label = Column(String, nullable=False)