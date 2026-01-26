-- Migration: Performance indexes for common query patterns
-- Created: 2025-01-25
-- Purpose: Optimize read performance for frequent queries identified in audit

-- ============================================================================
-- DOSSIERS TABLE INDEXES
-- ============================================================================

-- Index for active dossiers by user (enterprise list page)
-- Supports: getEnterprises, getEnterprisesWithScores, getGlobalStats
CREATE INDEX IF NOT EXISTS idx_dossiers_user_active
ON dossiers(user_id)
WHERE deleted_at IS NULL;

-- Index for filtering by status (dashboard stats, at-risk queries)
-- Supports: getAtRiskEnterprises, status-based filtering
CREATE INDEX IF NOT EXISTS idx_dossiers_statut
ON dossiers(statut)
WHERE deleted_at IS NULL;

-- Index for filtering by creator email (creator filter dropdown)
-- Supports: getCreatorEmails, getEnterprises with email filter
CREATE INDEX IF NOT EXISTS idx_dossiers_created_by_email
ON dossiers(created_by_email)
WHERE deleted_at IS NULL AND created_by_email IS NOT NULL;

-- Composite index for common enterprise list ordering
-- Supports: getEnterprises, getEnterprisesWithScores (ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_dossiers_active_created_at
ON dossiers(created_at DESC)
WHERE deleted_at IS NULL;

-- ============================================================================
-- DOCUMENTS TABLE INDEXES
-- ============================================================================

-- Index for documents by dossier (document list page)
-- Supports: getDocumentsByDossier
CREATE INDEX IF NOT EXISTS idx_documents_dossier_id
ON documents(dossier_id);

-- Index for finding liasse fiscale documents by type
-- Supports: Liasse fiscale specific queries
CREATE INDEX IF NOT EXISTS idx_documents_dossier_type
ON documents(dossier_id, type)
WHERE type = 'liasse_fiscale';

-- ============================================================================
-- DONNEES_EXTRAITES TABLE INDEXES
-- ============================================================================

-- Index for validated extractions by document
-- Supports: Stats queries, score calculations
CREATE INDEX IF NOT EXISTS idx_donnees_extraites_validated
ON donnees_extraites(document_id)
WHERE is_validated = true;

-- ============================================================================
-- SCORES_HISTORY TABLE INDEXES
-- ============================================================================

-- Index for score history by dossier
-- Supports: getScoreHistory, historical trends
CREATE INDEX IF NOT EXISTS idx_scores_history_dossier
ON scores_history(enterprise_id, created_at DESC);

-- ============================================================================
-- INPI TABLES INDEXES
-- ============================================================================

-- Index for dirigeants by dossier (active only)
-- Supports: getDossierDirigeants
CREATE INDEX IF NOT EXISTS idx_dossier_dirigeants_dossier
ON dossier_dirigeants(dossier_id)
WHERE actif = true;

-- Index for activites by dossier
-- Supports: getDossierActivites
CREATE INDEX IF NOT EXISTS idx_dossier_activites_dossier
ON dossier_activites(dossier_id);

-- Index for observations by dossier
-- Supports: getDossierObservations
CREATE INDEX IF NOT EXISTS idx_dossier_observations_dossier
ON dossier_observations(dossier_id);

-- Index for historique by dossier
-- Supports: getDossierHistorique
CREATE INDEX IF NOT EXISTS idx_dossier_historique_dossier
ON dossier_historique(dossier_id);

-- ============================================================================
-- COMMENT: Index maintenance notes
-- ============================================================================
-- These indexes use CONCURRENTLY to avoid blocking writes during creation.
-- Monitor index usage with: SELECT * FROM pg_stat_user_indexes WHERE relname = 'table_name';
-- Unused indexes can be dropped to reduce storage and write overhead.
