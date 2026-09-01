from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_account, require_roles
from app.schemas import RoomListResponse


router = APIRouter(
    prefix="/properties",
    tags=["Properties"]
)


@router.get(
    "/{property_id}/rooms",
    response_model=RoomListResponse
)
def list_rooms(
    property_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_account=Depends(
        require_roles("staff", "manager", "owner")
    )
):
    """
    Return the complete room inventory for a property.
    Includes rooms that have never been booked.
    """

    # --------------------------------------------------------
    # 1. PROPERTY SCOPE
    # --------------------------------------------------------

    # Staff and managers can only access their assigned property.
    # Owners can access all properties.

    if current_account.role in ("staff", "manager"):

        if current_account.property_id != property_id:

            raise HTTPException(
                status_code=403,
                detail="You do not have access to this property"
            )

    # --------------------------------------------------------
    # 2. Check property exists
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
    # 3. Get ALL rooms
    # --------------------------------------------------------

    rows = db.execute(
        text("""
            SELECT
                r.room_id,
                r.property_id,
                r.room_number,
                rt.type_name AS room_type_name,
                rt.max_occupancy

            FROM rooms r

            JOIN room_types rt
                ON rt.room_type_id = r.room_type_id

            WHERE r.property_id = :property_id

            ORDER BY r.room_number

            LIMIT :limit
            OFFSET :offset
        """),
        {
            "property_id": property_id,
            "limit": limit,
            "offset": offset
        }
    ).fetchall()

    # --------------------------------------------------------
    # 4. Total rooms
    # --------------------------------------------------------

    total = db.execute(
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
    # 5. Build response
    # --------------------------------------------------------

    items = []

    for row in rows:

        items.append({
            "id": row.room_id,
            "property_id": row.property_id,
            "room_number": row.room_number,
            "room_type": {
                "name": row.room_type_name,
                "max_occupancy": row.max_occupancy
            }
        })

    # --------------------------------------------------------
    # 6. Return response
    # --------------------------------------------------------

    return {
        "items": items,
        "meta": {
            "limit": limit,
            "offset": offset,
            "total": total
        }
    }