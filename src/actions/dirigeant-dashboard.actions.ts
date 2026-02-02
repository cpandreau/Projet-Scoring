'use server'

import { RATIOS } from '@/config/ratios.config'
import { syncEntreprise } from '@/lib/services/entreprise-sync-service'
import { createClient } from '@/lib/supabase/server'

import { autoImportINPIBilans } from './inpi'
import { searchSirene } from './sirene.actions'

/**
 * Types pour le dashboard dirigeant
 */
export type DossierStatut = 'brouillon' | 'documents_uploades' | 'extrait' | 'valide' | 'analyse'
export type RatioZone = 'vert' | 'jaune' | 'rouge'
export type RatioFamille = 'liquidite' | 'rentabilite' | 'solvabilite' | 'activite' | 'evolution'

export interface RatioDetail {
  code: string
  nom: string
  valeur: number
  zone: RatioZone
  famille: RatioFamille
  explicationSimple: string
}

export interface DossierScore {
  global: number
  liquidite: number
  rentabilite: number
  solvabilite: number
  activite: number
  evolution: number
  anneeExercice: number
}

export interface DossierSummary {
  id: string
  siren: string | null
  raisonSociale: string | null
  statut: DossierStatut
  createdAt: Date
  score?: DossierScore
}

export interface DirigeantDashboardData {
  dossiers: DossierSummary[]
  currentDossierId: string | null
  pointsAttention: RatioDetail[]
  justCreated: boolean
}

/**
 * Explications simples pour chaque ratio (langage dirigeant)
 */
const RATIO_EXPLICATIONS: Record<string, string> = {
  // Liquidité
  liquidite_generale: 'Capacité à payer vos dettes à court terme avec vos actifs circulants',
  liquidite_immediate: 'Capacité à payer immédiatement vos dettes avec votre trésorerie',
  couverture_bfr: 'Votre fonds de roulement couvre-t-il votre besoin en fonds de roulement ?',

  // Rentabilité
  taux_rentabilite_financiere: 'Rendement de vos capitaux propres investis',
  rentabilite_economique: "Performance économique de l'ensemble de vos actifs",
  taux_va: "Part de valeur ajoutée créée par rapport à votre chiffre d'affaires",
  taux_ebe: "Profitabilité brute de votre activité avant charges financières et impôts",
  taux_marge_brute: 'Marge dégagée après les charges de personnel',
  taux_marge_industrielle: 'Marge sur votre activité de production',
  taux_marge_commerciale: 'Marge sur votre activité de négoce',
  rentabilite_commerciale: "Part du résultat net dans votre chiffre d'affaires",
  charges_personnel_va: 'Poids des salaires dans la valeur créée',
  charges_financieres_va: 'Poids des intérêts bancaires dans la valeur créée',
  impots_taxes_va: 'Poids fiscal dans la valeur créée',

  // Solvabilité
  capacite_remboursement: 'Délai théorique pour rembourser vos dettes avec votre CAF',
  taux_endettement: 'Niveau de dettes par rapport à vos fonds propres',
  autonomie_financiere: 'Indépendance financière vis-à-vis des créanciers',
  equilibre_global: 'Équilibre entre ressources stables et emplois durables',
  poids_decouvert: 'Part du découvert dans vos dettes financières',

  // Activité
  ratio_fonds_roulement: 'Couverture de vos immobilisations par des ressources stables',
  delai_fournisseurs: 'Délai moyen de paiement de vos fournisseurs',
  delai_clients: 'Délai moyen de règlement de vos clients',
  rotation_stocks: 'Durée moyenne de stockage de vos marchandises',
  cash_flow_exploitation: "Génération de trésorerie par l'exploitation",

  // Évolution
  variation_ca_n1: "Croissance de votre chiffre d'affaires sur 1 an",
  variation_ca_n2: "Croissance de votre chiffre d'affaires sur 2 ans",
  variation_va_n1: 'Croissance de votre valeur ajoutée sur 1 an',
  variation_va_n2: 'Croissance de votre valeur ajoutée sur 2 ans',
  variation_resultat_n1: 'Évolution de votre résultat net sur 1 an',
  variation_resultat_n2: 'Évolution de votre résultat net sur 2 ans',
  variation_marge_commerciale_n1: 'Évolution de votre marge commerciale sur 1 an',
  variation_marge_commerciale_n2: 'Évolution de votre marge commerciale sur 2 ans',
  variation_marge_brute_n1: 'Évolution de votre marge brute sur 1 an',
  variation_marge_brute_n2: 'Évolution de votre marge brute sur 2 ans',
  variation_charges_personnel_va_n1: 'Évolution du poids des salaires sur 1 an',
  variation_charges_personnel_va_n2: 'Évolution du poids des salaires sur 2 ans',
  variation_charges_financieres_va_n1: 'Évolution du poids des charges financières sur 1 an',
  variation_charges_financieres_va_n2: 'Évolution du poids des charges financières sur 2 ans',
  variation_impots_va_n1: 'Évolution de la pression fiscale sur 1 an',
  variation_impots_va_n2: 'Évolution de la pression fiscale sur 2 ans',
  variation_rotation_stocks_n1: 'Évolution de la rotation des stocks sur 1 an',
  variation_rotation_stocks_n2: 'Évolution de la rotation des stocks sur 2 ans',
}

/**
 * Structure brute d'un ratio dans detail_ratios (Supabase JSONB)
 */
interface RawRatioDetail {
  id: string
  nom: string
  zone: string
  points: number
  valeur: number
  pointsMax: number
}

/**
 * Récupère les données du dashboard pour un dirigeant
 * - Tous ses dossiers non archivés
 * - Le dernier score pour chaque dossier analysé
 * - Crée automatiquement un dossier si SIREN dans metadata et 0 dossiers
 */
export async function getDirigeantDashboardData(): Promise<DirigeantDashboardData> {
  const supabase = await createClient()

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { dossiers: [], currentDossierId: null, pointsAttention: [], justCreated: false }
  }

  // Récupérer tous les dossiers de l'utilisateur (non archivés)
  let { data: dossiers, error: dossiersError } = await supabase
    .from('dossiers')
    .select('id, siren, raison_sociale, statut, created_at')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (dossiersError) {
    console.error('[getDirigeantDashboardData] Erreur récupération dossiers:', dossiersError.message)
    return { dossiers: [], currentDossierId: null, pointsAttention: [], justCreated: false }
  }

  // Si aucun dossier, tenter de créer automatiquement depuis les metadata
  let justCreated = false

  if (!dossiers || dossiers.length === 0) {
    const sirenFromMetadata = user.user_metadata?.siren as string | undefined
    const companyNameFromMetadata = user.user_metadata?.company_name as string | undefined

    if (sirenFromMetadata && /^\d{9}$/.test(sirenFromMetadata)) {
      // Tenter de créer le dossier automatiquement
      const createdDossier = await createDossierFromMetadata(
        supabase,
        user.id,
        user.email || '',
        sirenFromMetadata,
        companyNameFromMetadata
      )

      if (createdDossier) {
        dossiers = [createdDossier]
        justCreated = true
      }
    }

    // Si toujours pas de dossier, retourner vide
    if (!dossiers || dossiers.length === 0) {
      return { dossiers: [], currentDossierId: null, pointsAttention: [], justCreated: false }
    }
  }

  // Récupérer les scores pour les dossiers analysés
  const dossierIds = dossiers
    .filter((d) => d.statut === 'analyse')
    .map((d) => d.id)

  let scoresMap: Map<string, DossierScore> = new Map()
  let pointsAttention: RatioDetail[] = []

  if (dossierIds.length > 0) {
    // Récupérer le dernier score pour chaque dossier analysé (avec detail_ratios)
    const { data: scores, error: scoresError } = await supabase
      .from('scores_history')
      .select(
        'enterprise_id, score_global, score_liquidite, score_rentabilite, score_solvabilite, score_activite, score_evolution, annee_exercice, detail_ratios, created_at'
      )
      .in('enterprise_id', dossierIds)
      .order('created_at', { ascending: false })

    if (scoresError) {
      console.error('[getDirigeantDashboardData] Erreur récupération scores:', scoresError.message)
    } else if (scores) {
      // Garder uniquement le dernier score par dossier
      let latestDetailRatios: Record<string, RawRatioDetail> | null = null

      for (const score of scores) {
        if (!scoresMap.has(score.enterprise_id)) {
          scoresMap.set(score.enterprise_id, {
            global: Number(score.score_global) || 0,
            liquidite: Number(score.score_liquidite) || 0,
            rentabilite: Number(score.score_rentabilite) || 0,
            solvabilite: Number(score.score_solvabilite) || 0,
            activite: Number(score.score_activite) || 0,
            evolution: Number(score.score_evolution) || 0,
            anneeExercice: score.annee_exercice,
          })

          // Stocker les detail_ratios du dossier le plus récent (premier dans la liste)
          if (!latestDetailRatios && score.detail_ratios) {
            latestDetailRatios = score.detail_ratios as Record<string, RawRatioDetail>
          }
        }
      }

      // Extraire les points d'attention (ratios rouge et jaune)
      if (latestDetailRatios) {
        pointsAttention = extractPointsAttention(latestDetailRatios)
      }
    }
  }

  // Construire la réponse
  const dossiersSummary: DossierSummary[] = dossiers.map((dossier) => ({
    id: dossier.id,
    siren: dossier.siren,
    raisonSociale: dossier.raison_sociale,
    statut: dossier.statut as DossierStatut,
    createdAt: new Date(dossier.created_at),
    score: scoresMap.get(dossier.id),
  }))

  return {
    dossiers: dossiersSummary,
    currentDossierId: dossiersSummary[0]?.id || null, // Le plus récent
    pointsAttention,
    justCreated,
  }
}

/**
 * Extrait les ratios en zone rouge et jaune depuis detail_ratios
 * Triés par gravité (rouge d'abord, puis jaune)
 */
function extractPointsAttention(detailRatios: Record<string, RawRatioDetail>): RatioDetail[] {
  const points: RatioDetail[] = []

  for (const [code, ratio] of Object.entries(detailRatios)) {
    // Ne garder que les ratios rouge et jaune
    if (ratio.zone !== 'rouge' && ratio.zone !== 'jaune') {
      continue
    }

    // Récupérer la famille depuis la config des ratios
    const ratioConfig = RATIOS[code]
    const famille = ratioConfig?.famille || 'activite'

    points.push({
      code,
      nom: ratio.nom,
      valeur: ratio.valeur,
      zone: ratio.zone as RatioZone,
      famille: famille as RatioFamille,
      explicationSimple: RATIO_EXPLICATIONS[code] || ratio.nom,
    })
  }

  // Trier : rouge d'abord, puis jaune
  points.sort((a, b) => {
    if (a.zone === 'rouge' && b.zone === 'jaune') return -1
    if (a.zone === 'jaune' && b.zone === 'rouge') return 1
    return 0
  })

  return points
}

/**
 * Crée automatiquement un dossier depuis les metadata utilisateur
 * Utilisé lors de la première visite du dashboard pour les dirigeants
 */
async function createDossierFromMetadata(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userEmail: string,
  siren: string,
  companyName?: string
): Promise<{
  id: string
  siren: string
  raison_sociale: string | null
  statut: string
  created_at: string
} | null> {
  try {
    // 1. Récupérer les infos SIRENE pour enrichir le dossier
    let raisonSociale = companyName || null
    let siret: string | null = null
    let codeNaf: string | null = null
    let adresse: string | null = null
    let formeJuridique: string | null = null

    const sireneResult = await searchSirene(siren)

    if (!sireneResult.error && sireneResult.results && sireneResult.results.length > 0) {
      const sireneData = sireneResult.results[0]
      raisonSociale = sireneData.raison_sociale || raisonSociale
      siret = sireneData.siret || null
      codeNaf = sireneData.code_naf || null
      adresse = sireneData.adresse || null
      formeJuridique = sireneData.forme_juridique || null
    }

    // 2. Créer le dossier
    const { data: dossier, error: insertError } = await supabase
      .from('dossiers')
      .insert({
        user_id: userId,
        siren,
        siret,
        raison_sociale: raisonSociale,
        forme_juridique: formeJuridique,
        code_naf: codeNaf,
        adresse,
        statut: 'brouillon',
        created_by_email: userEmail,
        enrichissement_status: 'in_progress',
      })
      .select('id, siren, raison_sociale, statut, created_at')
      .single()

    if (insertError || !dossier) {
      console.error('[createDossierFromMetadata] Erreur création dossier:', insertError?.message)
      return null
    }

    console.log('[createDossierFromMetadata] Dossier créé automatiquement:', dossier.id)

    // 3. Lancer l'enrichissement INPI en arrière-plan (fire-and-forget)
    syncEntreprise(siren, dossier.id)
      .then((result) => {
        const status = result.success
          ? 'completed'
          : result.sources.insee || result.sources.inpi
            ? 'partial'
            : 'failed'

        // Mettre à jour le statut d'enrichissement
        supabase
          .from('dossiers')
          .update({ enrichissement_status: status })
          .eq('id', dossier.id)
          .then(() => {
            console.log('[createDossierFromMetadata] Enrichissement terminé:', status)
          })
      })
      .catch((error) => {
        console.error('[createDossierFromMetadata] Erreur enrichissement:', error)
        supabase
          .from('dossiers')
          .update({ enrichissement_status: 'failed' })
          .eq('id', dossier.id)
      })

    // 4. Tenter l'import automatique des bilans INPI (fire-and-forget)
    autoImportINPIBilans(dossier.id, siren, 3)
      .then((importResult) => {
        if (importResult.success && importResult.bilansImportes > 0) {
          console.log(
            `[createDossierFromMetadata] ${importResult.bilansImportes} bilan(s) INPI importé(s):`,
            importResult.annees
          )
        } else {
          console.log('[createDossierFromMetadata] Aucun bilan INPI disponible')
        }
      })
      .catch((error) => {
        console.error('[createDossierFromMetadata] Erreur import INPI:', error)
      })

    return dossier
  } catch (error) {
    console.error('[createDossierFromMetadata] Erreur:', error)
    return null
  }
}
