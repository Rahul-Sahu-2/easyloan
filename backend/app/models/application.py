import datetime
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Financial fields using clear descriptions
    requested_amount = Column(Numeric(12, 2), nullable=False)
    monthly_income = Column(Numeric(12, 2), nullable=False)
    monthly_obligations = Column(Numeric(12, 2), default=0.00)
    purpose = Column(String, nullable=False)
    
    # State lifecycle parameters (Default state is DRAFT)
    status = Column(String, default="DRAFT")  # DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)

    # Database Relationship mappings link back to User indices
    user = relationship("User", back_populates="applications")
