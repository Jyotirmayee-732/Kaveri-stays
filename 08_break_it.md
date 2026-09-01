8.6 — Reuse a rotated refresh token

Status: 401 Unauthorized

Response:
{
    "detail": "Invalid or expired refresh token"
}

What stopped it:
The refresh-token rotation logic revoked the old refresh token.

## 8.7 — Ooty Manager Access Coorg Revenue

Status: 403 Forbidden

Response:
{
    "detail": "You do not have access to this property"
}

What stopped it:
Property-level authorization/scoping prevented the Ooty manager
from accessing Coorg's report.


8.8 — Supply nightly_rate

Status: 422 Unprocessable Content

Response:
{
  "type": "extra_forbidden",
  "loc": ["body", "nightly_rate"],
  "msg": "Extra inputs are not permitted",
  "input": 999
}

What stopped it:
BookingCreateRequest uses extra="forbid", so clients cannot
supply nightly_rate or other unauthorized booking fields.


## 8.9 — Review a checked-in booking

Status: 409 Conflict

Response:
{
    "detail": "Reviews are allowed only after checkout"
}

What stopped it:
The review endpoint checks the booking status and allows reviews
only after the booking has been checked out.

## 8.10 — Concurrent Booking Attack

Status: PASSED

Concurrent results:

Booking A:
409 Conflict
{
    "detail": "That room is already taken for the requested dates"
}

Booking B:
201 Created
{
    "message": "Booking created successfully"
}

What stopped it:
The booking logic/database prevented the second concurrent
booking from being created for the same room and overlapping dates.
Only one booking succeeded.


## 8.13
 Two hundred login attempts against one email address: Passed. 200 consecutive invalid login attempts were sent to /auth/login. All 200 returned HTTP 401 Unauthorized, and no rate limiting/blocking occurred.

 ## 8.14
 Email enumeration: Passed. Registered and unregistered email addresses produced the same HTTP 401 response and identical "Invalid email or password" message, so the API does not reveal whether an account exists.


 8.20 Written Answer

Caught by the Database:
1. 8.10 – Concurrent booking
2. 8.12 – Guest count exceeding room capacity

Caught only by the API:
1. 8.1 – Accessing another guest's booking
2. 8.2 – Registering with owner role
3. 8.3 – JWT algorithm none
4. 8.4 – Wrong JWT secret
5. 8.5 – Expired access token
6. 8.6 – Reused refresh token
7. 8.7 – Ooty manager accessing Coorg revenue
8. 8.8 – Supplying nightly_rate
9. 8.9 – Review while checked in
10. 8.11 – SQL injection
11. 8.13 – 200 login attempts
12. 8.14 – Email enumeration

Explanation:
The database-caught cases are integrity rules that should remain true regardless of which application code writes to the database. The API-only cases depend on application-level authorization, authentication, validation, rate limiting, or business logic. They are therefore standing risks because another endpoint, service, script, or future code change could bypass the API check. To move an API-only protection into the database, the corresponding invariant would need to be enforced with an appropriate database constraint, trigger, foreign key, row-level security policy, or other database-level mechanism. Some concerns, such as JWT validation and HTTP rate limiting, are appropriately kept at the API/security layer rather than being converted into database constraints.