# Kaveri Stays — Stage 9 Performance and Reliability

## 9.1 — N+1 Query

An N+1 pattern was identified in the booking/property read flow.

Measured result:

- Before optimization: **11 SQL queries**
- After optimization: **1 SQL query**

The improvement came from loading the required related data in the main query instead of executing an additional query for each returned item.

## 9.2 — Connection Pool

SQLAlchemy uses a `QueuePool` with:

- Base pool size: **5**
- Maximum overflow: **10**
- Maximum simultaneous connections: **15**

A pool exhaustion test opened connections 1 through 15 successfully. The 16th connection timed out with:

`QueuePool limit of size 5 overflow 10 reached, connection timed out, timeout 30.00`

This demonstrates that the API/database layer does not create an unlimited number of connections when demand increases.

## 9.3 — Login Rate Limiting

`POST /auth/login` is limited to **5 requests per minute per IP address**.

The first five attempts are accepted. The sixth attempt is blocked with:

- Status: **429 Too Many Requests**
- Message: `Rate limit exceeded: 5 per 1 minute`

Attack 8.13 was re-run after enabling the limiter. The repeated login attempts were blocked after the configured limit.

## 9.4 — Availability EXPLAIN ANALYZE

`EXPLAIN (ANALYZE, BUFFERS)` was run against the SQL used by the availability endpoint.

The booking-overlap part of the plan showed:

`Seq Scan on bookings b`

Therefore, the `no_overlapping_bookings` GiST exclusion index from the database assignment was **not used** by this API query.

The API checks overlap using separate conditions on `room_id`, `check_in`, and `check_out`, rather than the indexed `daterange(...) && daterange(...)` expression. Because the API query shape differs from the indexed expression, PostgreSQL selected a sequential scan for the current data set.

The rate-plan lookup did use an index:

`Index Scan using no_overlapping_rate_periods on rate_plans rp`

The API therefore changed the query shape enough that the original booking exclusion index was no longer the access path chosen by the planner.

## 9.5 — Pytest Coverage

The baseline pytest suite reported:

- Tests passed: **33**
- Coverage: **37%**
- Statements: **609**
- Missed: **382**
- pytest: **9.1.1**
- pytest-cov: **7.1.0**

Additional security/performance tests were added for the Stage 8 and Stage 9 requirements, including SQL injection rejection, guest/object authorization, refresh-token reuse, payment validation, concurrency, N+1 behavior, and connection-pool exhaustion.

The important lesson from Stage 9.5 is that coverage percentage alone is not enough: the suite must exercise failure paths and security requirements, not only successful requests.

## 9.6 — Postman vs pytest

Postman is best for external API behavior, exploratory testing, role/environment switching, attack demonstrations, and an end-to-end collection that a human can run.

Pytest is best for repeatable automated tests that run on every commit. Therefore, pytest belongs in the CI pipeline because it is deterministic, scriptable, and does not require a developer to operate a GUI collection manually.

## 9.7 — Making the API the only path

The smallest operational change is to remove direct PostgreSQL access from staff/application users and make PostgreSQL reachable only from the API service/network.

The benefit is that all business rules, authorization, logging, and validation go through one controlled entry point.

The trade-off is that Kaveri Stays loses convenient direct SQL access for ad-hoc investigation, emergency fixes, and operational reporting. Database administration would still remain possible for authorized infrastructure/database administrators, but ordinary staff would use the API only.
