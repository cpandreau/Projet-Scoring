-- ============================================
-- Migration: Mise à jour des types de documents
-- ============================================

-- Ajouter les nouvelles valeurs à l'enum type_document
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'bilan';
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'compte_resultat';
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'annexes';
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'autre';

-- Note: Les valeurs d'enum ne peuvent pas être supprimées dans PostgreSQL,
-- donc 'liasse_fiscale' reste disponible comme valeur existante.

-- Créer un index sur le type de document pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);

-- Créer un index composite pour la recherche par dossier + année + type
CREATE INDEX IF NOT EXISTS idx_documents_dossier_annee_type
ON documents(dossier_id, annee_exercice, type);
