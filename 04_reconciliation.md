# Kaveri Stays — Interlude Reconciliation

## R1 — Stage 3 baseline

The Stage 3 hand-written specification and authorization matrix were committed before reviewing the reveal. The original specification is preserved as `03_openapi_original.yaml`.

## R2 — Reveal comparison

| Reveal path | My Stage 3 design | Result |
|---|---|---|
| `/auth/register` | Same | Match |
| `/auth/login` | Same | Match |
| `/auth/refresh` | Same | Match |
| `/auth/logout` | Same | Match |
| `/availability` | `/availability` | Same concept |
| `/properties/{property_id}/rooms` | Same | Match |
| `/bookings` | Same | Match |
| `/bookings/{booking_id}` | Same | Match |
| `/bookings/{booking_id}/payments` | Same | Match |
| `/bookings/{booking_id}/review` | Same | Match |
| `/me` | Same | Match |
| `/reports/occupancy` | Same concept | Match in purpose |
| `/reports/adr` | Same concept | Match in purpose |
| `/reports/revpar` | Same concept | Match in purpose |
| `/properties` | Not designed | Missing |
| `/properties/{property_id}` | Not designed | Missing |
| `/properties/{property_id}/availability` | Different path choice | Renamed in reveal |
| `/properties/{property_id}/reviews` | Not designed | Missing |
| `/guests` | Not designed | Missing |
| `/guests/{guest_id}` | Not designed | Missing |
| `/reports/revenue` | Not designed | Missing |
| `/bookings/{booking_id}/check-in` | Status transition design differed | Reveal uses action endpoint |
| `/bookings/{booking_id}/check-out` | Status transition design differed | Reveal uses action endpoint |
| `/bookings/{booking_id}/cancel` | Status transition design differed | Reveal uses action endpoint |
| `/bookings/{booking_id}/no-show` | Status transition design differed | Reveal uses action endpoint |

## R3 — Paths in my original spec not present in the reveal

The main path that differed was `/availability`. The reveal places availability under `/properties/{property_id}/availability` so that the property is part of the resource path.

My original status-transition design also used a status update operation rather than four separate action endpoints. This was an arguable design choice under the assignment.

## R4 — Status-code differences

The important distinction is between malformed input and a request that conflicts with valid existing state. Validation failures use 422, authentication failures use 401, authorization failures use 403, missing/hidden resources use 404 where appropriate, and conflicts such as overlapping bookings use 409.

Returning 400 for every failure would lose useful HTTP semantics and would make client behavior less precise.

## R5 — What the reveal adds

The reveal adds property and guest read endpoints, property-level reviews, revenue reporting, and explicit booking action endpoints. These provide clearer resource boundaries and make authorization easier to express.

The explicit booking actions also reduce the chance of accepting an arbitrary status string and make the state-machine operations clearer to API clients.

## R6 — Final reconciliation decision

For the implementation, the reveal naming is the compatibility target for the later test stages. The original Stage 3 specification remains unchanged as the historical design record.

The design choices I still consider reasonable alternatives are offset pagination, separate account credentials, and explicit state-transition actions versus a generic status update. The non-negotiable security rules remain enforced: 401 versus 403 is distinguished, guests cannot access another guest's booking, clients cannot supply pricing, and concurrent overlapping bookings cannot both succeed.
