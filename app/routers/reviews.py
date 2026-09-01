from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_account


router = APIRouter(
    prefix="/bookings",
    tags=["Reviews"]
)


# ============================================================
# REVIEW REQUEST
# ============================================================

class ReviewCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rating: int = Field(..., ge=1, le=5)
    comments: str | None = None


# ============================================================
# POST /bookings/{booking_id}/review
# ============================================================

@router.post("/{booking_id}/review")
def create_review(
    booking_id: int,
    request: ReviewCreateRequest,
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    """
    Create a review for a completed booking.

    Only the guest who owns the booking may review it.
    A review is allowed only after the booking has been checked out.
    """

    # --------------------------------------------------------
    # 1. Get booking
    # --------------------------------------------------------

    booking = db.execute(
        text("""
            SELECT
                b.booking_id,
                b.guest_id,
                b.status
            FROM bookings b
            WHERE b.booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchone()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # 2. Get current account's guest_id
    # --------------------------------------------------------

    account = db.execute(
        text("""
            SELECT
                account_id,
                guest_id,
                role
            FROM accounts
            WHERE account_id = :account_id
        """),
        {
            "account_id": current_account.account_id
        }
    ).fetchone()

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found"
        )

    # --------------------------------------------------------
    # 3. Only the booking owner can review
    # --------------------------------------------------------

    if account.guest_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only guests can submit reviews"
        )

    if account.guest_id != booking.guest_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this booking"
        )

    # --------------------------------------------------------
    # 4. Booking must be completed
    # --------------------------------------------------------

    if booking.status != "checked_out":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reviews are allowed only after checkout"
        )

    # --------------------------------------------------------
    # 5. Check whether a review already exists
    # --------------------------------------------------------

    existing_review = db.execute(
        text("""
            SELECT review_id
            FROM reviews
            WHERE booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchone()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A review already exists for this booking"
        )

    # --------------------------------------------------------
    # 6. Create review
    # --------------------------------------------------------

    review = db.execute(
        text("""
            INSERT INTO reviews (
                booking_id,
                rating,
                comments
            )
            VALUES (
                :booking_id,
                :rating,
                :comments
            )
            RETURNING
                review_id,
                booking_id,
                rating,
                comments,
                reviewed_at
        """),
        {
            "booking_id": booking_id,
            "rating": request.rating,
            "comments": request.comments
        }
    ).fetchone()

    db.commit()

    return {
        "message": "Review created successfully",
        "review_id": review.review_id,
        "booking_id": review.booking_id,
        "rating": review.rating,
        "comments": review.comments,
        "reviewed_at": review.reviewed_at
    }