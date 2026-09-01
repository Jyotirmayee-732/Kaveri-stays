from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError


def handle_integrity_error(exc: IntegrityError):
    """
    Centralized PostgreSQL SQLSTATE error handling.
    """

    orig = exc.orig

    pgcode = getattr(orig, "pgcode", None)

    diag = getattr(orig, "diag", None)

    constraint_name = (
        getattr(diag, "constraint_name", None)
        if diag
        else None
    )

    # --------------------------------------------------------
    # 23P01 - Exclusion constraint violation
    # --------------------------------------------------------

    if pgcode == "23P01":

        if constraint_name == "no_overlapping_bookings":
            raise HTTPException(
                status_code=409,
                detail="That room is already taken for the requested dates"
            )

        raise HTTPException(
            status_code=409,
            detail="The requested records conflict with existing data"
        )

    # --------------------------------------------------------
    # 23505 - Unique violation
    # --------------------------------------------------------

    if pgcode == "23505":
        raise HTTPException(
            status_code=409,
            detail="A record with the same unique value already exists"
        )

    # --------------------------------------------------------
    # 23503 - Foreign key violation
    # --------------------------------------------------------

    if pgcode == "23503":
        raise HTTPException(
            status_code=409,
            detail="The requested record references data that does not exist"
        )

    # --------------------------------------------------------
    # 23502 - Not-null violation
    # --------------------------------------------------------

    if pgcode == "23502":
        raise HTTPException(
            status_code=422,
            detail="A required database field is missing"
        )

    # --------------------------------------------------------
    # 23514 - Check violation
    # --------------------------------------------------------

    if pgcode == "23514":
        raise HTTPException(
            status_code=422,
            detail="The submitted data violates a database rule"
        )

    # --------------------------------------------------------
    # Unknown integrity error
    # --------------------------------------------------------

    raise HTTPException(
        status_code=500,
        detail="Database integrity error"
    )