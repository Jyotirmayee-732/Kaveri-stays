from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db
from app.security import get_current_account
from app.schemas import GuestListResponse

router = APIRouter(
    prefix="/guests",
    tags=["Guests"]
)


@router.get(
    "",
    response_model=GuestListResponse
)
def list_guests(
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_account=Depends(get_current_account)
):
    # --------------------------------------------------------
    # 1. Check role
    # --------------------------------------------------------

    if current_account.role not in ("staff", "manager", "owner"):
        raise HTTPException(
            status_code=403,
            detail="You do not have access to guest records"
        )

    # --------------------------------------------------------
    # 2. Get guests
    # --------------------------------------------------------

    rows = db.execute(
        text("""
            SELECT
                guest_id,
                full_name,
                email,
                phone,
                city
            FROM guests
            ORDER BY guest_id
            LIMIT :limit
            OFFSET :offset
        """),
        {
            "limit": limit,
            "offset": offset
        }
    ).fetchall()

    # --------------------------------------------------------
    # 3. Total guests
    # --------------------------------------------------------

    total = db.execute(
        text("""
            SELECT COUNT(*)
            FROM guests
        """)
    ).scalar()

    # --------------------------------------------------------
    # 4. Response
    # --------------------------------------------------------

    items = []

    for row in rows:
        items.append({
            "id": row.guest_id,
            "full_name": row.full_name,
            "email": row.email,
            "phone": row.phone,
            "city": row.city
        })

    return {
        "items": items,
        "meta": {
            "limit": limit,
            "offset": offset,
            "total": total
        }
    }