from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class ConsentCreate(BaseModel):
    application_id: int = Field(..., description="The ID of the loan application being shared")
    lender_id: int = Field(..., description="The ID of the lender receiving the data")

class ConsentResponse(BaseModel):
    id: int
    user_id: int
    application_id: int
    lender_id: int
    purpose: str
    consent_version: str
    granted_at: datetime
    withdrawn_at: Optional[datetime]

    model_config = {
        "from_attributes": True
    }
