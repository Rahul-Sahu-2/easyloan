import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.session import Base

class Lender(Base):
    __tablename__ = "lenders"

    id = Column(Integer, primary_key=True, index=True)
    lender_name = Column(String, unique=True, nullable=False)
    integration_type = Column(String, default="MOCK")  # 'MOCK' or 'REAL'
    is_active = Column(Boolean, default=True)
    integration_status = Column(String, default="CONNECTED") # 'CONNECTED', 'MAINTENANCE', 'DISCONNECTED'
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
