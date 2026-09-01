from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.security import get_current_account
from app.schemas import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    LogoutResponse
)

from app.schemas import MeResponse
from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_refresh_token
)

from slowapi import Limiter
from slowapi.util import get_remote_address


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# RATE LIMITER
# ============================================================

limiter = Limiter(key_func=get_remote_address)


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Check whether email already exists
    # --------------------------------------------------------

    existing_guest = db.execute(
        text("""
            SELECT guest_id
            FROM guests
            WHERE email = :email
        """),
        {
            "email": request.email
        }
    ).fetchone()

    if existing_guest:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A guest with this email already exists"
        )

    try:

        # ----------------------------------------------------
        # Create guest
        # ----------------------------------------------------

        guest = db.execute(
            text("""
                INSERT INTO guests
                    (full_name, email, phone, city)
                VALUES
                    (:full_name, :email, :phone, :city)
                RETURNING guest_id
            """),
            {
                "full_name": request.full_name,
                "email": request.email,
                "phone": request.phone,
                "city": request.city
            }
        ).fetchone()

        guest_id = guest.guest_id

        # ----------------------------------------------------
        # Hash password
        # ----------------------------------------------------

        password_hash = hash_password(request.password)

        # ----------------------------------------------------
        # Create guest account
        # ----------------------------------------------------

        account = db.execute(
            text("""
                INSERT INTO accounts
                    (guest_id, password_hash, role, property_id)
                VALUES
                    (:guest_id, :password_hash, 'guest', NULL)
                RETURNING account_id
            """),
            {
                "guest_id": guest_id,
                "password_hash": password_hash
            }
        ).fetchone()

        db.commit()

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this information already exists"
        )

    return RegisterResponse(
        message="Registration successful",
        account_id=account.account_id,
        guest_id=guest_id,
        role="guest"
    )


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=LoginResponse
)
@limiter.limit("5/minute")
def login(
    request: Request,
    login_request: LoginRequest,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------------
    # Find account
    # --------------------------------------------------------

    account = db.execute(
        text("""
            SELECT
                a.account_id,
                a.guest_id,
                a.password_hash,
                a.role,
                a.property_id,
                a.disabled_at
            FROM accounts a
            JOIN guests g
                ON g.guest_id = a.guest_id
            WHERE g.email = :email
        """),
        {
            "email": login_request.email
        }
    ).fetchone()

    # --------------------------------------------------------
    # Do not reveal whether email exists
    # --------------------------------------------------------

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # Reject disabled account
    # --------------------------------------------------------

    if account.disabled_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been disabled"
        )

    # --------------------------------------------------------
    # Verify password
    # --------------------------------------------------------

    if not verify_password(
        login_request.password,
        account.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # --------------------------------------------------------
    # Create access token
    # --------------------------------------------------------

    access_token = create_access_token(
        account_id=account.account_id,
        role=account.role,
        property_id=account.property_id
    )

    # --------------------------------------------------------
    # Create refresh token
    # --------------------------------------------------------

    refresh_token = create_refresh_token()

    refresh_token_hash = hash_refresh_token(
        refresh_token
    )

    # --------------------------------------------------------
    # Store refresh token server-side
    # --------------------------------------------------------

    db.execute(
        text("""
            INSERT INTO refresh_tokens
                (
                    account_id,
                    token_hash,
                    expires_at
                )
            VALUES
                (
                    :account_id,
                    :token_hash,
                    CURRENT_TIMESTAMP + INTERVAL '7 days'
                )
        """),
        {
            "account_id": account.account_id,
            "token_hash": refresh_token_hash
        }
    )

    db.commit()

    # --------------------------------------------------------
    # Return login response
    # --------------------------------------------------------

    return LoginResponse(
        message="Login successful",
        access_token=access_token,
        token_type="bearer",
        refresh_token=refresh_token,
        account_id=account.account_id,
        guest_id=account.guest_id,
        role=account.role
    )


# ============================================================
# REFRESH TOKEN
# ============================================================

@router.post(
    "/refresh",
    response_model=RefreshResponse
)
def refresh_access_token(
    request: dict,
    db: Session = Depends(get_db)
):

    refresh_token = request.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is required"
        )

    token_hash = hash_refresh_token(refresh_token)

    # --------------------------------------------------------
    # Find refresh token
    # --------------------------------------------------------

    stored_token = db.execute(
        text("""
            SELECT
                rt.refresh_token_id,
                rt.account_id,
                rt.expires_at,
                rt.revoked_at,
                a.role,
                a.property_id,
                a.disabled_at
            FROM refresh_tokens rt
            JOIN accounts a
                ON a.account_id = rt.account_id
            WHERE rt.token_hash = :token_hash
        """),
        {
            "token_hash": token_hash
        }
    ).fetchone()

    if not stored_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # --------------------------------------------------------
    # Check whether token was already revoked
    # --------------------------------------------------------

    if stored_token.revoked_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # --------------------------------------------------------
    # Check expiry
    # --------------------------------------------------------

    if stored_token.expires_at <= db.execute(
        text("SELECT CURRENT_TIMESTAMP")
    ).scalar():

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    # --------------------------------------------------------
    # Check disabled account
    # --------------------------------------------------------

    if stored_token.disabled_at is not None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been disabled"
        )

    # --------------------------------------------------------
    # Rotate old refresh token
    # --------------------------------------------------------

    db.execute(
        text("""
            UPDATE refresh_tokens
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE refresh_token_id = :refresh_token_id
        """),
        {
            "refresh_token_id": stored_token.refresh_token_id
        }
    )

    # --------------------------------------------------------
    # Create new access token
    # --------------------------------------------------------

    access_token = create_access_token(
        account_id=stored_token.account_id,
        role=stored_token.role,
        property_id=stored_token.property_id
    )

    # --------------------------------------------------------
    # Create new refresh token
    # --------------------------------------------------------

    new_refresh_token = create_refresh_token()

    new_refresh_token_hash = hash_refresh_token(
        new_refresh_token
    )

    # --------------------------------------------------------
    # Store new refresh token
    # --------------------------------------------------------

    db.execute(
        text("""
            INSERT INTO refresh_tokens
                (
                    account_id,
                    token_hash,
                    expires_at
                )
            VALUES
                (
                    :account_id,
                    :token_hash,
                    CURRENT_TIMESTAMP + INTERVAL '7 days'
                )
        """),
        {
            "account_id": stored_token.account_id,
            "token_hash": new_refresh_token_hash
        }
    )

    db.commit()

    return {
        "message": "Token refreshed successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": new_refresh_token
    }


# ============================================================
# LOGOUT
# ============================================================

@router.post(
    "/logout",
    response_model=LogoutResponse
)
def logout(
    request: dict,
    db: Session = Depends(get_db)
):

    refresh_token = request.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )

    token_hash = hash_refresh_token(refresh_token)

    # --------------------------------------------------------
    # Revoke refresh token
    # --------------------------------------------------------

    db.execute(
        text("""
            UPDATE refresh_tokens
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE token_hash = :token_hash
              AND revoked_at IS NULL
        """),
        {
            "token_hash": token_hash
        }
    )

    db.commit()

    return {
        "message": "Logout successful"
    }


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=MeResponse
)
def get_me(
    account=Depends(get_current_account),
    db: Session = Depends(get_db)
):

    account_row = db.execute(
        text("""
            SELECT
                account_id,
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
            detail="Not authenticated"
        )

    # --------------------------------------------------------
    # Guest account
    # --------------------------------------------------------

    if account_row.guest_id is not None:

        guest = db.execute(
            text("""
                SELECT
                    guest_id,
                    email,
                    full_name
                FROM guests
                WHERE guest_id = :guest_id
            """),
            {
                "guest_id": account_row.guest_id
            }
        ).fetchone()

        if not guest:
            raise HTTPException(
                status_code=404,
                detail="Guest not found"
            )

        return {
            "id": guest.guest_id,
            "email": guest.email,
            "full_name": guest.full_name,
            "role": account_row.role,
            "property_id": account_row.property_id
        }

    # --------------------------------------------------------
    # Staff / manager / owner
    # --------------------------------------------------------

    return {
        "id": account_row.account_id,
        "email": account.email,
        "full_name": getattr(account, "full_name", None),
        "role": account_row.role,
        "property_id": account_row.property_id
    }