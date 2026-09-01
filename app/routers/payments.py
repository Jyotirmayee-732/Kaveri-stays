from decimal import Decimal
from threading import Lock
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_account, require_roles
from app.schemas import (
    PaymentCreateRequest,
    PaymentResponse,
    PaymentListResponse,
)


router = APIRouter(
    prefix="/bookings",
    tags=["Payments"]
)


# ============================================================
# IDEMPOTENCY STORE
# ============================================================

idempotency_store = {}
idempotency_lock = Lock()


# ============================================================
# HELPER — CALCULATE BOOKING TOTAL
# ============================================================

def get_booking_total(
    booking_id: int,
    db: Session
) -> Decimal:

    rows = db.execute(
        text("""
            SELECT
                days.day::date AS stay_date,
                rp.nightly_rate

            FROM bookings b

            JOIN rooms r
                ON r.room_id = b.room_id

            CROSS JOIN generate_series(
                b.check_in,
                b.check_out - 1,
                INTERVAL '1 day'
            ) AS days(day)

            LEFT JOIN rate_plans rp
                ON rp.property_id = r.property_id
                AND rp.room_type_id = r.room_type_id
                AND rp.start_date <= days.day::date
                AND rp.end_date >= days.day::date

            WHERE b.booking_id = :booking_id

            ORDER BY days.day
        """),
        {
            "booking_id": booking_id
        }
    ).fetchall()


    # --------------------------------------------------------
    # Booking not found
    # --------------------------------------------------------

    if not rows:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # --------------------------------------------------------
    # Every night must have a rate plan
    # --------------------------------------------------------

    for row in rows:

        if row.nightly_rate is None:

            raise HTTPException(
                status_code=409,
                detail=(
                    "No rate plan is available for "
                    f"booking date {row.stay_date}"
                )
            )


    # --------------------------------------------------------
    # Calculate total
    # --------------------------------------------------------

    total = Decimal("0.00")

    for row in rows:

        total += Decimal(
            str(row.nightly_rate)
        )


    return total


# ============================================================
# GET /bookings/{booking_id}/payments
# ============================================================

@router.get(
    "/{booking_id}/payments",
    response_model=PaymentListResponse
)
def list_payments(
    booking_id: int,
    account=Depends(get_current_account),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Find booking
    # --------------------------------------------------------

    booking = db.execute(
        text("""
            SELECT
                b.booking_id,
                b.guest_id,
                r.property_id
            FROM bookings b
            JOIN rooms r
                ON r.room_id = b.room_id
            WHERE b.booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchone()


    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # --------------------------------------------------------
    # 2. Find current account
    # --------------------------------------------------------

    account_row = db.execute(
        text("""
            SELECT
                guest_id,
                role,
                property_id
            FROM accounts
            WHERE account_id = :account_id
        """),
        {
            "account_id": int(account.account_id)
        }
    ).fetchone()


    if not account_row:

        raise HTTPException(
            status_code=401,
            detail="Account not found"
        )


    # --------------------------------------------------------
    # 3. Authorization
    # --------------------------------------------------------

    if account_row.role == "guest":

        if account_row.guest_id != booking.guest_id:

            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )

    elif account_row.role in ("staff", "manager"):

        if account_row.property_id != booking.property_id:

            raise HTTPException(
                status_code=403,
                detail="You do not have access to this property"
            )

    elif account_row.role == "owner":
        pass

    else:

        raise HTTPException(
            status_code=403,
            detail="You do not have access to payment records"
        )


    # --------------------------------------------------------
    # 4. Get payments
    # --------------------------------------------------------

    rows = db.execute(
        text("""
            SELECT
                payment_id,
                booking_id,
                payment_date,
                amount,
                payment_method,
                notes

            FROM payments

            WHERE booking_id = :booking_id

            ORDER BY payment_date, payment_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchall()


    # --------------------------------------------------------
    # 5. Calculate total paid
    # --------------------------------------------------------

    total_paid = db.execute(
        text("""
            SELECT COALESCE(
                SUM(amount),
                0
            )

            FROM payments

            WHERE booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).scalar()


    total_paid = Decimal(
        str(total_paid)
    )


    # --------------------------------------------------------
    # 6. Calculate booking total
    # --------------------------------------------------------

    booking_total = get_booking_total(
        booking_id,
        db
    )


    balance = booking_total - total_paid


    # --------------------------------------------------------
    # 7. Build response
    # --------------------------------------------------------

    items = []


    for row in rows:

        items.append({
            "id": row.payment_id,
            "booking_id": row.booking_id,
            "amount": (
                f"{Decimal(str(row.amount)):.2f}"
            ),
            "method": row.payment_method,
            "reference": row.notes,
            "paid_at": row.payment_date
        })


    return {
        "items": items,
        "total_paid": f"{total_paid:.2f}",
        "balance": f"{balance:.2f}"
    }


# ============================================================
# POST /bookings/{booking_id}/payments
# ============================================================

@router.post(
    "/{booking_id}/payments",
    response_model=PaymentResponse,
    status_code=201
)
def create_payment(
    booking_id: int,
    payment: PaymentCreateRequest,
    response: Response,
    idempotency_key: UUID = Header(
        ...,
        alias="Idempotency-Key"
    ),
    account=Depends(require_roles("guest")),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Validate amount
    # --------------------------------------------------------

    amount = Decimal(
        str(payment.amount)
    ).quantize(
        Decimal("0.01")
    )


    # --------------------------------------------------------
    # 2. Validate payment method
    # --------------------------------------------------------

    method = payment.method.strip().lower()


    allowed_methods = {
        "card",
        "upi",
        "bank_transfer",
        "cash"
    }


    if method not in allowed_methods:

        raise HTTPException(
            status_code=422,
            detail="Invalid payment method"
        )


    # --------------------------------------------------------
    # 3. Find booking
    # --------------------------------------------------------

    booking = db.execute(
        text("""
            SELECT
                booking_id,
                guest_id
            FROM bookings
            WHERE booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchone()


    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # --------------------------------------------------------
    # 4. Find current account
    # --------------------------------------------------------

    account_row = db.execute(
        text("""
            SELECT
                guest_id,
                role,
                property_id
            FROM accounts
            WHERE account_id = :account_id
        """),
        {
            "account_id": int(account.account_id)
        }
    ).fetchone()


    if not account_row:

        raise HTTPException(
            status_code=401,
            detail="Account not found"
        )


    # --------------------------------------------------------
    # 5. Authorization
    # --------------------------------------------------------

    if account_row.guest_id != booking.guest_id:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )


    # --------------------------------------------------------
    # 6. Idempotency
    # --------------------------------------------------------

    key = (
        booking_id,
        str(idempotency_key)
    )


    with idempotency_lock:

        existing = idempotency_store.get(key)


        if existing:

            # ------------------------------------------------
            # Same key + same request
            # ------------------------------------------------

            if (
                existing["amount"] == amount
                and existing["method"] == method
                and existing["reference"] == payment.reference
            ):

                existing_payment = db.execute(
                    text("""
                        SELECT
                            payment_id,
                            booking_id,
                            payment_date,
                            amount,
                            payment_method,
                            notes

                        FROM payments

                        WHERE payment_id = :payment_id
                    """),
                    {
                        "payment_id": existing["payment_id"]
                    }
                ).fetchone()


                if existing_payment:

                    response.status_code = 200


                    return {
                        "id": existing_payment.payment_id,
                        "booking_id": existing_payment.booking_id,
                        "amount": (
                            f"{Decimal(str(existing_payment.amount)):.2f}"
                        ),
                        "method": existing_payment.payment_method,
                        "reference": existing_payment.notes,
                        "paid_at": existing_payment.payment_date
                    }


            # ------------------------------------------------
            # Same key + different request
            # ------------------------------------------------

            raise HTTPException(
                status_code=409,
                detail=(
                    "Idempotency key was already used "
                    "with a different payment"
                )
            )


        # ----------------------------------------------------
        # 7. Calculate booking total
        # ----------------------------------------------------

        booking_total = get_booking_total(
            booking_id,
            db
        )


        # ----------------------------------------------------
        # 8. Get already paid amount
        # ----------------------------------------------------

        already_paid = db.execute(
            text("""
                SELECT COALESCE(
                    SUM(amount),
                    0
                )

                FROM payments

                WHERE booking_id = :booking_id
            """),
            {
                "booking_id": booking_id
            }
        ).scalar()


        already_paid = Decimal(
            str(already_paid)
        )


        # ----------------------------------------------------
        # 9. Prevent overpayment
        # ----------------------------------------------------

        if already_paid + amount > booking_total:

            raise HTTPException(
                status_code=409,
                detail=(
                    "Payment would exceed "
                    "the booking total"
                )
            )


        # ----------------------------------------------------
        # 10. Insert payment
        # ----------------------------------------------------

        new_payment = db.execute(
            text("""
                INSERT INTO payments (
                    booking_id,
                    payment_date,
                    amount,
                    payment_method,
                    notes
                )

                VALUES (
                    :booking_id,
                    CURRENT_DATE,
                    :amount,
                    :payment_method,
                    :notes
                )

                RETURNING
                    payment_id,
                    booking_id,
                    payment_date,
                    amount,
                    payment_method,
                    notes
            """),
            {
                "booking_id": booking_id,
                "amount": amount,
                "payment_method": method,
                "notes": payment.reference
            }
        ).fetchone()


        # ----------------------------------------------------
        # 11. Commit
        # ----------------------------------------------------

        db.commit()


        # ----------------------------------------------------
        # 12. Save idempotency result
        # ----------------------------------------------------

        idempotency_store[key] = {
            "amount": amount,
            "method": method,
            "reference": payment.reference,
            "payment_id": new_payment.payment_id
        }


        # ----------------------------------------------------
        # 13. Return
        # ----------------------------------------------------

        response.status_code = 201


        return {
            "id": new_payment.payment_id,
            "booking_id": new_payment.booking_id,
            "amount": (
                f"{Decimal(str(new_payment.amount)):.2f}"
            ),
            "method": new_payment.payment_method,
            "reference": new_payment.notes,
            "paid_at": new_payment.payment_date
        }