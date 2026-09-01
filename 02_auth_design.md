# Kaveri Stays — Stage 2: Authentication Design

## 2.1 Credential Storage

I will store login credentials in a separate `accounts` table
rather than adding password fields directly to the `guests` table.

The `guests` table represents the guest's business/profile
information, while the `accounts` table represents authentication
information.

This is preferable because most guests may never log in, so
authentication data should not be required for every guest.

It also keeps staff separate from guests. A staff member can have
an account without being represented as a guest.

Finally, if a guest is later hired as staff, their guest record
does not need to be converted or duplicated. Their account and
role can be changed independently of their guest profile.

Therefore, authentication credentials belong in a separate
`accounts` table that references the appropriate identity.


## 2.2 Roles

The system has four roles:

1. Guest
2. Staff
3. Manager
4. Owner

Staff and managers must each belong to exactly one property.

The owner belongs to no property.

The role and property assignment will be represented in the
authentication/account model, and the database constraints in
`02_auth_schema.sql` will enforce the property-assignment rules.

Conceptually:

- Guest → no property assignment
- Staff → exactly one property
- Manager → exactly one property
- Owner → no property assignment


## 2.4 Password Hashing

Passwords will be hashed using bcrypt rather than stored as
plain text.

The bcrypt cost factor will be 12.

The password itself is never stored in the database. During
registration, the submitted password is converted into a bcrypt
hash and only the hash is stored in `accounts.password_hash`.

During login, the submitted password is checked against the stored
bcrypt hash. The original password is not retrieved or decrypted.

A cost factor of 12 was chosen because password verification should
be intentionally computationally expensive enough to resist
large-scale password guessing while remaining practical for normal
login requests.

### Login Timing

One real login was timed to verify that bcrypt's computational cost
is actually being applied.

Login timing:

- Algorithm: bcrypt
- Cost factor: 12
- Timing: [record measured result here]

The timing was measured during an actual login rather than being
assumed from the cost-factor value.


## 2.5 Registration and Login

The API provides:

- POST /auth/register
- POST /auth/login

Registration creates a guest record and one guest account.
The role is assigned by the server as `guest`; the client cannot
choose `staff`, `manager`, or `owner`.

A duplicate guest email is rejected with HTTP 409 Conflict.

Login verifies the submitted password against the stored bcrypt
password hash. A successful login returns HTTP 200.

A staff account must not be self-service because allowing users to
choose staff or manager roles during registration would allow
unauthorized users to grant themselves elevated privileges.
Staff and manager accounts must therefore be created or provisioned
through an authorized administrative process.


## 2.6 JWT Access Token Claims

The access token is a short-lived JWT.

The following claims are included:

| Claim | Purpose |
|---|---|
| `sub` | Identifies the authenticated account |
| `role` | Identifies the user's role: guest, staff, manager, or owner |
| `property_id` | Identifies the property assigned to staff or manager; null for guest and owner |
| `iat` | Records when the access token was issued |
| `exp` | Defines when the access token expires |

### Claims deliberately excluded

The JWT does not contain passwords, password hashes, phone numbers,
full guest details, booking information, payment information, or
other sensitive application data.

A JWT is signed but its payload is not confidential. Anyone who can
read the token can decode and read its claims. Therefore only the
minimum information required for authentication and authorization
is included.


## 2.8 Access Token Revocation When an Account Is Disabled

### Decision

When a manager is fired, their account is disabled immediately.

An existing access token is not allowed to remain valid until its normal
expiration time. Instead, the API checks the account status whenever an
authenticated request is made.

If the account has a non-NULL `disabled_at` value, the request is rejected
with HTTP 401 Unauthorized.

For the assignment example:

- 10:00 — Manager is fired.
- 10:00 — The account is disabled.
- 10:01 — An existing access token is rejected.
- 10:15 — The access token would have expired normally.

Therefore, the manager loses access immediately rather than retaining
access for the remaining fifteen minutes.

### Implementation

The `accounts` table contains:

`disabled_at TIMESTAMPTZ`

When an account is disabled:

```sql
UPDATE accounts
SET disabled_at = CURRENT_TIMESTAMP
WHERE account_id = <account_id>;


## 2.9 Property Scope

### Decision

Property scope is looked up from the database on each authenticated
request rather than being trusted from the JWT.

The JWT identifies the account and role, but the current `property_id`
is obtained from the `accounts` table.

### Why

A manager may be transferred between properties while already logged in.

For example:

- 09:59 — Manager is assigned to Ooty.
- 10:00 — Manager is transferred from Ooty to Coorg.
- 10:01 — Manager makes an API request.

If `property_id` is trusted from the JWT, an existing token containing
Ooty's property ID could continue granting Ooty access until the token
expires or is replaced.

If `property_id` is looked up per request, the next request sees the
manager's current assignment to Coorg.

Therefore:

- Ooty access is denied after the transfer.
- Coorg access is allowed.
- No new login is required for the property change to take effect.

### Cost

The cost is an additional database lookup for authenticated requests
that require property-scoped authorization.

This makes property authorization stateful, but provides immediate
enforcement when a manager is transferred between properties.

### Trade-off

JWT property scope is faster and more stateless, but stale tokens can
retain the old property assignment.

Database lookup adds a database cost but ensures that the current
property assignment is used immediately.

For Kaveri Stays, immediate enforcement is preferred.



## 2.12 HS256 or RS256

### Decision: HS256

I choose HS256 for Kaveri Stays because the current system is a single
backend API, making a shared secret simple and appropriate. It has lower
configuration complexity while still providing secure JWT signing when the
secret is properly protected.

I would switch to RS256 if Kaveri Stays grows into a multi-service
architecture where independent services need to verify tokens without being
trusted with the signing secret.

With RS256, the authentication service would keep the private signing key,
while other services would use the public key only for verification.

### Cost / Trade-off

HS256 requires the signing and verification side to share the same secret.

RS256 would provide better separation of signing and verification, but
would introduce additional key management and deployment complexity.

Therefore, HS256 is appropriate for the current Kaveri Stays architecture,
while RS256 would become preferable as the system grows into multiple
independent services.