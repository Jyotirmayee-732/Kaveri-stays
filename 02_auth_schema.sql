-- ============================================================
-- Kaveri Stays — Stage 2
-- 02_auth_schema.sql
-- ============================================================

-- Role type
CREATE TYPE account_role AS ENUM (
    'guest',
    'staff',
    'manager',
    'owner'
);


-- ============================================================
-- Accounts
-- ============================================================

CREATE TABLE accounts (
    account_id BIGINT GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    guest_id BIGINT
        REFERENCES guests(guest_id)
        ON DELETE RESTRICT,

    password_hash TEXT NOT NULL,

    role account_role NOT NULL,

    property_id BIGINT
        REFERENCES properties(property_id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_accounts_guest
        UNIQUE (guest_id),

    CONSTRAINT chk_account_property_assignment
        CHECK (
            (role IN ('staff', 'manager') AND property_id IS NOT NULL)
            OR
            (role IN ('guest', 'owner') AND property_id IS NULL)
        )
);


-- ============================================================
-- Kaveri Stays - Stage 2.3
-- Authentication Schema
-- ============================================================


-- 1. Create the account role type

CREATE TYPE account_role AS ENUM (
    'guest',
    'staff',
    'manager',
    'owner'
);


-- 2. Create the accounts table

CREATE TABLE accounts (
    account_id BIGINT GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    guest_id BIGINT
        REFERENCES guests(guest_id)
        ON DELETE RESTRICT,

    password_hash TEXT NOT NULL,

    role account_role NOT NULL,

    property_id BIGINT
        REFERENCES properties(property_id)
        ON DELETE RESTRICT,

    -- A guest can have at most one login account.
    CONSTRAINT uq_accounts_guest
        UNIQUE (guest_id),

    -- Enforce property assignment rules:
    -- staff/manager -> exactly one property
    -- guest/owner   -> no property
    CONSTRAINT chk_account_property_assignment
        CHECK (
            (
                role IN ('staff', 'manager')
                AND property_id IS NOT NULL
            )
            OR
            (
                role IN ('guest', 'owner')
                AND property_id IS NULL
            )
        )
);