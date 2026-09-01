from datetime import datetime, timedelta, timezone
import hashlib
import secrets
import os

import bcrypt
import jwt
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "FATAL ERROR: SECRET_KEY is missing. "
        "Create a .env file and set SECRET_KEY before starting the application."
    )


ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 15

REFRESH_TOKEN_EXPIRE_DAYS = 7


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    """
    Hash password using bcrypt cost factor 12.
    """

    salt = bcrypt.gensalt(rounds=12)

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    )

    return hashed_password.decode("utf-8")


def verify_password(
    plain_password: str,
    password_hash: str
) -> bool:
    """
    Verify a password against its bcrypt hash.
    """

    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        password_hash.encode("utf-8")
    )


# ============================================================
# ACCESS TOKEN
# ============================================================

def create_access_token(
    account_id: int,
    role: str,
    property_id: int | None
) -> str:
    """
    Create a short-lived JWT access token.
    """

    now = datetime.now(timezone.utc)

    expire = now + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(account_id),
        "role": role,
        "property_id": property_id,
        "iat": now,
        "exp": expire
    }

    access_token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return access_token


def decode_access_token(token: str) -> dict:
    """
    Verify and decode an access token.
    """

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload


# ============================================================
# REFRESH TOKEN
# ============================================================

def create_refresh_token() -> str:
    """
    Create a secure random refresh token.
    """

    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    """
    Hash refresh token before storing it in PostgreSQL.
    """

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def get_refresh_token_expiry() -> datetime:
    """
    Return refresh token expiry time.
    """

    return (
        datetime.now(timezone.utc)
        + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )


# ============================================================
# ACCOUNT REVOCATION / AUTHENTICATION
# ============================================================

security = HTTPBearer()


def get_current_account(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Validate JWT and check whether the account
    has been disabled in PostgreSQL.
    """

    token = credentials.credentials

    # --------------------------------------------------------
    # 1. Validate JWT
    # --------------------------------------------------------

    try:

        payload = decode_access_token(token)

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    # --------------------------------------------------------
    # 2. Get account ID from JWT
    # --------------------------------------------------------

    account_id = payload.get("sub")

    if not account_id:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )

    # --------------------------------------------------------
    # 3. Get CURRENT account information from database
    # --------------------------------------------------------

    account = db.execute(
        text("""
            SELECT
                account_id,
                role,
                property_id,
                disabled_at
            FROM accounts
            WHERE account_id = :account_id
        """),
        {
            "account_id": int(account_id)
        }
    ).fetchone()

    # --------------------------------------------------------
    # 4. Account doesn't exist
    # --------------------------------------------------------

    if not account:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not active"
        )

    # --------------------------------------------------------
    # 5. Account has been disabled
    # --------------------------------------------------------

    if account.disabled_at is not None:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account has been disabled"
        )

    # --------------------------------------------------------
    # 6. Return CURRENT database account
    # --------------------------------------------------------

    return account


# ============================================================
# ROLE AUTHORIZATION
# ============================================================

def require_roles(*allowed_roles: str):
    """
    Require the authenticated account to have
    one of the specified roles.

    Example:

        account=Depends(require_roles("guest"))

    or:

        account=Depends(
            require_roles("staff", "manager", "owner")
        )
    """

    def dependency(
        account=Depends(get_current_account)
    ):

        if account.role not in allowed_roles:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource"
            )

        return account

    return dependency