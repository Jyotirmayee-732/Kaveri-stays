from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_account, require_roles

from app.schemas import (
    BookingCreateRequest,
    BookingResponse,
    BookingListResponse,
    BookingDetailResponse,
    BookingStatusUpdateRequest,
)

from app.exceptions import handle_integrity_error


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"]
)


# ============================================================
# GET /bookings
# ============================================================

@router.get(
    "",
    response_model=BookingListResponse
)
def list_bookings(
    property_id: int | None = None,
    status_filter: str | None = Query(
        None,
        alias="status"
    ),
    from_date: date | None = Query(
        None,
        alias="from"
    ),
    to_date: date | None = Query(
        None,
        alias="to"
    ),
    guest_id: int | None = None,
    sort: str = Query(
        "created_at"
    ),
    limit: int = Query(
        25,
        ge=1,
        le=100
    ),
    offset: int = Query(
        0,
        ge=0
    ),
    account=Depends(get_current_account),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Authorization / data scoping
    # --------------------------------------------------------

    if account.role == "guest":

        guest_row = db.execute(
            text("""
                SELECT guest_id
                FROM accounts
                WHERE account_id = :account_id
            """),
            {
                "account_id": int(account.account_id)
            }
        ).fetchone()

        if not guest_row or guest_row.guest_id is None:
            raise HTTPException(
                status_code=403,
                detail="Guest account is not linked to a guest"
            )

        # Guests can see only their own bookings.
        conditions = [
            "b.guest_id = :current_guest_id"
        ]

        params = {
            "limit": limit,
            "offset": offset,
            "current_guest_id": guest_row.guest_id
        }

    elif account.role in ("staff", "manager"):

        # Staff and managers can see only bookings
        # belonging to their assigned property.
        if account.property_id is None:
            raise HTTPException(
                status_code=403,
                detail="Account is not assigned to a property"
            )

        conditions = [
            "r.property_id = :current_property_id"
        ]

        params = {
            "limit": limit,
            "offset": offset,
            "current_property_id": account.property_id
        }

    elif account.role == "owner":

        # Owner can see bookings across all properties.
        conditions = []

        params = {
            "limit": limit,
            "offset": offset
        }

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to access booking records"
        )


    # --------------------------------------------------------
    # 2. Sort whitelist
    # --------------------------------------------------------

    allowed_sort_fields = {
        "created_at": "b.created_at",
        "booking_id": "b.booking_id",
        "guest_id": "b.guest_id",
        "room_id": "b.room_id",
        "status": "b.status"
    }


    if sort not in allowed_sort_fields:
        raise HTTPException(
            status_code=422,
            detail="Invalid sort field"
        )


    order_by = allowed_sort_fields[sort]


    # --------------------------------------------------------
    # 3. Build filters
    # --------------------------------------------------------


    if property_id is not None:

        conditions.append(
            "r.property_id = :property_id"
        )

        params["property_id"] = property_id


    if status_filter is not None:

        allowed_statuses = {
            "confirmed",
            "checked_in",
            "checked_out",
            "cancelled",
            "no_show"
        }

        if status_filter not in allowed_statuses:
            raise HTTPException(
                status_code=422,
                detail="Invalid booking status"
            )

        conditions.append(
            "b.status = :status"
        )

        params["status"] = status_filter

    if guest_id is not None:

        conditions.append(
            "b.guest_id = :guest_id"
        )

        params["guest_id"] = guest_id


    if from_date is not None:

        conditions.append(
            "b.check_out > :from_date"
        )

        params["from_date"] = from_date


    if to_date is not None:

        conditions.append(
            "b.check_in < :to_date"
        )

        params["to_date"] = to_date


    where_clause = ""


    if conditions:

        where_clause = (
            "WHERE " +
            " AND ".join(conditions)
        )


    # --------------------------------------------------------
    # 4. Get bookings
    # --------------------------------------------------------

    query = text(
        f"""
        SELECT
            b.booking_id,
            b.guest_id,
            b.room_id,
            r.property_id,
            b.check_in,
            b.check_out,
            b.guest_count,
            b.status,
            b.created_at

        FROM bookings b

        JOIN rooms r
            ON r.room_id = b.room_id

        {where_clause}

        ORDER BY {order_by}

        LIMIT :limit
        OFFSET :offset
        """
    )


    rows = db.execute(
        query,
        params
    ).fetchall()


    # --------------------------------------------------------
    # 5. Total count
    # --------------------------------------------------------

    count_query = text(
        f"""
        SELECT COUNT(*)

        FROM bookings b

        JOIN rooms r
            ON r.room_id = b.room_id

        {where_clause}
        """
    )


    total = db.execute(
        count_query,
        params
    ).scalar()


    # --------------------------------------------------------
    # 6. Format response
    # --------------------------------------------------------

    items = []


    for row in rows:

        items.append({
            "booking_id": row.booking_id,
            "guest_id": row.guest_id,
            "room_id": row.room_id,
            "property_id": row.property_id,
            "check_in": row.check_in,
            "check_out": row.check_out,
            "guest_count": row.guest_count,
            "status": row.status,
            "created_at": row.created_at
        })


    return {
        "items": items,
        "meta": {
            "limit": limit,
            "offset": offset,
            "total": total
        }
    }


# ============================================================
# POST /bookings
# ============================================================

@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        401: {
            "description": "Authentication required"
        },
        403: {
            "description": "Not authorized to create a booking"
        },
        409: {
            "description": "Room is not available or referenced data does not exist"
        },
        422: {
            "description": "Validation error"
        }
    }
)
def create_booking(
    booking: BookingCreateRequest,
    account=Depends(get_current_account),
    db: Session = Depends(get_db)
):

    try:

        # ----------------------------------------------------
        # 1. Get logged-in account
        # ----------------------------------------------------

        account_row = db.execute(
            text(
                """
                SELECT
                    account_id,
                    guest_id,
                    role

                FROM accounts

                WHERE account_id = :account_id
                """
            ),
            {
                "account_id": int(account.account_id)
            }
        ).fetchone()


        if not account_row:

            raise HTTPException(
                status_code=401,
                detail="Account not found"
            )


        # ----------------------------------------------------
        # 2. Get guest_id
        # ----------------------------------------------------

        if account_row.guest_id is None:

            raise HTTPException(
                status_code=403,
                detail="Only guests can create bookings"
            )


        guest_id = account_row.guest_id


        # ----------------------------------------------------
        # 3. Validate dates
        # ----------------------------------------------------

        if booking.check_out <= booking.check_in:

            raise HTTPException(
                status_code=422,
                detail="check_out must be after check_in"
            )


        # ----------------------------------------------------
        # 4. Check room + maximum occupancy
        # ----------------------------------------------------

        room = db.execute(
            text(
                """
                SELECT
                    r.room_id,
                    r.property_id,
                    r.room_type_id,
                    rt.max_occupancy

                FROM rooms r

                JOIN room_types rt
                    ON rt.room_type_id = r.room_type_id

                WHERE r.room_id = :room_id
                """
            ),
            {
                "room_id": booking.room_id
            }
        ).fetchone()


        if not room:

            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )


        if booking.guest_count > room.max_occupancy:

            raise HTTPException(
                status_code=422,
                detail="Guest count exceeds maximum occupancy"
            )


        # ----------------------------------------------------
        # 5. Check room availability
        # ----------------------------------------------------

        conflict = db.execute(
            text(
                """
                SELECT booking_id

                FROM bookings

                WHERE room_id = :room_id

                  AND status IN (
                      'confirmed',
                      'checked_in',
                      'checked_out'
                  )

                  AND check_in < :check_out
                  AND check_out > :check_in

                LIMIT 1
                """
            ),
            {
                "room_id": booking.room_id,
                "check_in": booking.check_in,
                "check_out": booking.check_out
            }
        ).fetchone()


        if conflict:

            raise HTTPException(
                status_code=409,
                detail="That room is not available for the requested dates"
            )


        # ----------------------------------------------------
        # 6. Create booking
        # ----------------------------------------------------

        new_booking = db.execute(
            text(
                """
                INSERT INTO bookings (
                    guest_id,
                    room_id,
                    check_in,
                    check_out,
                    guest_count,
                    status
                )

                VALUES (
                    :guest_id,
                    :room_id,
                    :check_in,
                    :check_out,
                    :guest_count,
                    'confirmed'
                )

                RETURNING
                    booking_id,
                    guest_id,
                    room_id,
                    check_in,
                    check_out,
                    guest_count,
                    status,
                    created_at
                """
            ),
            {
                "guest_id": guest_id,
                "room_id": booking.room_id,
                "check_in": booking.check_in,
                "check_out": booking.check_out,
                "guest_count": booking.guest_count
            }
        ).fetchone()


        # ----------------------------------------------------
        # 7. Record optional deposit
        #
        # IMPORTANT:
        # This payment INSERT is part of the SAME transaction
        # as the booking INSERT.
        # ----------------------------------------------------

        if booking.deposit is not None:

            db.execute(
                text(
                    """
                    INSERT INTO payments (
                        booking_id,
                        payment_date,
                        amount,
                        payment_method
                    )

                    VALUES (
                        :booking_id,
                        CURRENT_DATE,
                        :amount,
                        :payment_method
                    )
                    """
                ),
                {
                    "booking_id": new_booking.booking_id,
                    "amount": booking.deposit.amount,
                    "payment_method": booking.deposit.method
                }
            )


        # ----------------------------------------------------
        # 8. ONE COMMIT
        #
        # Transaction boundary:
        #
        #   INSERT booking
        #          +
        #   INSERT payment
        #          ↓
        #       COMMIT
        #
        # If payment INSERT fails, exception handling below
        # executes ROLLBACK, so the booking is also undone.
        # ----------------------------------------------------

        db.commit()


        # ----------------------------------------------------
        # 9. Return booking
        # ----------------------------------------------------

        return {
            "message": "Booking created successfully",
            "booking_id": new_booking.booking_id,
            "guest_id": new_booking.guest_id,
            "room_id": new_booking.room_id,
            "check_in": new_booking.check_in,
            "check_out": new_booking.check_out,
            "guest_count": new_booking.guest_count,
            "status": new_booking.status
        }


    # ========================================================
    # TRANSACTION ERROR HANDLING
    # ========================================================

    except HTTPException:

        db.rollback()
        raise


    except IntegrityError as exc:

        db.rollback()

        handle_integrity_error(exc)


    except Exception:

        db.rollback()
        raise


# ============================================================
# PATCH /bookings/{booking_id}/status
# ============================================================

@router.patch(
    "/{booking_id}/status"
)
def update_booking_status(
    booking_id: int,
    request: BookingStatusUpdateRequest,
    account=Depends(
        require_roles("staff", "manager", "owner")
    ),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Validate requested status
    # --------------------------------------------------------

    allowed_statuses = {
        "confirmed",
        "checked_in",
        "checked_out",
        "cancelled",
        "no_show"
    }


    if request.status not in allowed_statuses:

        raise HTTPException(
            status_code=422,
            detail="Invalid booking status"
        )


    # --------------------------------------------------------
    # 2. Get booking
    # --------------------------------------------------------

    booking_row = db.execute(
        text(
            """
            SELECT
                b.booking_id,
                b.guest_id,
                b.room_id,
                r.property_id,
                b.check_in,
                b.check_out,
                b.guest_count,
                b.status

            FROM bookings b

            JOIN rooms r
                ON r.room_id = b.room_id

            WHERE b.booking_id = :booking_id
            """
        ),
        {
            "booking_id": booking_id
        }
    ).fetchone()


    if not booking_row:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # Property scope
    # --------------------------------------------------------

    if account.role in ("staff", "manager"):

        if account.property_id != booking_row.property_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this property"
            )


    current_status = booking_row.status
    new_status = request.status


    # --------------------------------------------------------
    # 3. Get current account
    # --------------------------------------------------------

    account_row = db.execute(
        text(
            """
            SELECT
                account_id,
                guest_id,
                role,
                property_id

            FROM accounts

            WHERE account_id = :account_id
            """
        ),
        {
            "account_id": int(account.account_id)
        }
    ).fetchone()


    if not account_row:

        raise HTTPException(
            status_code=401,
            detail="Account not found"
        )


    current_role = account_row.role
    current_guest_id = account_row.guest_id


    # --------------------------------------------------------
    # 4. Authorization
    #
    # Guest:
    #   - may cancel ONLY their own booking
    #
    # Staff:
    #   - may check anyone in
    #   - may check anyone out
    #   - may cancel
    #   - may mark no-show
    #
    # Manager / owner:
    #   - may perform non-check-in staff transitions
    # --------------------------------------------------------

    if new_status == "cancelled":

        if current_role == "guest":

            if current_guest_id != booking_row.guest_id:

                raise HTTPException(
                    status_code=403,
                    detail="You can only cancel your own booking"
                )


        elif current_role not in (
            "staff",
            "manager",
            "owner"
        ):

            raise HTTPException(
                status_code=403,
                detail="You do not have permission to cancel this booking"
            )


    elif new_status == "checked_in":

        # Only staff may check anyone in.

        if current_role != "staff":

            raise HTTPException(
                status_code=403,
                detail="Only staff may check a guest in"
            )


    elif new_status in (
        "checked_out",
        "no_show"
    ):

        if current_role not in (
            "staff",
            "manager",
            "owner"
        ):

            raise HTTPException(
                status_code=403,
                detail="Only staff may perform this booking transition"
            )


    else:

        # Prevent guests from performing any other
        # administrative status transition.

        if current_role not in (
            "staff",
            "manager",
            "owner"
        ):

            raise HTTPException(
                status_code=403,
                detail="You do not have permission to perform this transition"
            )


    # --------------------------------------------------------
    # 5. State machine
    #
    # confirmed -> checked_in
    # confirmed -> cancelled
    # confirmed -> no_show
    #
    # checked_in -> checked_out
    #
    # Everything else is illegal.
    # --------------------------------------------------------

    allowed_transitions = {

        "confirmed": {
            "checked_in",
            "cancelled",
            "no_show"
        },

        "checked_in": {
            "checked_out"
        },

        "checked_out": set(),

        "cancelled": set(),

        "no_show": set()
    }


    if new_status not in allowed_transitions.get(
        current_status,
        set()
    ):

        raise HTTPException(
            status_code=409,
            detail=(
                f"Illegal booking status transition: "
                f"{current_status} -> {new_status}"
            )
        )


    # --------------------------------------------------------
    # 6. Update status
    # --------------------------------------------------------

    updated_booking = db.execute(
        text(
            """
            UPDATE bookings

            SET status = :new_status

            WHERE booking_id = :booking_id

            RETURNING
                booking_id,
                guest_id,
                room_id,
                check_in,
                check_out,
                guest_count,
                status
            """
        ),
        {
            "booking_id": booking_id,
            "new_status": new_status
        }
    ).fetchone()


    db.commit()


    # --------------------------------------------------------
    # 7. Return result
    # --------------------------------------------------------

    return {
        "message": "Booking status updated successfully",
        "booking_id": updated_booking.booking_id,
        "guest_id": updated_booking.guest_id,
        "room_id": updated_booking.room_id,
        "check_in": updated_booking.check_in,
        "check_out": updated_booking.check_out,
        "guest_count": updated_booking.guest_count,
        "status": updated_booking.status
    }


# ============================================================
# GET /bookings/{booking_id}
# ============================================================

@router.get(
    "/{booking_id}",
    response_model=BookingDetailResponse
)
def get_booking(
    booking_id: int,
    account=Depends(get_current_account),
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # 1. Get booking + property
    # --------------------------------------------------------

    row = db.execute(
        text("""
            SELECT
                b.booking_id,
                b.guest_id,
                b.room_id,
                r.property_id,
                b.check_in,
                b.check_out,
                b.guest_count,
                b.status,
                b.created_at

            FROM bookings b

            JOIN rooms r
                ON r.room_id = b.room_id

            WHERE b.booking_id = :booking_id
        """),
        {
            "booking_id": booking_id
        }
    ).fetchone()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # 2. Authorization / scope
    # --------------------------------------------------------

    if account.role == "guest":

        guest_row = db.execute(
            text("""
                SELECT guest_id
                FROM accounts
                WHERE account_id = :account_id
            """),
            {
                "account_id": int(account.account_id)
            }
        ).fetchone()

        if (
            not guest_row
            or guest_row.guest_id is None
            or guest_row.guest_id != row.guest_id
        ):
            # Do not reveal whether another guest's booking exists.
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )

    elif account.role in ("staff", "manager"):

        if account.property_id != row.property_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this property"
            )

    elif account.role == "owner":
        # Owner can access bookings across all properties.
        pass

    else:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this booking"
        )

    # --------------------------------------------------------
    # 3. Return booking
    # --------------------------------------------------------

    return {
        "booking_id": row.booking_id,
        "guest_id": row.guest_id,
        "room_id": row.room_id,
        "check_in": row.check_in,
        "check_out": row.check_out,
        "guest_count": row.guest_count,
        "status": row.status,
        "created_at": row.created_at
    }
