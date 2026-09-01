-- ============================================================
-- Kaveri Stays - Stage 2.8
-- Immediate Account Revocation
-- ============================================================

ALTER TABLE accounts
ADD COLUMN disabled_at TIMESTAMPTZ;

COMMENT ON COLUMN accounts.disabled_at IS
'When set, the account is disabled and all authenticated requests are rejected.';