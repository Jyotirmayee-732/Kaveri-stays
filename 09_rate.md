## 9.3 Rate Limiting

POST /auth/login was limited to 5 requests per minute per IP address. The first five requests were accepted with HTTP 200. On the sixth request, the API returned HTTP 429 Too Many Requests with the message "Rate limit exceeded: 5 per 1 minute".

I then re-ran attack 8.13 using Postman's Collection Runner with 200 login attempts. The attack was blocked by the rate limiter, with requests receiving HTTP 429 after the allowed limit.


## 9.4 EXPLAIN ANALYZE

I ran EXPLAIN (ANALYZE, BUFFERS) on the SQL query used by the availability endpoint.

The execution plan showed:

Seq Scan on bookings b

for the booking-overlap check. Therefore, the no_overlapping_bookings index created in database assignment 6.3 was not used by this API query.

The plan did use an index for the rate-plan lookup:

Index Scan using no_overlapping_rate_periods on rate_plans rp.

The API changed the query by performing the availability check through a NOT EXISTS condition using room_id, status, check_in, and check_out. PostgreSQL selected a sequential scan for the current small bookings table rather than the 6.3 index.


## 9.6 — Written answer

Postman vs pytest: Postman tests are useful for manual/API-level verification, exploratory testing, and demonstrating attacks and real HTTP behavior. Pytest tests are automated and repeatable, so they belong in a CI pipeline that runs on every commit. Postman cannot replace pytest in the commit pipeline because the collection requires an external client/runtime and is primarily intended for interactive/API testing rather than fast automated unit/integration verification.

## 9.7 — Written answer

The smallest change is to remove direct database credentials/access from staff and application users and expose database operations only through the API, with PostgreSQL accessible only from the API server/network. Kaveri Stays loses direct operational access for staff, making ad-hoc SQL investigation and emergency database changes less convenient.