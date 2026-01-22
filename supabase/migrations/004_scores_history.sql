-- ============================================
-- Migration: Table d'historique des scores
-- ============================================

-- Créer la table scores_history
CREATE TABLE IF NOT EXISTS scores_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enterprise_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  annee_exercice INTEGER NOT NULL,
  score_global DECIMAL(4, 2) NOT NULL,
  score_liquidite DECIMAL(4, 2),
  score_rentabilite DECIMAL(4, 2),
  score_solvabilite DECIMAL(4, 2),
  score_activite DECIMAL(4, 2),
  score_evolution DECIMAL(4, 2),
  detail_ratios JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Créer les index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_scores_history_enterprise
ON scores_history(enterprise_id);

CREATE INDEX IF NOT EXISTS idx_scores_history_enterprise_date
ON scores_history(enterprise_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_scores_history_annee
ON scores_history(enterprise_id, annee_exercice);

-- Commentaires de documentation
COMMENT ON TABLE scores_history IS 'Historique des scores de défaillance calculés pour chaque entreprise';
COMMENT ON COLUMN scores_history.annee_exercice IS 'Année des données financières utilisées pour le calcul';
COMMENT ON COLUMN scores_history.score_global IS 'Score global de défaillance (0-10)';
COMMENT ON COLUMN scores_history.detail_ratios IS 'Détail de tous les ratios avec leurs valeurs, scores et zones';

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Activer RLS sur la table
ALTER TABLE scores_history ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : un utilisateur ne voit que les scores de ses entreprises
CREATE POLICY "Users can view their own enterprise scores"
ON scores_history
FOR SELECT
USING (
  enterprise_id IN (
    SELECT id FROM dossiers WHERE user_id = auth.uid()
  )
);

-- Politique d'insertion : un utilisateur ne peut ajouter des scores que pour ses entreprises
CREATE POLICY "Users can insert scores for their own enterprises"
ON scores_history
FOR INSERT
WITH CHECK (
  enterprise_id IN (
    SELECT id FROM dossiers WHERE user_id = auth.uid()
  )
);

-- Politique de suppression : un utilisateur ne peut supprimer que les scores de ses entreprises
CREATE POLICY "Users can delete their own enterprise scores"
ON scores_history
FOR DELETE
USING (
  enterprise_id IN (
    SELECT id FROM dossiers WHERE user_id = auth.uid()
  )
);
