from pydantic import BaseModel, Field
from datetime import datetime

class LenderBase(BaseModel):
    lender_name: str = Field(..., min_length=2, max_length=100, description="Name of the lending institution")
    integration_type: str = Field(default="MOCK", description="Type of connection: MOCK or REAL")
    is_active: bool = Field(default=True, description="Whether the lender is active on the platform")
    integration_status: str = Field(default="CONNECTED", description="Connection status: CONNECTED, MAINTENANCE, DISCONNECTED")

class LenderResponse(LenderBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
