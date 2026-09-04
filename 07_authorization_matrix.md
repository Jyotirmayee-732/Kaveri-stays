# Kaveri Stays — Stage 7 Authorization Matrix

The matrix below describes the implemented authorization behavior. Property-scoped staff and managers are restricted to their assigned property; the owner can access all properties. Guests are restricted to their own booking-related data.

| Endpoint | Guest | Staff | Manager | Owner | Notes |
|---|---|---|---|---|---|
| POST `/auth/register` | ALLOW | ALLOW | ALLOW | ALLOW | Public; always creates a guest role |
| POST `/auth/login` | ALLOW | ALLOW | ALLOW | ALLOW | Public authentication |
| POST `/auth/refresh` | ALLOW | ALLOW | ALLOW | ALLOW | Valid refresh token required |
| POST `/auth/logout` | ALLOW | ALLOW | ALLOW | ALLOW | Revokes refresh token |
| GET `/auth/me` | ALLOW | ALLOW | ALLOW | ALLOW | Own account information |
| GET `/properties/{property_id}/availability` | ALLOW | ALLOW | ALLOW | ALLOW | Property data is public/readable; protected account state still applies where required |
| GET `/properties/{property_id}/rooms` | DENY | ALLOW | ALLOW | ALLOW | Staff/manager limited to assigned property |
| GET `/bookings` | ALLOW | ALLOW | ALLOW | ALLOW | Guest own bookings; staff/manager property scope; owner all |
| POST `/bookings` | ALLOW | DENY | DENY | DENY | Guest creates own booking |
| GET `/bookings/{booking_id}` | ALLOW | ALLOW | ALLOW | ALLOW | Object-level ownership/property scope |
| PATCH `/bookings/{booking_id}/status` | DENY | ALLOW | ALLOW | ALLOW | Staff/manager/owner perform allowed transitions |
| GET `/bookings/{booking_id}/payments` | ALLOW | ALLOW | ALLOW | ALLOW | Guest own booking; staff/manager property scope; owner all |
| POST `/bookings/{booking_id}/payments` | ALLOW | DENY | DENY | DENY | Guest pays own booking; Idempotency-Key required |
| POST `/bookings/{booking_id}/review` | ALLOW | DENY | DENY | DENY | Guest reviews own stay after checkout |
| GET `/guests` | DENY | ALLOW | ALLOW | ALLOW | Operational guest records |
| GET `/{property_id}/reports/occupancy` | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET `/{property_id}/reports/adr` | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET `/{property_id}/reports/revpar` | DENY | ALLOW | ALLOW | ALLOW | Staff/manager property scope; owner all |
| GET `/{property_id}/reports/revenue` | DENY | ALLOW | ALLOW | ALLOW | Where implemented, same property-scope rule |

## Structural authorization

Authentication is performed through `get_current_account` / role dependencies. Property checks are applied using the authenticated account's current property assignment rather than trusting a client-supplied role or property.

For object-level reads, authorization is performed before returning the object. A guest requesting another guest's booking receives 404 rather than being told that the booking exists.

## Stage 7.7 — Four-environment proof

The four Postman environments were used to exercise role behavior. The important verified cases were:

- Guest → own booking/payment/review: allowed.
- Guest → another guest's booking: refused.
- Staff/manager → assigned property: allowed.
- Manager → another property's report: 403 Forbidden.
- Owner → cross-property report: allowed.
- Guest → staff/manager operational endpoints: 403/denied.

## Stage 7.8 — Authorization placement

Where possible, authorization scope is applied before returning data. For collection reads such as bookings, the guest/property restrictions are represented in the query conditions so that unauthorized rows are not returned.

For a specific object request, the endpoint first identifies the booking and then verifies ownership/property access. The guest case intentionally returns 404 for another guest's booking so the endpoint does not reveal whether that resource exists.
