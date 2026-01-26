-- ============================================
-- Migration: Politiques RLS pour indicateurs_territoriaux
-- Description: Ajoute les politiques INSERT et UPDATE pour le cache des indicateurs
-- ============================================

-- Les indicateurs territoriaux sont des données INSEE publiques
-- Tous les utilisateurs authentifiés peuvent lire et contribuer au cache

-- Supprimer les politiques existantes si elles existent (idempotence)
DROP POLICY IF EXISTS "Authenticated users can insert territorial indicators" ON indicateurs_territoriaux;
DROP POLICY IF EXISTS "Authenticated users can update territorial indicators" ON indicateurs_territoriaux;

-- Politique d'insertion : utilisateurs authentifiés peuvent insérer
CREATE POLICY "Authenticated users can insert territorial indicators"
ON indicateurs_territoriaux
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Politique de mise à jour : utilisateurs authentifiés peuvent mettre à jour
CREATE POLICY "Authenticated users can update territorial indicators"
ON indicateurs_territoriaux
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
