from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from app.db.session import get_db
from app.models.application import LoanApplication

router = APIRouter(prefix="/eligibility", tags=["Preliminary Eligibility"])

@router.get("/{application_id}", status_code=status.HTTP_200_OK)
def check_loan_eligibility(application_id: int, db: Session = Depends(get_db)):
    """
    Evaluates preliminary loan eligibility based on deterministic Debt-to-Income (DTI) criteria.
    """
    # 1. Fetch target application context row from SQLite matching parameter indices
    application = db.query(LoanApplication).filter(LoanApplication.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found."
        )

    # 2. Extract operational numeric bounds smoothly using Decimal type parsing
    income = Decimal(str(application.monthly_income))
    obligations = Decimal(str(application.monthly_obligations))
    requested_amount = Decimal(str(application.requested_amount))

    # 3. Calculate Debt-to-Income (DTI) metric bounds
    # formula: (Existing Monthly Obligations / Total Monthly Income) * 100
    if income <= 0:
        return {
            "application_id": application_id,
            "eligible": False,
            "reason": "Monthly income must be greater than zero.",
            "dti_ratio_percentage": 0.00,
            "maximum_suggested_emi": 0.00
        }

    dti_ratio = (obligations / income) * 100
    
    # Financial baseline rule: A borrower is typically eligible if their current obligations take up less than 50% of income.
    is_eligible = True
    reason = "Preliminary criteria satisfied. Application is within safe debt thresholds."
    
    # Maximum recommended EMI cap bounds (45% of total income minus existing liabilities)
    max_suggested_emi = (income * Decimal("0.45")) - obligations
    if max_suggested_emi < 0:
        max_suggested_emi = Decimal("0.00")

    if dti_ratio >= 50:
        is_eligible = False
        reason = "Debt-to-Income (DTI) ratio exceeds safe thresholds. Existing monthly obligations are too high relative to current income levels."

    return {
        "application_id": application_id,
        "eligible": is_eligible,
        "reason": reason,
        "dti_ratio_percentage": round(float(dti_ratio), 2),
        "maximum_suggested_emi": round(float(max_suggested_emi), 2)
    }
