
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
from app.models.application_status_history import ApplicationStatusHistory

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

    db.add(
         ApplicationStatusHistory(
           application_id=new_application.id,
           old_status=None,
           new_status=new_application.status,
           note="Application submitted",
         )   
      )
    db.commit()

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
   # 4. Record the status transition
    old_status = application.status
    application.status = "UNDER_REVIEW"

    db.add(
          ApplicationStatusHistory(
             application_id=application.id,
             old_status=old_status,
             new_status="UNDER_REVIEW",
             note="Application sent to lender for review",
         )
     )
    
    db.commit()
    db.refresh(consent_log)
    
    return consent_log

@router.delete("/{application_id}")
def delete_loan_application(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    # Find the application and verify ownership
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found."
        )

    # Only draft applications can be permanently deleted
    if application.status != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only draft applications can be deleted. Cancel submitted applications instead."
        )

    # Delete related records first to avoid foreign-key conflicts
    from app.models.offer import LoanOffer

    db.query(LoanOffer).filter(
        LoanOffer.application_id == application_id
    ).delete(synchronize_session=False)

    db.query(ConsentRecord).filter(
        ConsentRecord.application_id == application_id
    ).delete(synchronize_session=False)

    db.delete(application)
    db.commit()

    return {"message": "Draft application deleted successfully."}
 
@router.patch("/{application_id}/cancel")
def cancel_loan_application(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found."
        )

    if application.status == "CANCELLED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application is already cancelled."
        )

    if application.status in ["APPROVED", "REJECTED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Approved or rejected applications cannot be cancelled."
        )

    old_status = application.status
    application.status = "CANCELLED"

    db.add(
    ApplicationStatusHistory(
        application_id=application.id,
        old_status=old_status,
        new_status="CANCELLED",
        note="Application cancelled by user",
    )
)
    
    db.commit()
    db.refresh(application)

    return {
        "message": "Application cancelled successfully.",
        "application_id": application.id,
        "status": application.status
    }

@router.get("/{application_id}/history")
def get_application_history(
    application_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    application = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.id == application_id,
            LoanApplication.user_id == user_id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        )

    history = (
        db.query(ApplicationStatusHistory)
        .filter(
            ApplicationStatusHistory.application_id == application_id
        )
        .order_by(
            ApplicationStatusHistory.created_at.asc(),
            ApplicationStatusHistory.id.asc(),
        )
        .all()
    )

    return [
        {
            "id": event.id,
            "application_id": event.application_id,
            "old_status": event.old_status,
            "new_status": event.new_status,
            "note": event.note,
            "created_at": event.created_at,
        }
        for event in history
    ]
