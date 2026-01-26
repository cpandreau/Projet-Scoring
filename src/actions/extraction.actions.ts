'use server'

import { generateText, Output } from 'ai'
import { revalidatePath } from 'next/cache'
import { getCaseDescription } from '@/config/cerfa-mapping.config'
import { getPromptForLiasse, isValidTypeLiasse } from '@/config/prompts'
import { gemini } from '@/lib/gemini'
import { createClient } from '@/lib/supabase/server'
import {
  type ExtractionData,
  extractionSchema,
  type NumericExtractionField,
  type ValueWithSource,
} from '@/schemas/extraction.schema'
import type { TypeLiasse } from '@/types/document'

/**
 * Liste des champs à extraire avec leurs identifiants dans le schema
 */
const FIELDS_TO_EXTRACT: NumericExtractionField[] = [
  // Bilan Actif
  'actif_immobilise',
  'stocks',
  'creances_clients',
  'disponibilites',
  'actif_circulant',
  // Bilan Passif
  'capitaux_propres',
  'dettes_financieres',
  'dettes_fournisseurs',
  'decouvert_bancaire',
  'total_passif',
  'dettes_fiscales_sociales',
  'comptes_courants_associes',
  'provisions_risques_charges',
  // Compte de résultat - Produits
  'chiffre_affaires',
  'ventes_marchandises',
  'production',
  'subventions_exploitation',
  'reprises_provisions',
  'variation_stocks',
  // Compte de résultat - Charges
  'achats_marchandises',
  'achats_matieres_premieres',
  'autres_charges_externes',
  'impots_taxes',
  'charges_personnel',
  'charges_financieres',
  'dotations_amortissements',
  // Résultats
  'resultat_exploitation',
  'resultat_net',
]

/**
 * Génère les instructions d'extraction pour chaque champ en utilisant la config CERFA
 */
function generateFieldInstructions(): string {
  return FIELDS_TO_EXTRACT.map((fieldId) => {
    const normalDesc = getCaseDescription(fieldId, false)
    const simplifiedDesc = getCaseDescription(fieldId, true)

    if (!normalDesc || !simplifiedDesc) return null

    const normalColonne = normalDesc.colonne
      ? ` colonne ${normalDesc.colonne === 3 ? '"Net"' : normalDesc.colonne}`
      : ''
    const simplifiedColonne = simplifiedDesc.colonne ? ` colonne ${simplifiedDesc.colonne}` : ''

    return `${normalDesc.nom.toUpperCase()} :
  - Liasse normale : case${normalDesc.cases.includes('+') ? 's' : ''} ${normalDesc.cases}${normalColonne} du ${normalDesc.formulaire}
  - Liasse simplifiée : case${simplifiedDesc.cases.includes('+') ? 's' : ''} ${simplifiedDesc.cases}${simplifiedColonne}`
  })
    .filter(Boolean)
    .join('\n\n')
}

/**
 * Génère le prompt système complet pour l'extraction
 */
function generateExtractionPrompt(): string {
  const fieldInstructions = generateFieldInstructions()

  return `Tu es un expert-comptable français spécialisé dans l'extraction de données des liasses fiscales (CERFA 2050-2059 et 2033).

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 1 : IDENTIFIER LE TYPE DE LIASSE
═══════════════════════════════════════════════════════════════════════════════

Examine d'abord le document pour déterminer son type :

LIASSE NORMALE (CERFA 2050-2059) :
   - Plusieurs feuillets séparés numérotés 2050, 2051, 2052, 2053...
   - Cases avec lettres (AA, AB, BK, DL, FL, GG, HN, etc.)
   - Bilan actif sur 2050, Bilan passif sur 2051, Compte de résultat sur 2052/2053

LIASSE SIMPLIFIÉE (CERFA 2033) :
   - Formulaire unique ou feuillets 2033-A, 2033-B
   - Cases avec numéros à 3 chiffres (010, 048, 110, 142, 210, 270, 310, etc.)
   - Présentation condensée sur moins de pages

Retourne le type dans le champ "type_liasse" : "normale" ou "simplifiee"

═══════════════════════════════════════════════════════════════════════════════
ÉTAPE 2 : EXTRAIRE LES VALEURS SELON LE TYPE DE LIASSE
═══════════════════════════════════════════════════════════════════════════════

Pour CHAQUE champ ci-dessous, retourne un objet avec :
- "valeur" : le montant en euros (nombre entier, sans centimes), ou null si non trouvé
- "case_source" : la référence trouvée, ex: "BK (2050)" ou "048 (simplifié)"

CHAMPS À EXTRAIRE :

${fieldInstructions}

═══════════════════════════════════════════════════════════════════════════════
RÈGLES IMPORTANTES
═══════════════════════════════════════════════════════════════════════════════

1. VALEURS :
   - Retourne 0 si la case existe mais est vide ou contient zéro
   - Retourne null UNIQUEMENT si tu ne trouves pas du tout la case
   - Les montants sont en euros entiers, sans centimes

2. SIGNES :
   - Les charges sont positives (achats, salaires, etc.)
   - Le résultat peut être négatif (perte)
   - Les montants entre parenthèses () sont négatifs

3. FORMAT CASE_SOURCE :
   - Liasse normale : "CASE (formulaire)" ex: "FL (2052)", "DL (2051)", "BK (2050)"
   - Liasse simplifiée : "CASE (simplifié)" ex: "210 (simplifié)", "142 (simplifié)"
   - Addition de cases : "CASE1+CASE2 (formulaire)" ex: "FY+FZ (2052)", "250+252 (simplifié)"

4. COLONNES BILAN ACTIF :
   - Liasse normale : prends la colonne "Net" (colonne 3)
   - Liasse simplifiée : prends la colonne 2 (Net)

5. CALCULS :
   - Si plusieurs cases doivent être additionnées, fais le calcul
   - Indique toutes les cases utilisées dans case_source

6. CAS PARTICULIERS EN LIASSE SIMPLIFIÉE (2033) :
   - DÉCOUVERT BANCAIRE : retourne null, ce poste n'est pas isolable (inclus dans emprunts case 156)
   - DETTES FISCALES ET SOCIALES : calcule case 172 - case 169 (autres dettes moins comptes courants)
   - COMPTES COURANTS D'ASSOCIÉS : case 169 (identifiée comme "dont comptes courants d'associés")
   - REPRISES SUR PROVISIONS : retourne 0, ce poste n'est pas isolable en liasse simplifiée

═══════════════════════════════════════════════════════════════════════════════
⚠️ RÈGLES CRITIQUES - LIASSE SIMPLIFIÉE 2033-B - ERREURS À ÉVITER
═══════════════════════════════════════════════════════════════════════════════

A) CHIFFRE D'AFFAIRES ET VENTES (Produits d'exploitation) :

   Cases du formulaire 2033-B :
   - Case 210 = Ventes de marchandises
   - Case 214 = Production vendue - biens
   - Case 218 = Production vendue - services
   - Case 222 = Production stockée
   - Case 224 = Production immobilisée
   - Case 226 = Subventions d'exploitation reçues
   - Case 230 = Autres produits
   - Case 232 = Total produits d'exploitation

   Extraction correcte :
   - ventes_marchandises = Case 210 SEULE (si vide → 0)
   - production = Case 214 + Case 218
   - chiffre_affaires = Case 210 + Case 214 + Case 218

   Pour un cabinet comptable ou prestataire de services :
   - Case 210 est souvent VIDE (pas de ventes de marchandises)
   - Le CA provient de la Case 218 (production services)

B) SUBVENTIONS ET AUTRES PRODUITS :

   - subventions_exploitation = Case 226 UNIQUEMENT
   - NE PAS CONFONDRE avec Case 230 "Autres produits"
   - Si case 226 est vide, mettre 0

C) REPRISES SUR PROVISIONS :

   - En liasse simplifiée 2033-B, ce poste n'est pas isolable
   - Retourner : { "valeur": 0, "case_source": "NULL (simplifié)" }

═══════════════════════════════════════════════════════════════════════════════
EXEMPLE DE RÉPONSE LIASSE NORMALE
═══════════════════════════════════════════════════════════════════════════════

{
  "type_liasse": "normale",
  "chiffre_affaires": { "valeur": 1500000, "case_source": "FL (2052)" },
  "ventes_marchandises": { "valeur": 1500000, "case_source": "FC (2052)" },
  "production": { "valeur": 0, "case_source": "FM+FN (2052)" },
  "achats_marchandises": { "valeur": 800000, "case_source": "FS (2052)" },
  "charges_personnel": { "valeur": 350000, "case_source": "FY+FZ (2052)" },
  "capitaux_propres": { "valeur": 250000, "case_source": "DL (2051)" },
  "actif_immobilise": { "valeur": 180000, "case_source": "BK (2050)" },
  "resultat_net": { "valeur": 45000, "case_source": "HN (2053)" },
  "reprises_provisions": { "valeur": 5000, "case_source": "FP (2052)" }
}

═══════════════════════════════════════════════════════════════════════════════
EXEMPLE DE RÉPONSE LIASSE SIMPLIFIÉE - Cabinet comptable (CA services)
═══════════════════════════════════════════════════════════════════════════════

{
  "type_liasse": "simplifiee",
  "chiffre_affaires": { "valeur": 489164, "case_source": "210+214+218 (simplifié)" },
  "ventes_marchandises": { "valeur": 0, "case_source": "210 (simplifié) - vide" },
  "production": { "valeur": 489164, "case_source": "214+218 (simplifié)" },
  "subventions_exploitation": { "valeur": 0, "case_source": "226 (simplifié) - vide" },
  "reprises_provisions": { "valeur": 0, "case_source": "NULL (simplifié)" },
  "charges_personnel": { "valeur": 180000, "case_source": "250+252 (simplifié)" },
  "capitaux_propres": { "valeur": 95000, "case_source": "142 (simplifié)" },
  "actif_immobilise": { "valeur": 45000, "case_source": "048 (simplifié)" },
  "resultat_net": { "valeur": 12000, "case_source": "310 (simplifié)" },
  "decouvert_bancaire": { "valeur": null, "case_source": null },
  "dettes_fiscales_sociales": { "valeur": 15000, "case_source": "172-169 (simplifié)" },
  "comptes_courants_associes": { "valeur": 5000, "case_source": "169 (simplifié)" }
}

⚠️ EXEMPLE INCORRECT À ÉVITER :
{
  "ventes_marchandises": { "valeur": 489164, ... },  ← FAUX ! C'est la production services
  "production": { "valeur": 0, ... },                ← FAUX ! Production = 489164
  "subventions_exploitation": { "valeur": 1581, ... } ← FAUX ! C'est "Autres produits" case 230
}`
}

const EXTRACTION_SYSTEM_PROMPT = generateExtractionPrompt()

export async function extractDocument(documentId: string): Promise<{
  success?: boolean
  data?: ExtractionData
  error?: string
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le document avec vérification d'accès
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*, dossiers!inner(id, user_id)')
    .eq('id', documentId)
    .single()

  if (docError || !document) {
    console.error('Error fetching document:', docError)
    return { error: 'Document non trouvé' }
  }

  if ((document.dossiers as { user_id: string }).user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  const enterpriseId = (document.dossiers as { id: string }).id

  // Déterminer le prompt à utiliser selon le type de document
  let extractionPrompt = EXTRACTION_SYSTEM_PROMPT // Prompt générique par défaut

  if (document.type === 'liasse_fiscale') {
    // Pour les liasses fiscales, vérifier que type_liasse est défini
    if (!isValidTypeLiasse(document.type_liasse)) {
      return {
        error: "Veuillez sélectionner le type de liasse (normale ou simplifiée) avant l'extraction",
      }
    }
    // Utiliser le prompt optimisé pour ce type de liasse
    extractionPrompt = getPromptForLiasse(document.type_liasse as TypeLiasse)
  }

  // Télécharger le PDF depuis Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(document.storage_path)

  if (downloadError || !fileData) {
    console.error('Error downloading PDF:', downloadError)
    return { error: 'Erreur lors du téléchargement du document' }
  }

  // Convertir le Blob en Buffer pour l'envoi à Gemini
  const arrayBuffer = await fileData.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  try {
    // Extraire les données avec Gemini
    const { output: extractedData } = await generateText({
      model: gemini,
      output: Output.object({
        schema: extractionSchema,
      }),
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: extractionPrompt,
            },
            {
              type: 'file',
              data: buffer,
              mediaType: 'application/pdf',
            },
            {
              type: 'text',
              text: 'Extrais les données comptables de ce document avec leurs cases sources CERFA.',
            },
          ],
        },
      ],
    })

    if (!extractedData) {
      return { error: 'Aucune donnée extraite du document' }
    }

    // Vérifier si des données existantes pour ce document
    const { data: existingData } = await supabase
      .from('donnees_extraites')
      .select('id')
      .eq('document_id', documentId)
      .single()

    if (existingData) {
      // Mettre à jour les données existantes
      const { error: updateError } = await supabase
        .from('donnees_extraites')
        .update({
          donnees: extractedData,
          is_validated: false,
        })
        .eq('id', existingData.id)

      if (updateError) {
        console.error('Error updating extracted data:', updateError)
        return { error: 'Erreur lors de la mise à jour des données' }
      }
    } else {
      // Insérer les nouvelles données
      const { error: insertError } = await supabase.from('donnees_extraites').insert({
        document_id: documentId,
        donnees: extractedData,
        is_validated: false,
      })

      if (insertError) {
        console.error('Error inserting extracted data:', insertError)
        return { error: "Erreur lors de l'enregistrement des données" }
      }
    }

    // Mettre à jour le statut du dossier
    const { error: statusError } = await supabase
      .from('dossiers')
      .update({ statut: 'extrait' })
      .eq('id', enterpriseId)

    if (statusError) {
      console.error('Error updating enterprise status:', statusError)
    }

    // Invalider le cache pour forcer le rechargement des données
    revalidatePath(`/enterprise/${enterpriseId}`)
    revalidatePath('/enterprise')

    return { success: true, data: extractedData }
  } catch (error) {
    console.error('Error extracting data with Gemini:', error)
    return { error: "Erreur lors de l'extraction des données" }
  }
}

export async function updateExtraction(
  extractionId: string,
  enterpriseId: string,
  donnees: ExtractionData
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier l'accès à l'extraction
  const { data: extraction, error: fetchError } = await supabase
    .from('donnees_extraites')
    .select('*, documents!inner(dossiers!inner(user_id))')
    .eq('id', extractionId)
    .single()

  if (fetchError || !extraction) {
    console.error('Error fetching extraction:', fetchError)
    return { error: 'Données extraites non trouvées' }
  }

  const userId = (extraction.documents as { dossiers: { user_id: string } }).dossiers.user_id
  if (userId !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Vérifier si déjà validé
  if (extraction.is_validated) {
    return { error: 'Les données validées ne peuvent plus être modifiées' }
  }

  // Mettre à jour les données
  const { error: updateError } = await supabase
    .from('donnees_extraites')
    .update({ donnees })
    .eq('id', extractionId)

  if (updateError) {
    console.error('Error updating extraction:', updateError)
    return { error: 'Erreur lors de la mise à jour' }
  }

  // Invalider le cache
  revalidatePath(`/enterprise/${enterpriseId}`)
  revalidatePath('/enterprise')

  return { success: true }
}

/**
 * Convertit les valeurs null/undefined en 0 pour toutes les données d'extraction
 * en préservant les case_source et type_liasse
 */
function convertNullToZero(data: ExtractionData): ExtractionData {
  // Copier type_liasse tel quel
  const result: ExtractionData = {
    type_liasse: data.type_liasse,
    // Initialiser tous les champs numériques avec des valeurs par défaut
    chiffre_affaires: { valeur: 0, case_source: null },
    achats_marchandises: { valeur: 0, case_source: null },
    achats_matieres_premieres: { valeur: 0, case_source: null },
    autres_charges_externes: { valeur: 0, case_source: null },
    impots_taxes: { valeur: 0, case_source: null },
    charges_personnel: { valeur: 0, case_source: null },
    charges_financieres: { valeur: 0, case_source: null },
    resultat_exploitation: { valeur: 0, case_source: null },
    resultat_net: { valeur: 0, case_source: null },
    actif_immobilise: { valeur: 0, case_source: null },
    actif_circulant: { valeur: 0, case_source: null },
    stocks: { valeur: 0, case_source: null },
    creances_clients: { valeur: 0, case_source: null },
    disponibilites: { valeur: 0, case_source: null },
    capitaux_propres: { valeur: 0, case_source: null },
    total_passif: { valeur: 0, case_source: null },
    dettes_financieres: { valeur: 0, case_source: null },
    dettes_fournisseurs: { valeur: 0, case_source: null },
    decouvert_bancaire: { valeur: 0, case_source: null },
    ventes_marchandises: { valeur: 0, case_source: null },
    production: { valeur: 0, case_source: null },
    // Champs complémentaires pour calculs avancés (CAF, BFR, EBE)
    subventions_exploitation: { valeur: 0, case_source: null },
    dettes_fiscales_sociales: { valeur: 0, case_source: null },
    comptes_courants_associes: { valeur: 0, case_source: null },
    provisions_risques_charges: { valeur: 0, case_source: null },
    dotations_amortissements: { valeur: 0, case_source: null },
    reprises_provisions: { valeur: 0, case_source: null },
    variation_stocks: { valeur: 0, case_source: null },
  }

  // Mettre à jour avec les valeurs réelles, convertissant null/undefined en 0
  for (const key of FIELDS_TO_EXTRACT) {
    const field = data[key] as ValueWithSource
    if (field) {
      // Convertir null, undefined, ou valeurs non numériques en 0
      let valeur = 0
      if (field.valeur !== null && field.valeur !== undefined) {
        if (typeof field.valeur === 'number' && !Number.isNaN(field.valeur)) {
          valeur = field.valeur
        }
      }
      result[key] = {
        valeur,
        case_source: field.case_source,
      }
    }
  }

  return result
}

export async function validateExtraction(
  extractionId: string,
  enterpriseId: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier l'accès à l'extraction
  const { data: extraction, error: fetchError } = await supabase
    .from('donnees_extraites')
    .select('*, documents!inner(dossiers!inner(id, user_id))')
    .eq('id', extractionId)
    .single()

  if (fetchError || !extraction) {
    console.error('Error fetching extraction:', fetchError)
    return { error: 'Données extraites non trouvées' }
  }

  const dossiers = extraction.documents as { dossiers: { id: string; user_id: string } }
  if (dossiers.dossiers.user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Convertir les valeurs null en 0 avant validation
  const donneesOriginales = extraction.donnees as ExtractionData
  const donneesNormalisees = convertNullToZero(donneesOriginales)

  // Marquer comme validé avec les données normalisées
  const { error: updateError } = await supabase
    .from('donnees_extraites')
    .update({
      donnees: donneesNormalisees,
      is_validated: true,
    })
    .eq('id', extractionId)

  if (updateError) {
    console.error('Error validating extraction:', updateError)
    return { error: 'Erreur lors de la validation' }
  }

  // Mettre à jour le statut du dossier à "valide"
  const { error: statusError } = await supabase
    .from('dossiers')
    .update({ statut: 'valide' })
    .eq('id', enterpriseId)

  if (statusError) {
    console.error('Error updating enterprise status:', statusError)
  }

  // Invalider le cache pour forcer le rechargement des données
  revalidatePath(`/enterprise/${enterpriseId}`)
  revalidatePath('/enterprise')

  return { success: true }
}

/**
 * Valide en masse toutes les extractions non validées d'un dossier
 */
export async function bulkValidateExtractions(
  enterpriseId: string,
  extractionIds: string[]
): Promise<{ success?: boolean; count?: number; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Vérifier l'accès au dossier
  const { data: enterprise, error: enterpriseError } = await supabase
    .from('dossiers')
    .select('id, user_id')
    .eq('id', enterpriseId)
    .single()

  if (enterpriseError || !enterprise) {
    return { error: 'Dossier non trouvé' }
  }

  if (enterprise.user_id !== user.id) {
    return { error: 'Accès non autorisé' }
  }

  // Récupérer toutes les extractions à valider
  const { data: extractions, error: fetchError } = await supabase
    .from('donnees_extraites')
    .select('id, donnees')
    .in('id', extractionIds)
    .eq('is_validated', false)

  if (fetchError) {
    console.error('Error fetching extractions:', fetchError)
    return { error: 'Erreur lors de la récupération des données' }
  }

  if (!extractions || extractions.length === 0) {
    return { success: true, count: 0 }
  }

  // Valider chaque extraction avec normalisation des données
  let validatedCount = 0
  for (const extraction of extractions) {
    const donneesNormalisees = convertNullToZero(extraction.donnees as ExtractionData)

    const { error: updateError } = await supabase
      .from('donnees_extraites')
      .update({
        donnees: donneesNormalisees,
        is_validated: true,
      })
      .eq('id', extraction.id)

    if (!updateError) {
      validatedCount++
    }
  }

  // Mettre à jour le statut du dossier à "valide"
  const { error: statusError } = await supabase
    .from('dossiers')
    .update({ statut: 'valide' })
    .eq('id', enterpriseId)

  if (statusError) {
    console.error('Error updating enterprise status:', statusError)
  }

  // Invalider le cache
  revalidatePath(`/enterprise/${enterpriseId}`)
  revalidatePath('/enterprise')

  return { success: true, count: validatedCount }
}
