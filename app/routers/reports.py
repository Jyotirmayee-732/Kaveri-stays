from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import require_roles
from app.schemas import (
    OccupancyResponse,
    ADRResponse,
    RevPARResponse
)


router = APIRouter(
    prefix="/properties",
    tags=["Reports"]
)


# ============================================================
# PROPERTY ACCESS CHECK
# ============================================================

def check_property_access(
    property_id: int,
    account,
    db: Session
):
    # --------------------------------------------------------
    # 1. Check property exists
    # --------------------------------------------------------

    property_exists = db.execute(
        text("""
            SELECT 1
            FROM properties
            WHERE property_id = :property_id
        """),
        {
            "property_id": property_id
        }
    ).fetchone()

    if not property_exists:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    # --------------------------------------------------------
    # 2. Check property authorization
    # --------------------------------------------------------

    # Staff and managers can access only
    # their assigned property.

    if account.role in ("staff", "manager"):

        if account.property_id != property_id:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this property"
            )

    # Owners can access all properties.


# ============================================================
# OCCUPANCY REPORT
# ============================================================

@router.get(
    "/{property_id}/reports/occupancy",
    response_model=OccupancyResponse
)
def get_occupancy(
    property_id: int,

    from_date: date = Query(
        ...,
        alias="from"
    ),

    to_date: date = Query(
        ...,
        alias="to"
    ),

    account=Depends(
        require_roles("staff", "manager", "owner")
    ),

    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # 1. Validate date range
    # --------------------------------------------------------

    if to_date <= from_date:
        raise HTTPException(
            status_code=422,
            detail="to must be strictly after from"
        )

    # --------------------------------------------------------
    # 2. Check property access
    # --------------------------------------------------------

    check_property_access(
        property_id,
        account,
        db
    )

    # --------------------------------------------------------
    # 3. Calculate occupancy
    # --------------------------------------------------------

    row = db.execute(
        text("""
            SELECT
                COUNT(*) AS total_rooms,

                COUNT(*) FILTER (
                    WHERE r.room_id IN (
                        SELECT b.room_id
                        FROM bookings b
                        WHERE b.status NOT IN (
                            'cancelled',
                            'no_show'
                        )
                        AND b.check_in < :to_date
                        AND b.check_out > :from_date
                    )
                ) AS occupied_rooms

            FROM rooms r

            WHERE r.property_id = :property_id
        """),
        {
            "property_id": property_id,
            "from_date": from_date,
            "to_date": to_date
        }
    ).fetchone()

    # --------------------------------------------------------
    # 4. Calculate percentage
    # --------------------------------------------------------

    total_rooms = row.total_rooms
    occupied_rooms = row.occupied_rooms

    if total_rooms == 0:
        occupancy = 0.0
    else:
        occupancy = (
            occupied_rooms / total_rooms
        ) * 100

    # --------------------------------------------------------
    # 5. Return response
    # --------------------------------------------------------

    return {
        "property_id": property_id,
        "from": from_date,
        "to": to_date,
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "occupancy_percent": round(
            occupancy,
            2
        )
    }


# ============================================================
# ADR REPORT
# ============================================================

@router.get(
    "/{property_id}/reports/adr",
    response_model=ADRResponse
)
def get_adr(
    property_id: int,

    from_date: date = Query(
        ...,
        alias="from"
    ),

    to_date: date = Query(
        ...,
        alias="to"
    ),

    account=Depends(
        require_roles("staff", "manager", "owner")
    ),

    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # 1. Validate date range
    # --------------------------------------------------------

    if to_date <= from_date:
        raise HTTPException(
            status_code=422,
            detail="to must be strictly after from"
        )

    # --------------------------------------------------------
    # 2. Check property access
    # --------------------------------------------------------

    check_property_access(
        property_id,
        account,
        db
    )

    # --------------------------------------------------------
    # 3. Calculate ADR
    # --------------------------------------------------------

    row = db.execute(
        text("""
            SELECT

                COALESCE(
                    SUM(
                        (b.check_out - b.check_in)
                        * rp.nightly_rate
                    ),
                    0
                ) AS room_revenue,

                COALESCE(
                    SUM(
                        b.check_out - b.check_in
                    ),
                    0
                ) AS room_nights

            FROM bookings b

            JOIN rooms r
                ON r.room_id = b.room_id

            JOIN rate_plans rp
                ON rp.property_id = r.property_id
                AND rp.room_type_id = r.room_type_id
                AND rp.start_date <= b.check_in
                AND rp.end_date > b.check_in

            WHERE r.property_id = :property_id

            AND b.status NOT IN (
                'cancelled',
                'no_show'
            )

            AND b.check_in >= :from_date
            AND b.check_out <= :to_date
        """),
        {
            "property_id": property_id,
            "from_date": from_date,
            "to_date": to_date
        }
    ).fetchone()

    room_revenue = float(
        row.room_revenue
    )

    room_nights = int(
        row.room_nights
    )

    # --------------------------------------------------------
    # 4. Calculate ADR
    # --------------------------------------------------------

    if room_nights == 0:
        adr = 0.0
    else:
        adr = (
            room_revenue / room_nights
        )

    # --------------------------------------------------------
    # 5. Return response
    # --------------------------------------------------------

    return {
        "property_id": property_id,
        "from": from_date,
        "to": to_date,
        "room_revenue": round(
            room_revenue,
            2
        ),
        "room_nights": room_nights,
        "adr": round(
            adr,
            2
        )
    }


# ============================================================
# REVPAR REPORT
# ============================================================

@router.get(
    "/{property_id}/reports/revpar",
    response_model=RevPARResponse
)
def get_revpar(
    property_id: int,

    from_date: date = Query(
        ...,
        alias="from"
    ),

    to_date: date = Query(
        ...,
        alias="to"
    ),

    account=Depends(
        require_roles("staff", "manager", "owner")
    ),

    db: Session = Depends(get_db)
):
    # --------------------------------------------------------
    # 1. Validate date range
    # --------------------------------------------------------

    if to_date <= from_date:
        raise HTTPException(
            status_code=422,
            detail="to must be strictly after from"
        )

    # --------------------------------------------------------
    # 2. Check property access
    # --------------------------------------------------------

    check_property_access(
        property_id,
        account,
        db
    )

    # --------------------------------------------------------
    # 3. Get total rooms
    # --------------------------------------------------------

    total_rooms = db.execute(
        text("""
            SELECT COUNT(*)
            FROM rooms
            WHERE property_id = :property_id
        """),
        {
            "property_id": property_id
        }
    ).scalar()

    # --------------------------------------------------------
    # 4. Calculate number of days
    # --------------------------------------------------------

    total_days = (
        to_date - from_date
    ).days

    available_room_nights = (
        total_rooms * total_days
    )

    # --------------------------------------------------------
    # 5. Calculate room revenue
    # --------------------------------------------------------

    row = db.execute(
        text("""
            SELECT

                COALESCE(
                    SUM(
                        (b.check_out - b.check_in)
                        * rp.nightly_rate
                    ),
                    0
                ) AS room_revenue

            FROM bookings b

            JOIN rooms r
                ON r.room_id = b.room_id

            JOIN rate_plans rp
                ON rp.property_id = r.property_id
                AND rp.room_type_id = r.room_type_id
                AND rp.start_date <= b.check_in
                AND rp.end_date > b.check_in

            WHERE r.property_id = :property_id

            AND b.status NOT IN (
                'cancelled',
                'no_show'
            )

            AND b.check_in >= :from_date
            AND b.check_out <= :to_date
        """),
        {
            "property_id": property_id,
            "from_date": from_date,
            "to_date": to_date
        }
    ).fetchone()

    room_revenue = float(
        row.room_revenue
    )

    # --------------------------------------------------------
    # 6. Calculate RevPAR
    # --------------------------------------------------------

    if available_room_nights == 0:
        revpar = 0.0
    else:
        revpar = (
            room_revenue
            / available_room_nights
        )

    # --------------------------------------------------------
    # 7. Return response
    # --------------------------------------------------------

    return {
        "property_id": property_id,
        "from": from_date,
        "to": to_date,
        "total_rooms": total_rooms,
        "available_room_nights": available_room_nights,
        "room_revenue": round(
            room_revenue,
            2
        ),
        "revpar": round(
            revpar,
            2
        )
    }