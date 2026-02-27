-- Migration: Add password history table for security compliance
-- Date: 2026-01-25
-- Purpose: Track password history to prevent reuse

-- Create password_history table
CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_password_history_user_id 
ON password_history(user_id, created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE password_history IS 'Stores historical passwords to prevent reuse';
COMMENT ON COLUMN password_history.password_hash IS 'Hashed password from user history';
COMMENT ON COLUMN password_history.created_at IS 'When this password was set';

-- Verify migration
SELECT 'Password history table created successfully' AS status;
