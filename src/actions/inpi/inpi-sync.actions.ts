'use server'

import { createClient } from '@/lib/supabase/server'
import { detectProcedureCollective } from '@/lib/utils/procedure-collective-detector'
import type { INPICompanyFullData, SyncINPIResult } from './inpi.types'
import { fetchINPICompanyInfo } from './inpi-company.actions'

/**
 * Construit l'objet de mise à jour pour la table dossiers
 */
function buildDossierUpdate(fullData: INPICompanyFullData, now: string) {
  return {
    // Identité
    raison_sociale: fullData.denomination,
    nom_commercial: fullData.nomCommercial,
    sigle: fullData.sigle,
    forme_juridique: fullData.formeJuridique?.libelle,
    code_forme_juridique: fullData.formeJuridique?.code,
    code_naf: fullData.codeApe,
    nic_siege: fullData.nicSiege,
    date_immatriculation: fullData.dateImmatriculation || null,
    date_debut_activite: fullData.dateDebutActivite || null,
    date_fin_existence: fullData.dateFinExistence || null,
    date_creation: fullData.dateCreation || null,

    // Description
    objet_social: fullData.objetSocial,
    duree_societe: fullData.duree,
    date_cloture_exercice: fullData.dateClotureExerciceSocial,
    date_premiere_cloture: fullData.datePremiereCloture || null,
    capital: fullData.capital?.montant,
    devise_capital: fullData.capital?.devise || 'EUR',
    capital_variable: fullData.capital?.variable || false,
    ess: fullData.ess || false,
    societe_mission: fullData.societeMission || false,
    origine_fusion_scission: fullData.indicateurOrigineFusionScission || false,
    associe_unique: fullData.indicateurAssocieUnique || false,
    associe_unique_dirigeant: fullData.indicateurAssocieUniqueDirigeant || false,

    // Nature
    societe_etrangere: fullData.societeEtrangere || false,
    micro_entreprise: fullData.microEntreprise || false,
    etablie_en_france: fullData.etablieEnFrance !== false,
    salaries_en_france: fullData.salarieEnFrance !== false,
    entreprise_agricole: fullData.entrepriseAgricole || false,
    reliee_entreprise_agricole: fullData.relieeEntrepriseAgricole || false,
    eirl: fullData.eirl || false,

    // Adresse
    adresse: fullData.adresseSiege?.adresseComplete,
    code_postal: fullData.adresseSiege?.codePostal,
    ville: fullData.adresseSiege?.commune,
    code_pays: fullData.adresseSiege?.codePays || 'FRA',
    code_insee_commune: fullData.adresseSiege?.codeInseeCommune,
    type_voie: fullData.adresseSiege?.typeVoie,
    libelle_voie: fullData.adresseSiege?.libelleVoie,
    num_voie: fullData.adresseSiege?.numeroVoie,
    indice_repetition: fullData.adresseSiege?.indiceRepetition,
    distribution_speciale: fullData.adresseSiege?.distributionSpeciale,
    complement_localisation: fullData.adresseSiege?.complementLocalisation,
    ambulant: fullData.adresseSiege?.ambulant || false,
    domiciliataire: fullData.adresseSiege?.domiciliataire || false,

    // Établissement principal
    siret: fullData.etablissementPrincipal?.siret,
    siret_siege: fullData.etablissementPrincipal?.siret,
    code_ape_siege: fullData.etablissementPrincipal?.codeApe,
    activite_non_sedentaire: fullData.etablissementPrincipal?.activiteNonSedentaire || false,

    // Diffusion
    diffusion_insee: fullData.diffusionINSEE,
    diffusion_commerciale: fullData.diffusionCommerciale !== false,
    type_personne: fullData.typePersonne,

    // Registres
    inscrit_raa: fullData.registres?.raaPresent || false,
    inscrit_rnm: fullData.registres?.rnmPresent || false,
    inscrit_rncs: fullData.registres?.rncsPresent || false,
    date_inscription_rncs: fullData.registres?.rncsDateImmatriculation || null,

    // Métadonnées INPI
    inpi_id: fullData.idINPI,
    inpi_updated_at: fullData.updatedAt || null,
    inpi_sync_at: now,
    nombre_representants_actifs: fullData.nombreRepresentantsActifs,
    nombre_etablissements_ouverts: fullData.nombreEtablissementsOuverts,
  }
}

/**
 * Synchronise les dirigeants vers la base de données
 */
async function syncDirigeants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string,
  fullData: INPICompanyFullData
) {
  await supabase.from('dossier_dirigeants').delete().eq('dossier_id', dossierId)

  if (fullData.dirigeants.length > 0) {
    const dirigeantsToInsert = fullData.dirigeants.map((d) => ({
      dossier_id: dossierId,
      role_code: d.roleCode,
      role_libelle: d.role,
      type_personne: d.typePersonne,
      nom: d.nom,
      prenoms: d.prenom,
      date_naissance: d.dateNaissance,
      nationalite: d.nationalite,
      commune_domicile: d.adresseDomicile?.commune,
      code_postal_domicile: d.adresseDomicile?.codePostal,
      siren_pm: d.sirenPM,
      actif: d.actif,
    }))

    const { error } = await supabase.from('dossier_dirigeants').insert(dirigeantsToInsert)

    if (error) {
      console.error('[INPI Sync] Erreur insertion dirigeants:', error)
    }
  }
}

/**
 * Synchronise les activités vers la base de données
 */
async function syncActivites(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string,
  fullData: INPICompanyFullData
) {
  await supabase.from('dossier_activites').delete().eq('dossier_id', dossierId)

  if (fullData.activites.length > 0) {
    const activitesToInsert = fullData.activites.map((a) => ({
      dossier_id: dossierId,
      category_code: a.codeCategorie,
      activite_id: a.activiteId,
      principale: a.principale,
      date_debut: a.dateDebut || null,
      date_fin: a.dateFin || null,
      exercice_activite: a.exercice,
      forme_exercice: a.formeExercice,
      description_detaillee: a.description,
      code_ape: a.codeApe,
    }))

    const { error } = await supabase.from('dossier_activites').insert(activitesToInsert)

    if (error) {
      console.error('[INPI Sync] Erreur insertion activités:', error)
    }
  }
}

/**
 * Synchronise les observations vers la base de données
 */
async function syncObservations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string,
  fullData: INPICompanyFullData
) {
  await supabase.from('dossier_observations').delete().eq('dossier_id', dossierId)

  if (fullData.observationsRCS.length > 0) {
    const procedureResult = detectProcedureCollective(fullData.observationsRCS)

    const observationsToInsert = fullData.observationsRCS.map((obs) => {
      const matchingProcedure = procedureResult.allProcedures.find(
        (p) => p.texte === obs.texte && p.date === obs.date
      )

      return {
        dossier_id: dossierId,
        date_ajout: obs.date || null,
        texte: obs.texte,
        etat: obs.etat,
        code_observation: obs.code,
        is_procedure_collective: !!matchingProcedure,
        type_procedure: matchingProcedure?.type || null,
      }
    })

    const { error } = await supabase.from('dossier_observations').insert(observationsToInsert)

    if (error) {
      console.error('[INPI Sync] Erreur insertion observations:', error)
    }
  }
}

/**
 * Synchronise l'historique vers la base de données
 */
async function syncHistorique(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dossierId: string,
  fullData: INPICompanyFullData
) {
  await supabase.from('dossier_historique').delete().eq('dossier_id', dossierId)

  if (fullData.historique.length > 0) {
    const historiqueToInsert = fullData.historique.map((evt) => ({
      dossier_id: dossierId,
      date_evenement: evt.date || null,
      code_evenement: evt.code,
      libelle_evenement: evt.libelle,
    }))

    const { error } = await supabase.from('dossier_historique').insert(historiqueToInsert)

    if (error) {
      console.error('[INPI Sync] Erreur insertion historique:', error)
    }
  }
}

/**
 * Synchronise les données INPI vers la base de données
 * Met à jour le dossier et ses tables liées (dirigeants, activités, observations, historique)
 */
export async function syncINPIToDatabase(
  dossierId: string,
  siren: string
): Promise<SyncINPIResult> {
  try {
    // 1. Récupérer les données INPI
    const inpiResult = await fetchINPICompanyInfo(siren)

    if (!inpiResult.success || !inpiResult.data) {
      return {
        success: false,
        message: inpiResult.error || 'Erreur lors de la récupération des données INPI',
      }
    }

    const fullData = inpiResult.data.fullData

    if (!fullData) {
      return {
        success: false,
        message: 'Données complètes INPI non disponibles',
      }
    }

    // 2. Créer le client Supabase
    const supabase = await createClient()
    const now = new Date().toISOString()

    // 3. Mettre à jour la table dossiers
    const dossierUpdate = buildDossierUpdate(fullData, now)

    const { error: dossierError } = await supabase
      .from('dossiers')
      .update(dossierUpdate)
      .eq('id', dossierId)

    if (dossierError) {
      console.error('[INPI Sync] Erreur mise à jour dossier:', dossierError)
      return {
        success: false,
        message: `Erreur lors de la mise à jour du dossier: ${dossierError.message}`,
      }
    }

    // 4. Synchroniser les tables liées
    await syncDirigeants(supabase, dossierId, fullData)
    await syncActivites(supabase, dossierId, fullData)
    await syncObservations(supabase, dossierId, fullData)
    await syncHistorique(supabase, dossierId, fullData)

    return {
      success: true,
      message: 'Données INPI synchronisées avec succès',
      syncedAt: now,
    }
  } catch (error) {
    console.error('[INPI Sync] Erreur:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur lors de la synchronisation',
    }
  }
}
