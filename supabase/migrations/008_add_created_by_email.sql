-- Migration: Add created_by_email column to track the creator's email
-- This allows displaying and filtering by creator without joining auth.users

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS created_by_email VARCHAR(255);

-- Create index for filtering by creator
CREATE INDEX IF NOT EXISTS idx_dossiers_created_by_email ON dossiers(created_by_email);

-- Comment for documentation
COMMENT ON COLUMN dossiers.created_by_email IS 'Email of the user who created this dossier, stored for display and filtering purposes';
