from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.application import LoanApplication
from app.models.user import User
from app.models.lender import Lender
from app.models.consent import ConsentRecord
from app.schemas.application import LoanApplicationCreate, LoanApplicationResponse
from app.schemas.consent import ConsentCreate, ConsentResponse

# Defining the router cleanly at the top to fix the NameError
router = APIRouter(prefix="/applications", tags=["Loan Applications"])

@router.post("", response_model=LoanApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_loan_application(
    application_in: LoanApplicationCreate, 
    user_id: int,  # Temporary query parameter until JWT is active
    db: Session = Depends(get_db)
):
    # 1. Verify if the associated user exists in the database
    user_exists = db.query(User).filter(User.id == user_id).first()
    if not user_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated user account not found."
        )
    
    # 2. Create the operational loan database entry instance
    new_application = LoanApplication(
        user_id=user_id,
        requested_amount=application_in.requested_amount,
        monthly_income=application_in.monthly_income,
        monthly_obligations=application_in.monthly_obligations,
        purpose=application_in.purpose,
        status="SUBMITTED"  # Initial server-assigned lifecycle status
    )
    
    # 3. Commit transactions safely inside local SQLite storage engine
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    return new_application

@router.get("/me", response_model=List[LoanApplicationResponse])
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all loan applications associated with a specific user ID.
    """
    applications = db.query(LoanApplication).filter(LoanApplication.user_id == user_id).all()
    return applications

@router.post("/route-with-consent", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
def route_application_to_lender(
    consent_in: ConsentCreate,
    user_id: int,  # Temporary query parameter until JWT is active
    db: Session = Depends(get_db)
):
    """
    Verifies user ownership, validates eligibility, logs formal legal consent, 
    and simulates routing the application safely to a mock lender system.
    """
    # 1. Verify that the targeted loan application exists and belongs to this user
    application = db.query(LoanApplication).filter(
        LoanApplication.id == consent_in.application_id,
        LoanApplication.user_id == user_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found or unauthorized access."
        )
        
    # 2. Verify that the target lender exists and is currently accepting applications
    lender = db.query(Lender).filter(Lender.id == consent_in.lender_id).first()
    if not lender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The selected lender institution does not exist."
        )
    if not lender.is_active or lender.integration_status != "CONNECTED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lender '{lender.lender_name}' is currently unavailable for processing."
        )

    # 3. Create and commit the audit record into the data repository
    consent_log = ConsentRecord(
        user_id=user_id,
        application_id=consent_in.application_id,
        lender_id=consent_in.lender_id
    )
    db.add(consent_log)
    
    # 4. Advance application state lifecycle to UNDER_REVIEW automatically
    application.status = "UNDER_REVIEW"
    
    db.commit()
    db.refresh(consent_log)
    
    return consent_log
