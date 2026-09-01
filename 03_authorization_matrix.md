# Kaveri Stays — Authorization Matrix

| Endpoint | Guest | Staff | Manager | Owner | Scope / Notes |
|---|---|---|---|---|---|
| POST /auth/register | ALLOW | ALLOW | ALLOW | ALLOW | Public endpoint; creates guest account only |
| POST /auth/login | ALLOW | ALLOW | ALLOW | ALLOW | Public endpoint |
| POST /auth/refresh | ALLOW | ALLOW | ALLOW | ALLOW | Valid refresh token required |
| POST /auth/logout | ALLOW | ALLOW | ALLOW | ALLOW | Authenticated account; revokes refresh token |
| GET /availability | ALLOW | ALLOW | ALLOW | ALLOW | Property scope applies |
| GET /properties/{property_id}/rooms | DENY | ALLOW | ALLOW | ALLOW | Staff/manager limited to assigned property |
| GET /bookings | ALLOW | ALLOW | ALLOW | ALLOW | Guest sees own bookings; staff/manager property scope; owner all properties |
| POST /bookings | ALLOW | DENY | DENY | DENY | Guest creates own booking |
| GET /bookings/{booking_id} | ALLOW | ALLOW | ALLOW | ALLOW | Guest own booking; staff/manager property scope; owner all |
| PATCH /bookings/{booking_id} | DENY | ALLOW | ALLOW | ALLOW | State transitions + property scope |
| POST /bookings/{booking_id}/payments | ALLOW | DENY | DENY | DENY | Guest pays own booking |
| POST /bookings/{booking_id}/review | ALLOW | DENY | DENY | DENY | Guest can review own completed stay |
| GET /reports/occupancy | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET /reports/adr | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET /reports/revpar | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET /me | ALLOW | ALLOW | ALLOW | ALLOW | Current authenticated account |




## 3.12 Design Decision

Kaveri Stays uses a resource-oriented API with explicit role-based
authorization and property-level scoping.

Authentication is handled with short-lived JWT access tokens and
rotating refresh tokens. Protected endpoints use Bearer authentication.

Availability returns an empty collection with 200 OK when no rooms
match the requested dates. Bookings use a controlled state machine,
and payments require an Idempotency-Key to prevent duplicate payments.

List endpoints use offset pagination. Valid requests with no matching
records return 200 OK with an empty collection.

The API uses 401 for authentication failures and 403 when an
authenticated user lacks permission. Booking dates use YYYY-MM-DD,
while timestamps use ISO 8601 UTC.

All API errors follow a common error structure containing code,
message, and optional details.

Property-scoped roles can access only their assigned property,
while the owner can access data across properties.