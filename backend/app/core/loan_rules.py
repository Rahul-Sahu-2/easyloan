
from decimal import Decimal, ROUND_HALF_UP


# Demo assumptions, not actual bank policies.
MINIMUM_MONTHLY_INCOME = Decimal("5000")
MAX_EMI_TO_INCOME_RATIO = Decimal("0.35")

LOAN_RULES = {
    "Personal Loan": {
        "max_limit": Decimal("1000000"),
        "interest_rate": Decimal("18.00"),
        "max_tenure_months": 60,
    },
    "Home Loan": {
        "max_limit": Decimal("10000000"),
        "interest_rate": Decimal("9.00"),
        "max_tenure_months": 240,
    },
    "Car Loan": {
        "max_limit": Decimal("3000000"),
        "interest_rate": Decimal("11.00"),
        "max_tenure_months": 84,
    },
    "Business Loan": {
        "max_limit": Decimal("5000000"),
        "interest_rate": Decimal("16.00"),
        "max_tenure_months": 60,
    },
    "Education Loan": {
        "max_limit": Decimal("3000000"),
        "interest_rate": Decimal("10.50"),
        "max_tenure_months": 120,
    },
    "Gold Loan": {
        "max_limit": Decimal("2000000"),
        "interest_rate": Decimal("12.00"),
        "max_tenure_months": 36,
    },
    "Two Wheeler Loan": {
        "max_limit": Decimal("300000"),
        "interest_rate": Decimal("14.00"),
        "max_tenure_months": 48,
    },
    "Medical Loan": {
        "max_limit": Decimal("1000000"),
        "interest_rate": Decimal("14.00"),
        "max_tenure_months": 60,
    },
    "Travel Loan": {
        "max_limit": Decimal("500000"),
        "interest_rate": Decimal("16.00"),
        "max_tenure_months": 36,
    },
    "Marriage Loan": {
        "max_limit": Decimal("1000000"),
        "interest_rate": Decimal("16.00"),
        "max_tenure_months": 60,
    },
}


def calculate_max_eligible_loan(
    monthly_income: Decimal,
    loan_type: str,
):
    """
    Calculates a preliminary demo loan limit using monthly income.

    Maximum affordable EMI = 35% of monthly income.
    Loan amount is calculated using the category interest rate
    and maximum tenure, then capped by the category limit.
    """

    income = Decimal(str(monthly_income))

    if income < MINIMUM_MONTHLY_INCOME:
        return {
            "eligible": False,
            "reason": "Minimum monthly income must be ₹5,000.",
            "loan_type": loan_type,
            "monthly_income": income,
            "maximum_affordable_emi": Decimal("0.00"),
            "maximum_eligible_amount": Decimal("0.00"),
            "category_max_limit": Decimal("0.00"),
            "interest_rate": None,
            "max_tenure_months": None,
        }

    rules = LOAN_RULES.get(loan_type)

    if not rules:
        raise ValueError(
            f"Unsupported loan type: {loan_type}. "
            f"Available types: {', '.join(LOAN_RULES.keys())}"
        )

    monthly_emi = (
        income * MAX_EMI_TO_INCOME_RATIO
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    annual_rate = rules["interest_rate"]
    monthly_rate = float(annual_rate / Decimal("1200"))
    months = rules["max_tenure_months"]

    # Present value formula for a reducing-balance EMI loan.
    rate_factor = (1 + monthly_rate) ** months

    calculated_amount = float(monthly_emi) * (
        (rate_factor - 1) /
        (monthly_rate * rate_factor)
    )

    calculated_amount = Decimal(
        str(calculated_amount)
    ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    # Final amount cannot exceed the category's demo limit.
    eligible_amount = min(
        calculated_amount,
        rules["max_limit"],
    )

    return {
        "eligible": eligible_amount > 0,
        "reason": "Preliminary income-based eligibility calculated.",
        "loan_type": loan_type,
        "monthly_income": income,
        "maximum_affordable_emi": monthly_emi,
        "maximum_eligible_amount": eligible_amount,
        "category_max_limit": rules["max_limit"],
        "interest_rate": annual_rate,
        "max_tenure_months": months,
    }
