from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db


router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


# ============================================================
# GET /properties/{property_id}/availability
# ============================================================

@router.get("/{property_id}/availability")
def get_availability(
    property_id: int,
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    room_type: str | None = None,
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
    # 2. Check that property exists
    # --------------------------------------------------------

    property_row = db.execute(
        text("""
            SELECT property_id
            FROM properties
            WHERE property_id = :property_id
        """),
        {
            "property_id": property_id
        }
    ).fetchone()

    if not property_row:
        raise HTTPException(
            status_code=404,
            detail="Property not found"
        )

    # --------------------------------------------------------
    # 3. Find available rooms
    # --------------------------------------------------------

    query = text("""
        SELECT
            r.room_id,
            r.room_number,
            rt.type_name AS room_type_name,
            rt.max_occupancy,

            (
                CAST(:to_date AS date)
                - CAST(:from_date AS date)
            )::int AS nights,

            COALESCE(
                (
                    SELECT SUM(rp.nightly_rate)
                    FROM rate_plans rp
                    WHERE rp.property_id = r.property_id
                      AND rp.room_type_id = r.room_type_id
                      AND rp.start_date <= :from_date
                      AND rp.end_date >= :to_date
                ),
                0
            )::numeric AS total_rate

        FROM rooms r

        JOIN room_types rt
            ON rt.room_type_id = r.room_type_id

        WHERE r.property_id = :property_id

        AND (
            :room_type IS NULL
            OR rt.type_name = :room_type
        )

        AND NOT EXISTS (
            SELECT 1
            FROM bookings b
            WHERE b.room_id = r.room_id
              AND b.status NOT IN ('cancelled', 'no_show')
              AND b.check_in < :to_date
              AND b.check_out > :from_date
        )

        ORDER BY r.room_number
    """)

    rows = db.execute(
        query,
        {
            "property_id": property_id,
            "from_date": from_date,
            "to_date": to_date,
            "room_type": room_type
        }
    ).fetchall()

    # --------------------------------------------------------
    # 4. Build response
    # --------------------------------------------------------

    items = []

    for row in rows:
        items.append({
            "room_id": row.room_id,
            "room_number": row.room_number,
            "room_type": {
                "name": row.room_type_name,
                "max_occupancy": row.max_occupancy
            },
            "nights": row.nights,
            "total_rate": f"{row.total_rate:.2f}"
        })

    # --------------------------------------------------------
    # 5. Return response
    # --------------------------------------------------------

    return {
        "property_id": property_id,
        "from": from_date,
        "to": to_date,
        "items": items
    }