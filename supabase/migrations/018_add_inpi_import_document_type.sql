-- Migration: Ajouter le type de document 'inpi_import' pour les bilans INPI
-- Date: 2025-01-31

-- 1. Ajouter 'inpi_import' a l'enum type_document
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'inpi_import';

-- 2. Rendre storage_path nullable (les imports INPI n'ont pas de fichier)
ALTER TABLE documents
ALTER COLUMN storage_path DROP NOT NULL;

-- 3. Rendre nom_fichier nullable et ajouter une valeur par defaut
ALTER TABLE documents
ALTER COLUMN nom_fichier DROP NOT NULL;

-- 4. Ajouter une colonne source pour identifier l'origine du document
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'upload';

-- 5. Ajouter un commentaire
COMMENT ON COLUMN documents.source IS 'Origine du document: upload (utilisateur), inpi (API INPI), etc.';

-- 6. Index pour les imports INPI
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);
