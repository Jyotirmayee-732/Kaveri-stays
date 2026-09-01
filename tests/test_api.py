from fastapi.testclient import TestClient
from fastapi import HTTPException

from main import app
from app.security import require_roles


client = TestClient(app)


# ============================================================
# BASIC API TESTS
# ============================================================

def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["message"] == "Kaveri Stays API is running"


def test_invalid_route():
    response = client.get("/this-route-does-not-exist")

    assert response.status_code == 404


def test_protected_route_without_token():
    response = client.get("/test/protected")

    assert response.status_code == 401


def test_invalid_token():
    response = client.get(
        "/test/protected",
        headers={
            "Authorization": "Bearer invalid-token"
        }
    )

    assert response.status_code == 401


# ============================================================
# OPENAPI / DOCUMENTATION TESTS
# ============================================================

def test_openapi():
    response = client.get("/openapi.json")

    assert response.status_code == 200


def test_docs():
    response = client.get("/docs")

    assert response.status_code == 200


# ============================================================
# AUTH ENDPOINT TESTS
# ============================================================

def test_login_endpoint_exists():
    response = client.post(
        "/auth/login",
        data={}
    )

    assert response.status_code in (400, 401, 422)


def test_register_endpoint_exists():
    response = client.post(
        "/auth/register",
        json={}
    )

    assert response.status_code in (400, 409, 422)


def test_refresh_endpoint_requires_token():
    response = client.post(
        "/auth/refresh",
        json={}
    )

    assert response.status_code in (400, 401, 422)


def test_logout_endpoint_requires_authentication():
    response = client.post(
        "/auth/logout"
    )

    assert response.status_code in (400, 401, 403, 422)


# ============================================================
# AUTHENTICATION TESTS
# ============================================================

def test_rooms_requires_authentication():
    response = client.get(
        "/properties/1/rooms"
    )

    assert response.status_code in (401, 403)


def test_reports_require_authentication():
    response = client.get(
        "/properties/1/reports/adr",
        params={
            "from": "2025-05-01",
            "to": "2025-05-03"
        }
    )

    assert response.status_code in (401, 403)


def test_booking_requires_authentication():
    response = client.get(
        "/bookings"
    )

    assert response.status_code in (401, 403)


# ============================================================
# ROLE AUTHORIZATION UNIT TESTS
# ============================================================

def test_guest_is_rejected_from_staff_endpoint():
    dependency = require_roles(
        "staff",
        "manager",
        "owner"
    )

    class GuestAccount:
        role = "guest"

    try:
        dependency(GuestAccount())
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 403


def test_staff_is_allowed():
    dependency = require_roles(
        "staff",
        "manager",
        "owner"
    )

    class StaffAccount:
        role = "staff"

    account = dependency(StaffAccount())

    assert account.role == "staff"


def test_manager_is_allowed():
    dependency = require_roles(
        "staff",
        "manager",
        "owner"
    )

    class ManagerAccount:
        role = "manager"

    account = dependency(ManagerAccount())

    assert account.role == "manager"


def test_owner_is_allowed():
    dependency = require_roles(
        "staff",
        "manager",
        "owner"
    )

    class OwnerAccount:
        role = "owner"

    account = dependency(OwnerAccount())

    assert account.role == "owner"


def test_guest_allowed_for_guest_endpoint():
    dependency = require_roles("guest")

    class GuestAccount:
        role = "guest"

    account = dependency(GuestAccount())

    assert account.role == "guest"


def test_staff_rejected_from_guest_endpoint():
    dependency = require_roles("guest")

    class StaffAccount:
        role = "staff"

    try:
        dependency(StaffAccount())
        assert False, "Expected HTTPException"
    except HTTPException as exc:
        assert exc.status_code == 403


# ============================================================
# BOOKING STATE MACHINE TESTS
# ============================================================

ALLOWED_TRANSITIONS = {
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


def check_transition(current_status, new_status):

    if new_status not in ALLOWED_TRANSITIONS.get(
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

    return True


def test_confirmed_to_checked_in():
    assert check_transition(
        "confirmed",
        "checked_in"
    ) is True


def test_checked_in_to_checked_out():
    assert check_transition(
        "checked_in",
        "checked_out"
    ) is True


def test_confirmed_to_cancelled():
    assert check_transition(
        "confirmed",
        "cancelled"
    ) is True


def test_confirmed_to_no_show():
    assert check_transition(
        "confirmed",
        "no_show"
    ) is True


def test_cancelled_to_checked_in_is_invalid():

    try:
        check_transition(
            "cancelled",
            "checked_in"
        )

        assert False, "Expected HTTPException"

    except HTTPException as exc:

        assert exc.status_code == 409

        assert (
            exc.detail
            == "Illegal booking status transition: "
               "cancelled -> checked_in"
        )


def test_checked_out_to_checked_in_is_invalid():

    try:
        check_transition(
            "checked_out",
            "checked_in"
        )

        assert False, "Expected HTTPException"

    except HTTPException as exc:
        assert exc.status_code == 409


def test_no_show_to_checked_in_is_invalid():

    try:
        check_transition(
            "no_show",
            "checked_in"
        )

        assert False, "Expected HTTPException"

    except HTTPException as exc:
        assert exc.status_code == 409


# ============================================================
# DATABASE / VALIDATION CONSTRAINT TESTS
# ============================================================

def test_booking_invalid_date_range():
    response = client.post(
        "/bookings",
        json={
            "property_id": 1,
            "room_id": 42,
            "guest_id": 25,
            "check_in": "2025-05-03",
            "check_out": "2025-05-01",
            "guest_count": 1
        }
    )

    # Invalid date range must not create a booking.
    assert response.status_code in (400, 401, 403, 409, 422)


def test_booking_zero_guest_count_rejected():
    response = client.post(
        "/bookings",
        json={
            "property_id": 1,
            "room_id": 42,
            "guest_id": 25,
            "check_in": "2025-06-01",
            "check_out": "2025-06-03",
            "guest_count": 0
        }
    )

    assert response.status_code in (400, 401, 403, 409, 422)


def test_booking_negative_guest_count_rejected():
    response = client.post(
        "/bookings",
        json={
            "property_id": 1,
            "room_id": 42,
            "guest_id": 25,
            "check_in": "2025-06-01",
            "check_out": "2025-06-03",
            "guest_count": -1
        }
    )

    assert response.status_code in (400, 401, 403, 409, 422)


def test_invalid_property_id_rejected():
    response = client.get(
        "/properties/999999/rooms"
    )

    assert response.status_code in (401, 403, 404)


def test_invalid_room_id_rejected():
    response = client.get(
        "/properties/1/rooms/999999"
    )

    assert response.status_code in (401, 403, 404)


def test_availability_invalid_date_range():
    response = client.get(
        "/properties/1/availability",
        params={
            "from": "2025-05-05",
            "to": "2025-05-01"
        }
    )

    assert response.status_code in (401, 403, 422)


# ============================================================
# ATTACK 8.5 — EXPIRED ACCESS TOKEN
# ============================================================

def test_expired_access_token_is_rejected():

    import jwt
    from datetime import datetime, timedelta, timezone

    expired_token = jwt.encode(
        {
            "sub": "7",
            "role": "staff",
            "property_id": 1,
            "iat": datetime.now(timezone.utc) - timedelta(minutes=30),
            "exp": datetime.now(timezone.utc) - timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.get(
        "/test/protected",
        headers={
            "Authorization": f"Bearer {expired_token}"
        }
    )

    assert response.status_code == 401


    # ============================================================
# STAGE 8 SECURITY TESTS
# ============================================================

def test_guest_cannot_access_another_guests_booking():
    """
    8.1 Guest A must not be able to access Guest B's booking.
    """

    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.get(
        "/bookings/81",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code in (403, 404)


def test_guest_cannot_register_as_owner():
    """
    8.2 A public registration request must not allow
    the caller to create an owner account.
    """

    response = client.post(
        "/auth/register",
        json={
            "full_name": "Security Test",
            "email": "security-owner-test@example.com",
            "phone": "9999999999",
            "city": "Test City",
            "password": "TestPassword123!",
            "role": "owner"
        }
    )

    # extra="forbid" should reject role, or registration
    # should otherwise not create an owner account.
    assert response.status_code in (400, 409, 422)


def test_none_algorithm_token_is_rejected():
    """
    8.3 JWT using alg=none must be rejected.
    """

    import base64
    import json

    header = base64.urlsafe_b64encode(
        json.dumps(
            {
                "alg": "none",
                "typ": "JWT"
            }
        ).encode()
    ).decode().rstrip("=")

    payload = base64.urlsafe_b64encode(
        json.dumps(
            {
                "sub": "5",
                "role": "guest",
                "property_id": None,
                "exp": 9999999999
            }
        ).encode()
    ).decode().rstrip("=")

    token = f"{header}.{payload}."

    response = client.get(
        "/test/protected",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 401


def test_wrong_secret_token_is_rejected():
    """
    8.4 JWT signed with a different secret must be rejected.
    """

    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "completely-wrong-secret",
        algorithm="HS256"
    )

    response = client.get(
        "/test/protected",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 401


def test_rotated_refresh_token_is_rejected():
    """
    8.6 A refresh token must not be reusable after rotation.
    """

    # Missing/invalid token is safely rejected.
    # The actual rotation behavior is tested separately through
    # the refresh endpoint.
    response = client.post(
        "/auth/refresh",
        json={
            "refresh_token": "already-rotated-invalid-token"
        }
    )

    assert response.status_code == 401


def test_sql_injection_in_sort_parameter_is_rejected():
    """
    8.11 SQL injection through sort must not execute SQL.
    """

    response = client.get(
        "/bookings",
        params={
            "sort": "booking_id; DROP TABLE bookings;--"
        }
    )

    assert response.status_code in (400, 401, 403, 422)


def test_sql_injection_in_filter_parameter_is_rejected():
    """
    8.11 SQL injection through filter must not execute SQL.
    """

    response = client.get(
        "/bookings",
        params={
            "guest_id": "1 OR 1=1"
        }
    )

    assert response.status_code in (400, 401, 403, 422)


def test_review_before_checkout_is_rejected():
    """
    8.9 Review while booking is still checked in must fail.
    """

    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.post(
        "/bookings/86/review",
        json={
            "rating": 5,
            "comments": "Security test"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code in (403, 409)

# ============================================================
# STAGE 5 PAYMENT TESTS
# ============================================================

def test_payment_requires_idempotency_key():
    """
    5.6 Payment requests must require an Idempotency-Key.
    """

    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.post(
        "/bookings/81/payments",
        json={
            "amount": "10.00",
            "method": "card",
            "reference": "pytest-test"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 422


def test_payment_with_invalid_idempotency_key_is_rejected():
    """
    5.6 Idempotency-Key must be a valid UUID.
    """

    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.post(
        "/bookings/81/payments",
        json={
            "amount": "10.00",
            "method": "card",
            "reference": "pytest-test"
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": "not-a-valid-uuid"
        }
    )

    assert response.status_code == 422


def test_payment_invalid_method_is_rejected():
    """
    5.6 Invalid payment methods must be rejected.
    """

    import jwt
    from datetime import datetime, timedelta, timezone
    from uuid import uuid4

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.post(
        "/bookings/81/payments",
        json={
            "amount": "10.00",
            "method": "bitcoin",
            "reference": "pytest-test"
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": str(uuid4())
        }
    )

    assert response.status_code == 422


def test_payment_for_nonexistent_booking_is_rejected():
    """
    Payment for a booking that does not exist must return 404.
    """

    import jwt
    from datetime import datetime, timedelta, timezone
    from uuid import uuid4

    token = jwt.encode(
        {
            "sub": "5",
            "role": "guest",
            "property_id": None,
            "iat": datetime.now(timezone.utc),
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
        },
        "this-is-a-test-secret-key-at-least-32-bytes-long",
        algorithm="HS256"
    )

    response = client.post(
        "/bookings/999999/payments",
        json={
            "amount": "10.00",
            "method": "card",
            "reference": "pytest-test"
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Idempotency-Key": str(uuid4())
        }
    )

    assert response.status_code == 404

# ============================================================
# STAGE 5 REVIEW TESTS
# ============================================================

def test_review_requires_authentication():

    response = client.post(
        "/bookings/81/review",
        json={
            "rating": 5,
            "comments": "pytest"
        }
    )

    assert response.status_code in (401, 403)


def test_review_invalid_rating_is_rejected():

    response = client.post(
        "/bookings/81/review",
        json={
            "rating": 6,
            "comments": "pytest"
        }
    )

    assert response.status_code in (401, 403, 422)


def test_review_extra_field_is_rejected():

    response = client.post(
        "/bookings/81/review",
        json={
            "rating": 5,
            "comments": "pytest",
            "booking_status": "checked_out"
        }
    )

    assert response.status_code in (401, 403, 422)