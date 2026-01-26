-- ============================================
-- Migration: Table des indicateurs territoriaux
-- Description: Stocke les indicateurs économiques par département et secteur d'activité
-- ============================================

-- ============================================
-- Fonction trigger pour updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Met à jour automatiquement la colonne updated_at lors des modifications';

-- ============================================
-- Table indicateurs_territoriaux
-- ============================================

CREATE TABLE IF NOT EXISTS indicateurs_territoriaux (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_departement VARCHAR(3) NOT NULL,
  code_naf_a21 VARCHAR(5) NOT NULL,
  annee INTEGER NOT NULL,
  nb_entreprises INTEGER,
  nb_creations INTEGER,
  evolution_creations DECIMAL(5, 2),
  nb_defaillances INTEGER,
  evolution_defaillances DECIMAL(5, 2),
  taux_chomage DECIMAL(4, 2),
  revenus_medians INTEGER,
  ratios_percentiles JSONB DEFAULT '{}'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contrainte d'unicité
  CONSTRAINT indicateurs_territoriaux_unique UNIQUE (code_departement, code_naf_a21, annee)
);

-- ============================================
-- Index
-- ============================================

CREATE INDEX IF NOT EXISTS idx_indicateurs_territoriaux_dept_naf
ON indicateurs_territoriaux(code_departement, code_naf_a21);

CREATE INDEX IF NOT EXISTS idx_indicateurs_territoriaux_annee
ON indicateurs_territoriaux(annee);

-- ============================================
-- Trigger updated_at
-- ============================================

CREATE TRIGGER trigger_indicateurs_territoriaux_updated_at
  BEFORE UPDATE ON indicateurs_territoriaux
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Commentaires
-- ============================================

COMMENT ON TABLE indicateurs_territoriaux IS 'Indicateurs économiques territoriaux par département et secteur NAF A21';
COMMENT ON COLUMN indicateurs_territoriaux.code_departement IS 'Code département INSEE (ex: 75, 2A, 971)';
COMMENT ON COLUMN indicateurs_territoriaux.code_naf_a21 IS 'Code section NAF rév.2 niveau A21 (ex: FZ pour Construction)';
COMMENT ON COLUMN indicateurs_territoriaux.annee IS 'Année des indicateurs';
COMMENT ON COLUMN indicateurs_territoriaux.nb_entreprises IS 'Nombre total d''entreprises dans le secteur/département';
COMMENT ON COLUMN indicateurs_territoriaux.nb_creations IS 'Nombre de créations d''entreprises sur l''année';
COMMENT ON COLUMN indicateurs_territoriaux.evolution_creations IS 'Évolution des créations en % par rapport à N-1';
COMMENT ON COLUMN indicateurs_territoriaux.nb_defaillances IS 'Nombre de défaillances sur l''année';
COMMENT ON COLUMN indicateurs_territoriaux.evolution_defaillances IS 'Évolution des défaillances en % par rapport à N-1';
COMMENT ON COLUMN indicateurs_territoriaux.taux_chomage IS 'Taux de chômage départemental en %';
COMMENT ON COLUMN indicateurs_territoriaux.revenus_medians IS 'Revenus médians du département en euros';
COMMENT ON COLUMN indicateurs_territoriaux.ratios_percentiles IS 'Percentiles des ratios financiers du secteur (JSONB)';
COMMENT ON COLUMN indicateurs_territoriaux.sources IS 'Sources des données avec dates de mise à jour (JSONB array)';

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur la table
ALTER TABLE indicateurs_territoriaux ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : tous les utilisateurs authentifiés peuvent lire
CREATE POLICY "Authenticated users can view territorial indicators"
ON indicateurs_territoriaux
FOR SELECT
TO authenticated
USING (true);

-- Politique d'insertion : réservée aux admins (service role)
-- Les insertions se feront via le service role lors des syncs API
