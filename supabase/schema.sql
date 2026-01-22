-- ============================================
-- Schéma SQL pour l'application de Scoring
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. CRÉATION DES TYPES ENUM
-- ============================================

-- Statut des dossiers
CREATE TYPE statut_dossier AS ENUM (
  'brouillon',
  'documents_uploades',
  'extrait',
  'valide',
  'analyse'
);

-- Type de document
CREATE TYPE type_document AS ENUM (
  'liasse_fiscale'
);

-- ============================================
-- 2. CRÉATION DES TABLES
-- ============================================

-- Table des dossiers
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  siren VARCHAR(9),
  siret VARCHAR(14),
  raison_sociale TEXT,
  forme_juridique TEXT,
  code_naf VARCHAR(10),
  adresse TEXT,
  statut statut_dossier DEFAULT 'brouillon' NOT NULL
);

-- Table des documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  dossier_id UUID REFERENCES dossiers(id) ON DELETE CASCADE NOT NULL,
  annee_exercice INTEGER,
  nom_fichier TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type type_document DEFAULT 'liasse_fiscale' NOT NULL
);

-- Table des données extraites
CREATE TABLE donnees_extraites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  donnees JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_validated BOOLEAN DEFAULT false NOT NULL
);

-- ============================================
-- 3. CRÉATION DES INDEX
-- ============================================

-- Index pour améliorer les performances des requêtes
CREATE INDEX idx_dossiers_user_id ON dossiers(user_id);
CREATE INDEX idx_dossiers_siren ON dossiers(siren);
CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_documents_dossier_id ON documents(dossier_id);
CREATE INDEX idx_donnees_extraites_document_id ON donnees_extraites(document_id);

-- ============================================
-- 4. ACTIVATION DE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE donnees_extraites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLITIQUES RLS
-- ============================================

-- Politiques pour la table dossiers
-- Les utilisateurs peuvent voir uniquement leurs propres dossiers
CREATE POLICY "Users can view own dossiers"
  ON dossiers
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dossiers"
  ON dossiers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dossiers"
  ON dossiers
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own dossiers"
  ON dossiers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques pour la table documents
-- Les utilisateurs peuvent voir les documents de leurs propres dossiers
CREATE POLICY "Users can view own documents"
  ON documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents to own dossiers"
  ON documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own documents"
  ON documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own documents"
  ON documents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dossiers
      WHERE dossiers.id = documents.dossier_id
      AND dossiers.user_id = auth.uid()
    )
  );

-- Politiques pour la table donnees_extraites
-- Les utilisateurs peuvent voir les données extraites de leurs propres documents
CREATE POLICY "Users can view own donnees_extraites"
  ON donnees_extraites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN dossiers ON dossiers.id = documents.dossier_id
      WHERE documents.id = donnees_extraites.document_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert donnees_extraites to own documents"
  ON donnees_extraites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      JOIN dossiers ON dossiers.id = documents.dossier_id
      WHERE documents.id = donnees_extraites.document_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own donnees_extraites"
  ON donnees_extraites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN dossiers ON dossiers.id = documents.dossier_id
      WHERE documents.id = donnees_extraites.document_id
      AND dossiers.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      JOIN dossiers ON dossiers.id = documents.dossier_id
      WHERE documents.id = donnees_extraites.document_id
      AND dossiers.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own donnees_extraites"
  ON donnees_extraites
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      JOIN dossiers ON dossiers.id = documents.dossier_id
      WHERE documents.id = donnees_extraites.document_id
      AND dossiers.user_id = auth.uid()
    )
  );
