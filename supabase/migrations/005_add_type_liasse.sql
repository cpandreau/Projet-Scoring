-- Migration: Ajout du type de liasse fiscale sur les documents
-- Description: Permet de distinguer entre liasse normale (2050-2059) et simplifiée (2033)

-- Ajouter la colonne type_liasse
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS type_liasse TEXT;

-- Ajouter une contrainte de validation
ALTER TABLE documents
ADD CONSTRAINT documents_type_liasse_check
CHECK (type_liasse IS NULL OR type_liasse IN ('normale', 'simplifiee'));

-- Commentaire pour documentation
COMMENT ON COLUMN documents.type_liasse IS 'Type de liasse fiscale: normale (2050-2059) ou simplifiee (2033). NULL si le document n''est pas une liasse fiscale.';
