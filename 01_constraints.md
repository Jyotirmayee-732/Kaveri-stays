# Kaveri Stays — Stage 1: Constraint Inventory

## 1.1 Constraint Inventory

The following inventory was obtained from PostgreSQL's
`pg_constraint` catalog.

| Table | Constraint | Type | Business Rule | SQLSTATE |
|---|---|---|---|---|
| bookings | chk_booking_guest_count | CHECK | Guest count must be greater than 0 | 23514 |
| bookings | no_overlapping_bookings | EXCLUSION | A room cannot have overlapping bookings | 23P01 |

## 1.2 SQLSTATE → HTTP Status Mapping

| Constraint | SQLSTATE | HTTP Status | Reason |
|---|---|---:|---|
| chk_booking_guest_count | 23514 | 422 | Guest count violates the database rule |
| uq_guest_email | 23505 | 409 | Email conflicts with an existing guest |
| bookings | fk_booking_guest | FOREIGN KEY | booking must reference an existing guest | 23503 |
| fk_booking_guest | 23503 | 422 | Referenced guest does not exist |
| no_overlapping_bookings | 23P01 | 409 | The requested booking conflicts with an existing booking |

## 1.3 Data Conflict Constraints
| properties | uq_property_name_city | UNIQUE | Property name and city combination must be unique | 23505 |
| uq_property_name_city | 23505 | 409 | Property with the same name already exists in that city |
## 1.4 Exclusion Constraint Error
The exclusion constraint tested was:

`no_overlapping_bookings`

The existing booking occupied room 48 for:

`2025-01-10` → `2025-01-15`

A new booking was attempted for the same room for:

`2025-01-12` → `2025-01-14`

PostgreSQL rejected the INSERT with:

text
conflicting key value violates exclusion constraint
"no_overlapping_bookings"

## 1.5 Guest Count vs Maximum Occupancy

The maximum occupancy rule is enforced by a PostgreSQL
BEFORE INSERT OR UPDATE trigger named
`trg_check_booking_occupancy`.

The trigger calls `check_booking_occupancy()` and compares
the booking's `guest_count` with the room type's
`max_occupancy`.

For example, room 17 has a maximum occupancy of 2.
An INSERT with guest_count = 3 was rejected.

Observed SQLSTATE: P0001
## 1.6 Unconstrained Rule

The rule is that a booking's guest count must not exceed the
maximum occupancy of its room type.

This rule cannot be enforced using a normal CHECK constraint
because `max_occupancy` is stored in the `room_types` table,
while `guest_count` is stored in the `bookings` table.

In this database, the rule is enforced using the
`check_booking_occupancy()` trigger before INSERT or UPDATE
on `bookings`.

The trigger checks the room's room type and compares
`guest_count` with `max_occupancy`.

Therefore, the rule is enforced even when a booking is inserted
through the API, because the API ultimately writes to PostgreSQL
and the database trigger still executes.

When the rule is violated, the current trigger raises a
PL/pgSQL exception with SQLSTATE `P0001`.
## 1.7 Dangerous Stage 4 Queries

Not every Stage 4 query should be exposed directly as an unrestricted
API endpoint.

The queries I would treat as potentially dangerous are primarily
the analytical and reporting queries: 4.7–4.25. These queries
aggregate, rank, compare, or scan historical data across multiple
tables and, in several cases, across all three properties.

Examples include:

- 4.7 — revenue per property per month
- 4.8 — occupancy rate
- 4.10 — RevPAR
- 4.12 — quarterly revenue ranking
- 4.13 — running revenue total
- 4.14 — LAG-based revenue comparison
- 4.18 — spending quartiles
- 4.22 — cohort analysis
- 4.24 — highest-revenue guest across all properties and all time
- 4.25 — revenue report with ROLLUP

Queries such as 4.17, 4.21 and 4.23 can also produce result sets
that grow with the number of guests and stays.

The main risks are large or unbounded result sets, expensive
aggregations/window functions, and queries that process data
across all properties. These should be protected with appropriate
authorization, pagination or limits where applicable, controlled
date ranges, and possibly caching or precomputed reporting data.

The operational availability queries such as 4.1 and 4.2 are more
appropriate for API use because they have naturally restricted
property/date scopes.

## 1.8 Guest-Invisible Columns

Guest-facing API responses should expose only the fields needed
for the guest's own use. Internal identifiers and database
metadata should not be exposed unnecessarily.

Columns that should be treated as internal/guest-invisible include:

- bookings.created_at
- guests.created_at
- payments.payment_id
- payments.booking_id
- properties.property_id
- room_types.room_type_id
- rooms.room_id
- rooms.property_id
- rooms.room_type_id
- rate_plans.rate_plan_id
- rate_plans.property_id
- rate_plans.room_type_id
- reviews.review_id
- reviews.booking_id

The backup tables (`bookings_backup`, `rate_plans_backup`,
and `reviews_backup`) and the `legacy_reservations` table are
internal/legacy data and should not be exposed through guest-facing
API endpoints.

IDs such as booking_id or room_id are not automatically forbidden
in every API response; the API should expose identifiers only when
they are necessary and authorized for the requesting guest.
A guest must never be able to use an identifier to access another
guest's records.

## 1.9 Booking State Machine

Rule 7 defines five booking states:

1. confirmed
2. checked_in
3. checked_out
4. cancelled
5. no_show

The normal booking lifecycle is:

confirmed → checked_in → checked_out

A confirmed booking may also become:

confirmed → cancelled
confirmed → no_show

Cancelled and no-show bookings release the room for other guests.

### State diagram

                    ┌─────────────┐
                    │  confirmed  │
                    └──────┬──────┘
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       checked_in      cancelled       no_show
             │             │             │
             ▼             ▼             ▼
       checked_out     room released   room released

The five states are fixed by Rule 7. The exact actor/role
responsible for each transition must follow the authorization
rules specified elsewhere in the assignment.

## 1.10 Schema Change for an HTTP API

One thing I would change is to add an explicit `updated_at` column
to tables whose records can be modified through the API, especially
the `bookings` table.

The current schema has `created_at`, but an HTTP API may update a
booking, for example when its status changes from `confirmed` to
`checked_in` or `checked_out`. Having an `updated_at` timestamp would
allow the API and administrators to know when the record was last
modified.

This would also make auditing and debugging API changes easier.

Example change:

ALTER TABLE bookings
ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;