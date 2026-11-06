from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.application import LoanApplication
from app.models.offer import LoanOffer
from app.models.lender import Lender
from app.models.consent import ConsentRecord
from app.models.application_status_history import ApplicationStatusHistory
from app.core.loan_rules import calculate_max_eligible_loan


router = APIRouter(prefix="/offers", tags=["Offers"])


# 15 simulated lender offer configurations
OFFER_TERMS = [
    {"rate": Decimal("9.50"), "tenure": 36, "fee": Decimal("499.00")},
    {"rate": Decimal("9.75"), "tenure": 48, "fee": Decimal("599.00")},
    {"rate": Decimal("10.00"), "tenure": 60, "fee": Decimal("699.00")},
    {"rate": Decimal("10.25"), "tenure": 36, "fee": Decimal("799.00")},
    {"rate": Decimal("10.50"), "tenure": 48, "fee": Decimal("899.00")},
    {"rate": Decimal("10.75"), "tenure": 60, "fee": Decimal("999.00")},
    {"rate": Decimal("11.00"), "tenure": 24, "fee": Decimal("499.00")},
    {"rate": Decimal("11.25"), "tenure": 36, "fee": Decimal("599.00")},
    {"rate": Decimal("11.50"), "tenure": 48, "fee": Decimal("699.00")},
    {"rate": Decimal("11.75"), "tenure": 60, "fee": Decimal("799.00")},
    {"rate": Decimal("12.00"), "tenure": 24, "fee": Decimal("899.00")},
    {"rate": Decimal("12.25"), "tenure": 36, "fee": Decimal("999.00")},
    {"rate": Decimal("12.50"), "tenure": 48, "fee": Decimal("499.00")},
    {"rate": Decimal("12.75"), "tenure": 60, "fee": Decimal("599.00")},
    {"rate": Decimal("13.00"), "tenure": 36, "fee": Decimal("699.00")},
]


def get_eligibility(application):
    income = Decimal(str(application.monthly_income))
    requested_amount = Decimal(str(application.requested_amount))

    result = calculate_max_eligible_loan(
        monthly_income=income,
        loan_type=application.purpose
    )

    if not result["eligible"]:
        raise HTTPException(
            status_code=422,
            detail=result["reason"]
        )

    maximum_amount = result["maximum_eligible_amount"]

    if requested_amount > maximum_amount:
        raise HTTPException(
            status_code=422,
            detail=(
                f"Requested amount exceeds your estimated maximum eligibility "
                f"of ₹{maximum_amount:,.2f}."
            )
        )

    return min(requested_amount, maximum_amount)


def serialize_offer(offer: LoanOffer, db: Session):
    lender = db.query(Lender).filter(
        Lender.id == offer.lender_id
    ).first()

    return {
        "id": offer.id,
        "application_id": offer.application_id,
        "lender_id": offer.lender_id,
        "lender_name": (
            lender.lender_name
            if lender
            else f"Demo Lender {offer.lender_id}"
        ),
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
        raise HTTPException(
            status_code=404,
            detail="Application not found."
        )

    if application.status in (
        "CANCELLED",
        "REJECTED",
        "APPROVED"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot retrieve offers because application "
                f"status is {application.status}."
            ),
        )

    eligible_amount = get_eligibility(application)

    offers = (
        db.query(LoanOffer)
        .filter(
            LoanOffer.application_id == application_id
        )
        .all()
    )

    if application.status == "UNDER_REVIEW" and not offers:

        # Only lenders with recorded user consent
        consented_lenders = (
            db.query(Lender)
            .join(
                ConsentRecord,
                ConsentRecord.lender_id == Lender.id
            )
            .filter(
                ConsentRecord.application_id == application_id,
                ConsentRecord.user_id == user_id,
                Lender.is_active.is_(True),
                Lender.integration_status == "CONNECTED",
            )
            .order_by(Lender.id.asc())
            .distinct()
            .limit(15)
            .all()
        )

        if not consented_lenders:
            return []

        for index, lender in enumerate(consented_lenders):

            terms = OFFER_TERMS[index]

            offered_amount = min(
                Decimal(str(application.requested_amount)),
                eligible_amount
            )

            offered_amount = offered_amount.quantize(
                Decimal("0.01"),
                rounding=ROUND_HALF_UP
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

        old_status = application.status
        application.status = "OFFER_AVAILABLE"

        db.add(
            ApplicationStatusHistory(
                application_id=application.id,
                old_status=old_status,
                new_status="OFFER_AVAILABLE",
                note="Simulated lender offers generated"
            )
        )

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise

        offers = (
            db.query(LoanOffer)
            .filter(
                LoanOffer.application_id == application_id
            )
            .all()
        )

    return [
        serialize_offer(offer, db)
        for offer in offers
        if Decimal(str(offer.offered_amount)) <= eligible_amount
    ]


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
        raise HTTPException(
            status_code=404,
            detail="Offer not found."
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
            detail="Offer not found for this user."
        )

    if application.status in (
        "CANCELLED",
        "REJECTED",
        "APPROVED"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot select an offer because application "
                f"status is {application.status}."
            ),
        )

    eligible_amount = get_eligibility(application)

    if Decimal(str(offer.offered_amount)) > eligible_amount:
        raise HTTPException(
            status_code=400,
            detail="This offer exceeds your current eligibility limit."
        )

    if offer.valid_until <= datetime.utcnow():
        offer.status = "EXPIRED"
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="This offer has expired."
        )

    if offer.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"This offer cannot be selected because its status is {offer.status}."
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
            detail="An offer has already been selected for this application."
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
            detail="Offer not found."
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
            detail="Offer not found for this user."
        )

    if application.status in (
        "CANCELLED",
        "REJECTED",
        "APPROVED"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Cannot reject an offer because application "
                f"status is {application.status}."
            ),
        )

    if offer.status != "PENDING":
        raise HTTPException(
            status_code=400,
            detail=f"This offer cannot be rejected because its status is {offer.status}."
        )

    offer.status = "REJECTED"

    db.commit()
    db.refresh(offer)

    return serialize_offer(offer, db)