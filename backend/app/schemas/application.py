from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional
from datetime import datetime

# Common properties shared across application contexts
class LoanApplicationBase(BaseModel):
    requested_amount: Decimal = Field(..., gt=0, description="Requested loan amount must be greater than zero")
    monthly_income: Decimal = Field(..., gt=0, description="Monthly income must be greater than zero")
    monthly_obligations: Decimal = Field(default=Decimal("0.00"), ge=0, description="Monthly obligations cannot be negative")
    purpose: str = Field(..., min_length=3, max_length=255, description="Purpose of the loan")

# Schema properties required for submitting a new application
class LoanApplicationCreate(LoanApplicationBase):
    pass

# Schema properties permitted for patching/updating an application
class LoanApplicationUpdate(BaseModel):
    requested_amount: Optional[Decimal] = Field(None, gt=0)
    monthly_income: Optional[Decimal] = Field(None, gt=0)
    monthly_obligations: Optional[Decimal] = Field(None, ge=0)
    purpose: Optional[str] = Field(None, min_length=3, max_length=255)
    status: Optional[str] = Field(None, description="Status update parameters")

# Safe structural response schema returned in HTTP responses (100% English fields)
class LoanApplicationResponse(LoanApplicationBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }
