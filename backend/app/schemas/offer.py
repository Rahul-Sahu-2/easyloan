from pydantic import BaseModel, Field
from decimal import Decimal
from datetime import datetime
from typing import Optional

class LoanOfferResponse(BaseModel):
    id: int
    application_id: int
    lender_id: int
    lender_name: str
    offered_amount: Decimal
    interest_rate_percentage: Decimal
    tenure_months: int
    processing_fees: Decimal
    valid_until: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
