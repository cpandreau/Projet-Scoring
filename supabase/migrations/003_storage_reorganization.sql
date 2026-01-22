-- ============================================
-- Migration: Réorganisation du stockage des documents
-- ============================================

-- 1. Ajouter le type "non_classe" à l'enum type_document
ALTER TYPE type_document ADD VALUE IF NOT EXISTS 'non_classe';

-- 2. Créer le bucket "documents" s'il n'existe pas
-- Note: À exécuter via le Dashboard Supabase ou avec les droits superuser
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. POLITIQUES DE STOCKAGE POUR LE BUCKET "documents"
-- ============================================

-- Structure des chemins: {userId}/{enterpriseId}/{type}/{filename}
-- Exemples:
--   user123/enterprise456/non-classe/1234567890_rapport.pdf
--   user123/enterprise456/liasse-fiscale/1234567890_liasse.pdf
--   user123/enterprise456/bilan/1234567890_bilan.pdf

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Policy: Les utilisateurs authentifiés peuvent uploader dans leur propre dossier
-- Le chemin doit commencer par leur user_id
CREATE POLICY "Users can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Les utilisateurs authentifiés peuvent lire leurs propres fichiers
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Les utilisateurs authentifiés peuvent mettre à jour leurs propres fichiers
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Les utilisateurs authentifiés peuvent supprimer leurs propres fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 4. NOTES IMPORTANTES
-- ============================================
--
-- Avant d'exécuter cette migration, assurez-vous de créer le bucket "documents"
-- via le Dashboard Supabase:
-- 1. Aller dans Storage > New Bucket
-- 2. Nom: "documents"
-- 3. Public bucket: NON (décoché)
-- 4. File size limit: selon vos besoins (ex: 10MB)
-- 5. Allowed MIME types: application/pdf
--
-- Ou via SQL (nécessite les droits superuser):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'documents',
--   'documents',
--   false,
--   10485760,  -- 10MB
--   ARRAY['application/pdf']
-- )
-- ON CONFLICT (id) DO NOTHING;
