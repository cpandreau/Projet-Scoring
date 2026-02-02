'use server'

import { revalidatePath } from 'next/cache'

import { calculateEnterpriseScore } from '@/actions/score.actions'
import type { INPIBilanSaisi } from '@/lib/api/inpi-service'
import { createClient } from '@/lib/supabase/server'
import type { ExtractionData } from '@/schemas/extraction.schema'

import { fetchINPIBilanDetail, fetchINPIBilans } from './inpi-bilans.actions'

/**
 * Resultat de l'import d'un bilan INPI
 */
export interface ImportINPIBilanResult {
  success: boolean
  message: string
  documentId?: string
  extractionId?: string
  anneeExercice?: number
}

/**
 * Resultat de l'auto-import
 */
export interface AutoImportResult {
  success: boolean
  message: string
  bilansDisponibles: number
  bilansImportes: number
  annees: number[]
}

/**
 * Mappe les donnees d'un bilan INPI vers le format ExtractionData
 */
function mapINPIBilanToExtractionData(bilan: INPIBilanSaisi): ExtractionData {
  const actif = bilan.actif || {}
  const passif = bilan.passif || {}
  const cr = bilan.compteResultat || {}

  // Helper pour creer un champ avec source INPI
  const field = (valeur: number | undefined | null, source: string) => ({
    valeur: valeur ?? 0,
    case_source: `INPI - ${source}`,
  })

  // Calcul actif immobilise (somme des immobilisations)
  const actifImmobilise =
    (actif.immobilisationsIncorporelles || 0) +
    (actif.immobilisationsFinancieres || 0) +
    (actif.immobilisationsCorporelles || 0)

  // Calcul actif circulant
  const actifCirculant =
    (actif.stocks || 0) +
    (actif.creancesClients || 0) +
    (actif.autresCreances || 0) +
    (actif.disponibilites || 0) +
    (actif.chargesConstatees || 0)

  // Calcul capitaux propres
  const capitauxPropres =
    (passif.capitalSocial || 0) +
    (passif.reserves || 0) +
    (passif.resultatExercice || 0) +
    (passif.subventions || 0)

  // Calcul dettes financieres
  const dettesFinancieres = (passif.empruntsLongTerme || 0) + (passif.empruntsCourtTerme || 0)

  // Calcul charges personnel
  const chargesPersonnel = (cr.salaires || 0) + (cr.chargesSociales || 0)

  // Calcul dotations
  const dotations = (cr.dotationsAmortissements || 0) + (cr.dotationsProvisions || 0)

  return {
    // Type liasse (les bilans INPI sont proches du format simplifie)
    type_liasse: 'simplifiee',

    // Compte de resultat
    chiffre_affaires: field(cr.chiffreAffaires, 'CA'),
    ventes_marchandises: field(0, 'Non disponible'),
    production: field(
      (cr.productionStockee || 0) + (cr.productionImmobilisee || 0),
      'Production stockee + immobilisee'
    ),
    achats_marchandises: field(cr.achats, 'Achats'),
    achats_matieres_premieres: field(0, 'Non disponible'),
    autres_charges_externes: field(cr.autresChargesExternes, 'Autres charges externes'),
    impots_taxes: field(cr.impotsTaxes, 'Impots taxes'),
    charges_personnel: field(chargesPersonnel, 'Salaires + Charges sociales'),
    charges_financieres: field(cr.chargesFinancieres, 'Charges financieres'),
    resultat_exploitation: field(null, 'Non disponible'), // A calculer
    resultat_net: field(cr.resultatNet, 'Resultat net'),

    // Actif
    actif_immobilise: field(actifImmobilise, 'Immo incorp + corp + fin'),
    actif_circulant: field(actifCirculant, 'Stocks + Creances + Dispo'),
    stocks: field(actif.stocks, 'Stocks'),
    creances_clients: field(actif.creancesClients, 'Creances clients'),
    disponibilites: field(actif.disponibilites, 'Disponibilites'),

    // Passif
    capitaux_propres: field(capitauxPropres, 'Capital + Reserves + Resultat'),
    total_passif: field(passif.totalPassif || actif.totalActif, 'Total passif'),
    dettes_financieres: field(dettesFinancieres, 'Emprunts LT + CT'),
    dettes_fournisseurs: field(passif.dettesFournisseurs, 'Dettes fournisseurs'),
    decouvert_bancaire: field(0, 'Non disponible'),

    // Champs complementaires
    subventions_exploitation: field(cr.subventionsExploitation, 'Subventions exploitation'),
    dettes_fiscales_sociales: field(passif.autresDettes, 'Autres dettes'),
    comptes_courants_associes: field(0, 'Non disponible'),
    provisions_risques_charges: field(passif.provisions, 'Provisions'),
    dotations_amortissements: field(dotations, 'Dotations amort + prov'),
    reprises_provisions: field(0, 'Non disponible'),
    variation_stocks: field(cr.variationStocks, 'Variation stocks'),
  }
}

/**
 * Importe un bilan INPI specifique dans le dossier
 * Cree un document virtuel et stocke les donnees extraites
 */
export async function importINPIBilan(
  dossierId: string,
  bilanId: string
): Promise<ImportINPIBilanResult> {
  try {
    const supabase = await createClient()

    // 1. Verifier l'acces au dossier
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select('id, siren, user_id')
      .eq('id', dossierId)
      .single()

    if (dossierError || !dossier) {
      return { success: false, message: 'Dossier non trouve' }
    }

    // 2. Recuperer les details du bilan INPI
    const bilanResult = await fetchINPIBilanDetail(bilanId)

    if (!bilanResult.success || !bilanResult.data) {
      return {
        success: false,
        message: bilanResult.error || 'Erreur lors de la recuperation du bilan INPI',
      }
    }

    const bilan = bilanResult.data

    // 3. Extraire l'annee d'exercice depuis la date de cloture
    const dateCloture = bilan.dateCloture || ''
    const anneeExercice = dateCloture ? parseInt(dateCloture.substring(0, 4), 10) : new Date().getFullYear()

    // 4. Verifier si un document INPI existe deja pour cette annee
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('dossier_id', dossierId)
      .eq('type', 'inpi_import')
      .eq('annee_exercice', anneeExercice)
      .single()

    let documentId: string

    if (existingDoc) {
      // Document existe deja, on met a jour
      documentId = existingDoc.id
    } else {
      // 5. Creer un document virtuel pour l'import INPI
      const { data: newDoc, error: docError } = await supabase
        .from('documents')
        .insert({
          dossier_id: dossierId,
          type: 'inpi_import',
          nom_fichier: `Bilan INPI ${anneeExercice}`,
          annee_exercice: anneeExercice,
          storage_path: null, // Pas de fichier physique
          source: 'inpi',
        })
        .select('id')
        .single()

      if (docError || !newDoc) {
        console.error('[importINPIBilan] Erreur creation document:', docError)
        return { success: false, message: 'Erreur lors de la creation du document' }
      }

      documentId = newDoc.id
    }

    // 6. Mapper les donnees INPI vers le format ExtractionData
    const extractionData = mapINPIBilanToExtractionData(bilan)

    // 7. Verifier si des donnees extraites existent deja
    const { data: existingExtraction } = await supabase
      .from('donnees_extraites')
      .select('id')
      .eq('document_id', documentId)
      .single()

    let extractionId: string

    if (existingExtraction) {
      // Mettre a jour les donnees existantes
      const { error: updateError } = await supabase
        .from('donnees_extraites')
        .update({
          donnees: extractionData,
          is_validated: true, // Les donnees INPI sont officielles
        })
        .eq('id', existingExtraction.id)

      if (updateError) {
        console.error('[importINPIBilan] Erreur MAJ extraction:', updateError)
        return { success: false, message: 'Erreur lors de la mise a jour des donnees' }
      }

      extractionId = existingExtraction.id
    } else {
      // Inserer les nouvelles donnees
      const { data: newExtraction, error: insertError } = await supabase
        .from('donnees_extraites')
        .insert({
          document_id: documentId,
          donnees: extractionData,
          is_validated: true, // Les donnees INPI sont officielles
        })
        .select('id')
        .single()

      if (insertError || !newExtraction) {
        console.error('[importINPIBilan] Erreur insertion extraction:', insertError)
        return { success: false, message: 'Erreur lors de l\'enregistrement des donnees' }
      }

      extractionId = newExtraction.id
    }

    // 8. Mettre a jour le statut du dossier a 'valide'
    await supabase.from('dossiers').update({ statut: 'valide' }).eq('id', dossierId)

    // 9. Invalider le cache
    revalidatePath(`/enterprise/${dossierId}`)
    revalidatePath('/dashboard')

    console.log(`[importINPIBilan] Bilan INPI ${bilanId} importe avec succes pour ${anneeExercice}`)

    return {
      success: true,
      message: `Bilan ${anneeExercice} importe depuis INPI`,
      documentId,
      extractionId,
      anneeExercice,
    }
  } catch (error) {
    console.error('[importINPIBilan] Erreur:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de l\'import',
    }
  }
}

/**
 * Importe automatiquement les bilans INPI disponibles pour un dossier
 * Utilise lors de la creation automatique du dossier
 * Importe jusqu'a 3 bilans (annees les plus recentes)
 */
export async function autoImportINPIBilans(
  dossierId: string,
  siren: string,
  maxBilans: number = 3
): Promise<AutoImportResult> {
  try {
    // 1. Recuperer la liste des bilans disponibles
    const bilansResult = await fetchINPIBilans(siren)

    if (!bilansResult.success || !bilansResult.data) {
      return {
        success: false,
        message: bilansResult.error || 'Aucun bilan INPI disponible',
        bilansDisponibles: 0,
        bilansImportes: 0,
        annees: [],
      }
    }

    const bilans = bilansResult.data.bilans
    const bilansDisponibles = bilans.length

    if (bilansDisponibles === 0) {
      return {
        success: true,
        message: 'Aucun bilan public disponible pour ce SIREN',
        bilansDisponibles: 0,
        bilansImportes: 0,
        annees: [],
      }
    }

    // 2. Trier par date de cloture (plus recent d'abord) et limiter
    const bilansATrier = [...bilans]
      .sort((a, b) => b.dateCloture.localeCompare(a.dateCloture))
      .slice(0, maxBilans)

    // 3. Importer chaque bilan
    const anneesImportees: number[] = []
    let bilansImportes = 0

    for (const bilan of bilansATrier) {
      const result = await importINPIBilan(dossierId, bilan.id)

      if (result.success && result.anneeExercice) {
        bilansImportes++
        anneesImportees.push(result.anneeExercice)
      }
    }

    // 4. Calculer le score si au moins un bilan a ete importe
    if (bilansImportes > 0) {
      try {
        const scoreResult = await calculateEnterpriseScore(dossierId, { saveToHistory: true })
        if (scoreResult.success) {
          console.log(`[autoImportINPIBilans] Score calcule: ${scoreResult.score?.scoreGlobal}`)
        }
      } catch (scoreError) {
        console.error('[autoImportINPIBilans] Erreur calcul score:', scoreError)
        // Ne pas bloquer si le calcul du score echoue
      }
    }

    const message =
      bilansImportes > 0
        ? `${bilansImportes} bilan(s) importe(s) depuis INPI (${anneesImportees.join(', ')})`
        : 'Aucun bilan n\'a pu etre importe'

    return {
      success: bilansImportes > 0,
      message,
      bilansDisponibles,
      bilansImportes,
      annees: anneesImportees,
    }
  } catch (error) {
    console.error('[autoImportINPIBilans] Erreur:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de l\'auto-import',
      bilansDisponibles: 0,
      bilansImportes: 0,
      annees: [],
    }
  }
}
