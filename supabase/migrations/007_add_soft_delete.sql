-- Migration: Add soft delete support for dossiers
-- Description: Adds deleted_at and deleted_by columns for soft delete functionality

-- Add soft delete columns
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL;

-- Create index for efficient filtering of non-deleted records
CREATE INDEX IF NOT EXISTS idx_dossiers_not_deleted ON dossiers(id) WHERE deleted_at IS NULL;

-- Comment on columns
COMMENT ON COLUMN dossiers.deleted_at IS 'Timestamp when the dossier was soft-deleted (archived)';
COMMENT ON COLUMN dossiers.deleted_by IS 'User ID who soft-deleted (archived) the dossier';
