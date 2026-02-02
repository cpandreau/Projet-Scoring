-- ============================================
-- Migration: Create user_profiles table
-- Description: Table de profils utilisateurs avec type et plan
-- Date: 2026-01-31
-- ============================================

-- ============================================
-- 1. CRÉATION DE LA TABLE
-- ============================================

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('dirigeant', 'comptable')),
  plan VARCHAR(20) NOT NULL DEFAULT 'gratuit' CHECK (plan IN ('gratuit', 'essentiel', 'pro', 'solo', 'cabinet')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les requêtes par type
CREATE INDEX idx_user_profiles_user_type ON public.user_profiles(user_type);

-- Commentaires
COMMENT ON TABLE public.user_profiles IS 'Profils utilisateurs avec type (dirigeant/comptable) et plan d''abonnement';
COMMENT ON COLUMN public.user_profiles.user_type IS 'Type d''utilisateur: dirigeant ou comptable';
COMMENT ON COLUMN public.user_profiles.plan IS 'Plan d''abonnement: gratuit, essentiel, pro, solo ou cabinet';

-- ============================================
-- 2. TRIGGER updated_at
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur UPDATE
CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. ACTIVATION RLS
-- ============================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. POLITIQUES RLS
-- ============================================

-- SELECT: l'utilisateur voit uniquement son propre profil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- UPDATE: l'utilisateur peut modifier son propre profil
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT: permettre l'insertion via le trigger (service role)
-- Note: Les inserts normaux passent par le trigger qui utilise SECURITY DEFINER
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 5. TRIGGER AUTO-CRÉATION PROFIL
-- ============================================

-- Fonction déclenchée à la création d'un utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_type, plan)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'role',
      'dirigeant'  -- Valeur par défaut si non spécifié
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'plan',
      'gratuit'
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. MIGRATION DES UTILISATEURS EXISTANTS
-- ============================================

-- Créer les profils pour les utilisateurs existants
INSERT INTO public.user_profiles (id, user_type, plan, created_at)
SELECT
  id,
  COALESCE(raw_user_meta_data->>'role', 'dirigeant'),
  COALESCE(raw_user_meta_data->>'plan', 'gratuit'),
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_profiles)
ON CONFLICT (id) DO NOTHING;
