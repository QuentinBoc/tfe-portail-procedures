from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    level = Column(Integer, nullable=False)