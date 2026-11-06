
from datetime import datetime, timedelta
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.models.application_status_history import ApplicationStatusHistory
from app.db.session import get_db
from app.models.application import LoanApplication
from app.models.offer import LoanOffer
from app.models.lender import Lender

router = APIRouter(prefix="/offers", tags=["Offers"])


def serialize_offer(offer: LoanOffer, db: Session):
    lender = db.query(Lender).filter(Lender.id == offer.lender_id).first()

    return {
        "id": offer.id,
        "application_id": offer.application_id,
        "lender_id": offer.lender_id,
        "lender_name": lender.lender_name if lender else f"Demo Lender {offer.lender_id}",
        "offered_amount": offer.offered_amount,
        "interest_rate_percentage": offer.interest_rate_percentage,
        "tenure_months": offer.tenure_months,
        "processing_fees": offer.processing_fees,
        "valid_until": offer.valid_until,
        "status": offer.status,
        "created_at": offer.created_at,
        "updated_at": offer.updated_at,
    }


@router.get("/application/{application_id}")
def get_application_offers(
    application_id: int,
    user_id: int = Query(...),
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
        raise HTTPException(status_code=404, detail="Application not found.")

    if application.status in ("CANCELLED", "REJECTED", "APPROVED"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot retrieve offers because the application status is {application.status}.",
        )

    offers = (
        db.query(LoanOffer)
        .filter(LoanOffer.application_id == application_id)
        .all()
    )

    if application.status == "UNDER_REVIEW" and not offers:
        lenders = (
            db.query(Lender)
            .filter(
                Lender.is_active.is_(True),
                Lender.integration_status == "CONNECTED",
            )
            .order_by(Lender.id.asc())
            .limit(2)
            .all()
        )

        if not lenders:
            return []

        requested_amount = Decimal(str(application.requested_amount or 0))

        offer_terms = [
            {
                "rate": Decimal("10.50"),
                "tenure": 24,
                "fee": Decimal("999.00"),
            },
            {
                "rate": Decimal("9.99"),
                "tenure": 36,
                "fee": Decimal("499.00"),
            },
        ]

        for index, lender in enumerate(lenders):
            terms = offer_terms[index]

            offered_amount = max(
                Decimal("0.00"),
                requested_amount - Decimal("5000.00") * index,
            )

            new_offer = LoanOffer(
                application_id=application.id,
                lender_id=lender.id,
                offered_amount=offered_amount,
                interest_rate_percentage=terms["rate"],
                tenure_months=terms["tenure"],
                processing_fees=terms["fee"],
                valid_until=datetime.utcnow() + timedelta(days=30),
                status="PENDING",
            )
            db.add(new_offer)

        application.status = "OFFER_AVAILABLE"
        db.commit()

        offers = (
            db.query(LoanOffer)
            .filter(LoanOffer.application_id == application_id)
            .all()
        )

    return [serialize_offer(offer, db) for offer in offers]


@router.post("/{offer_id}/select")
def select_offer(
    offer_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    offer = (
        db.query(LoanOffer)
        .filter(LoanOffer.id == offer_id)
        .first()
    )

    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")

    application = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.id == offer.application_id,
            LoanApplication.user_id == user_id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Offer not found for this user.",
        )

    if application.status in ("CANCELLED", "REJECTED", "APPROVED"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot select an offer because application status is {application.status}.",
        )

    if offer.valid_until <= datetime.utcnow():
        offer.status = "EXPIRED"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="This offer has expired.",
        )

    if offer.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"This offer cannot be selected because its status is {offer.status}.",
        )

    accepted_offer = (
        db.query(LoanOffer)
        .filter(
            LoanOffer.application_id == application.id,
            LoanOffer.status == "ACCEPTED",
        )
        .first()
    )

    if accepted_offer:
        raise HTTPException(
            status_code=400,
            detail="An offer has already been selected for this application.",
        )

    old_status = application.status

    offer.status = "ACCEPTED"
    application.status = "OFFER_SELECTED"

    db.add(
        ApplicationStatusHistory(
            application_id=application.id,
            old_status=old_status,
            new_status="OFFER_SELECTED",
            note="User selected a simulated loan offer",
        )
    )

    db.commit()
    db.refresh(offer)
    db.refresh(application)

    return serialize_offer(offer, db)

@router.post("/{offer_id}/reject")
def reject_offer(
    offer_id: int,
    user_id: int = Query(...),
    db: Session = Depends(get_db),
):
    offer = (
        db.query(LoanOffer)
        .filter(LoanOffer.id == offer_id)
        .first()
    )

    if not offer:
        raise HTTPException(
            status_code=404,
            detail="Offer not found.",
        )

    application = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.id == offer.application_id,
            LoanApplication.user_id == user_id,
        )
        .first()
    )

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Offer not found for this user.",
        )

    if application.status in ("CANCELLED", "REJECTED", "APPROVED"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot reject an offer because application status is {application.status}.",
        )

    if offer.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"This offer cannot be rejected because its status is {offer.status}.",
        )

    offer.status = "REJECTED"
    db.commit()
    db.refresh(offer)

    return serialize_offer(offer, db)
