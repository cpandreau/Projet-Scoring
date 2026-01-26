-- Migration: Add enrichissement_status column to dossiers
-- This column tracks the status of automatic INPI enrichment after dossier creation

ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS enrichissement_status VARCHAR(20) DEFAULT 'pending';

COMMENT ON COLUMN dossiers.enrichissement_status IS 'Status de l''enrichissement INPI: pending, in_progress, completed, partial, failed';

-- Add insee_sync_at if not exists (from previous work)
ALTER TABLE dossiers ADD COLUMN IF NOT EXISTS insee_sync_at TIMESTAMP WITH TIME ZONE;
