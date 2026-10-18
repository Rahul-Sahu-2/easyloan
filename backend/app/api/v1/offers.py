import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from app.db.session import get_db
from app.models.offer import LoanOffer
from app.models.application import LoanApplication
from app.schemas.offer import LoanOfferResponse

router = APIRouter(prefix="/offers", tags=["Loan Offers"])

@router.get("/application/{application_id}", response_model=List[LoanOfferResponse])
def get_application_offers(
    application_id: int, 
    user_id: int,  # Temporary query parameter until JWT is active
    db: Session = Depends(get_db)
):
    """
    Retrieves all competitive contractual loan offers generated for a specific application ID.
    Automatically generates mock offers if the application is UNDER_REVIEW for instant simulation.
    """
    # 1. Verify application ownership constraints
    application = db.query(LoanApplication).filter(
        LoanApplication.id == application_id,
        LoanApplication.user_id == user_id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found or unauthorized access."
        )

    # 2. Extract existing offer rows matching parameters
    offers = db.query(LoanOffer).filter(LoanOffer.application_id == application_id).all()

    # 3. Automation engine: If status is UNDER_REVIEW and no offers exist, seed simulated bank returns
    if application.status == "UNDER_REVIEW" and not offers:
        future_expiry = datetime.datetime.utcnow() + datetime.timedelta(days=30)
        
        # Calculate matching financial metrics criteria bounds
        req_amt = Decimal(str(application.requested_amount))
        
        mock_offers = [
            LoanOffer(
                application_id=application_id, lender_id=1,
                offered_amount=req_amt, interest_rate_percentage=Decimal("10.50"),
                tenure_months=24, processing_fees=Decimal("999.00"), valid_until=future_expiry
            ),
            LoanOffer(
                application_id=application_id, lender_id=2,
                offered_amount=req_amt - Decimal("5000.00"), interest_rate_percentage=Decimal("9.99"),
                tenure_months=36, processing_fees=Decimal("499.00"), valid_until=future_expiry
            )
        ]
        
        for offer in mock_offers:
            db.add(offer)
            
        # Transition internal state parameters smoothly to offer visualization phase
        application.status = "OFFER_AVAILABLE"
        db.commit()
        
        # Re-fetch the newly created offer records
        offers = db.query(LoanOffer).filter(LoanOffer.application_id == application_id).all()

    return offers
