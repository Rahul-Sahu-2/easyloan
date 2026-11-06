from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional
from datetime import datetime


MINIMUM_MONTHLY_INCOME = Decimal("5000.00")

INCOME_ERROR_MESSAGE = (
    "Your monthly income must be at least Rs. 5,000 "
    "to apply for a loan."
)


# Common properties for creating applications
class LoanApplicationBase(BaseModel):

    requested_amount: Decimal = Field(
        ...,
        gt=0,
        description="Requested loan amount must be greater than zero"
    )

    monthly_income: Decimal = Field(
        ...,
        ge=MINIMUM_MONTHLY_INCOME,
        description=INCOME_ERROR_MESSAGE
    )

    monthly_obligations: Decimal = Field(
        default=Decimal("0.00"),
        ge=0
    )

    purpose: str = Field(
        ...,
        min_length=3,
        max_length=255
    )

    @field_validator("monthly_income", mode="before")
    @classmethod
    def validate_monthly_income(cls, value):

        if value is None or value == "":
            raise ValueError(INCOME_ERROR_MESSAGE)

        try:
            income = Decimal(str(value))
        except Exception:
            raise ValueError("Please enter a valid monthly income.")

        if not income.is_finite():
            raise ValueError("Please enter a valid monthly income.")

        if income < MINIMUM_MONTHLY_INCOME:
            raise ValueError(INCOME_ERROR_MESSAGE)

        return income


# Create application
class LoanApplicationCreate(LoanApplicationBase):
    pass


# Update application
class LoanApplicationUpdate(BaseModel):

    requested_amount: Optional[Decimal] = Field(
        None,
        gt=0
    )

    monthly_income: Optional[Decimal] = Field(
        None,
        ge=MINIMUM_MONTHLY_INCOME
    )

    monthly_obligations: Optional[Decimal] = Field(
        None,
        ge=0
    )

    purpose: Optional[str] = Field(
        None,
        min_length=3,
        max_length=255
    )

    status: Optional[str] = None

    @field_validator("monthly_income", mode="before")
    @classmethod
    def validate_monthly_income(cls, value):

        if value is None:
            return value

        try:
            income = Decimal(str(value))
        except Exception:
            raise ValueError("Please enter a valid monthly income.")

        if not income.is_finite():
            raise ValueError("Please enter a valid monthly income.")

        if income < MINIMUM_MONTHLY_INCOME:
            raise ValueError(INCOME_ERROR_MESSAGE)

        return income


# Response schema
# IMPORTANT: No minimum income validation here.
# Old applications must also be displayed.
class LoanApplicationResponse(BaseModel):

    id: int
    user_id: int
    requested_amount: Decimal
    monthly_income: Decimal
    monthly_obligations: Decimal
    purpose: str
    status: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }