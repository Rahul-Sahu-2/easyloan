import datetime
# Added 'relationship' in the imports below
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship 
from app.db.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")  # 'user' or 'admin'
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # HERE IT IS: Class ke bilkul end me relationship define kar diya hai
    applications = relationship("LoanApplication", back_populates="user", cascade="all, delete-orphan")
