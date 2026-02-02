-- Migration: Ajouter le flag is_admin à user_profiles
-- Date: 2025-01-31

-- Ajouter la colonne is_admin
ALTER TABLE public.user_profiles
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Mettre le compte Clément en admin
UPDATE public.user_profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'clement.pandreau@synaptic-hub.fr'
);
