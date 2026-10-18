import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from app.db.session import Base

class ConsentRecord(Base):
    __tablename__ = "consent_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    application_id = Column(Integer, ForeignKey("loan_applications.id", ondelete="CASCADE"), nullable=False)
    lender_id = Column(Integer, ForeignKey("lenders.id", ondelete="CASCADE"), nullable=False)
    
    # Audit trail fields in standard English
    purpose = Column(String, default="Sharing application details for credit evaluation.")
    consent_version = Column(String, default="v1.0")
    
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)
    withdrawn_at = Column(DateTime, nullable=True)  # Null means consent is currently active
