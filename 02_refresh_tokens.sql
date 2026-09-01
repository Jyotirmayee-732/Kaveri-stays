-- ============================================================
-- Kaveri Stays - Stage 2.7
-- Refresh Token Schema
-- ============================================================


-- ============================================================
-- REFRESH TOKENS
-- ============================================================

CREATE TABLE refresh_tokens (

    refresh_token_id BIGINT GENERATED ALWAYS AS IDENTITY
        PRIMARY KEY,

    account_id BIGINT NOT NULL
        REFERENCES accounts(account_id)
        ON DELETE CASCADE,

    token_hash TEXT NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    revoked_at TIMESTAMPTZ,

    CONSTRAINT uq_refresh_token_hash
        UNIQUE (token_hash)
);


-- ============================================================
-- INDEX
-- ============================================================

CREATE INDEX idx_refresh_tokens_account
    ON refresh_tokens(account_id);