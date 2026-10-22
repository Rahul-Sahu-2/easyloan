import datetime
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from app.db.session import Base

class LoanOffer(Base):
    __tablename__ = "loan_offers"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    lender_id = Column(Integer, ForeignKey("lenders.id", ondelete="CASCADE"), nullable=False)
    
    # Financial contractual parameters
    offered_amount = Column(Numeric(12, 2), nullable=False)
    interest_rate_percentage = Column(Numeric(5, 2), nullable=False)  # Example: 10.50%
    tenure_months = Column(Integer, nullable=False)  # Example: 12, 24, 36 months
    processing_fees = Column(Numeric(10, 2), default=0.00)
    
    # Expiration bound configuration parameters
    valid_until = Column(DateTime, nullable=False)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED, REJECTED, EXPIRED
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

