'use server'

import { getCompanyInfo, type INPIError, isINPIConfigured } from '@/lib/api/inpi-service'

import {
  type FetchINPICompanyInfoResult,
  FORMES_JURIDIQUES,
  type INPIActiviteStructuree,
  type INPIAdresseStructuree,
  type INPICompanyFullData,
  type INPICompanyInfoStructured,
  type INPIDirigeant,
  type INPIEtablissementStructure,
  type INPIHistoriqueEvent,
  type INPIObservationRCS,
  type INPIRegistresStructure,
  ROLES_ENTREPRISE,
} from './inpi.types'

// --- Helpers internes ---

/**
 * Formate une date de clôture d'exercice (JJMM -> JJ/MM)
 */
function formatDateCloture(dateStr?: string): string | undefined {
  if (!dateStr || dateStr.length !== 4) return undefined
  const jour = dateStr.substring(0, 2)
  const mois = dateStr.substring(2, 4)
  return `${jour}/${mois}`
}

/**
 * Construit l'adresse complète à partir des composants
 */
function buildAdresseComplete(adresse: {
  numVoie?: string
  typeVoie?: string
  voie?: string
  codePostal?: string
  commune?: string
  pays?: string
}): string {
  const parts: string[] = []

  if (adresse.numVoie) {
    parts.push(adresse.numVoie)
  }
  if (adresse.typeVoie) {
    parts.push(adresse.typeVoie)
  }
  if (adresse.voie) {
    parts.push(adresse.voie)
  }

  const rue = parts.join(' ')
  const ville = [adresse.codePostal, adresse.commune].filter(Boolean).join(' ')

  const fullParts = [rue, ville].filter(Boolean)
  if (adresse.pays && adresse.pays.toUpperCase() !== 'FRANCE') {
    fullParts.push(adresse.pays)
  }

  return fullParts.join(', ')
}

/**
 * Extrait les dirigeants depuis les pouvoirs INPI
 */
function extractDirigeants(pouvoirs: unknown[]): INPIDirigeant[] {
  const dirigeants: INPIDirigeant[] = []

  for (const pouvoir of pouvoirs as Array<{
    roleEntreprise: string
    actif?: boolean
    typeDePersonne: string
    individu?: {
      descriptionPersonne: {
        nom: string
        prenoms?: string[]
        dateDeNaissance?: string
        nationalite?: string
      }
      adresseDomicile?: {
        commune?: string
        codePostal?: string
      }
    }
    entreprise?: {
      denomination?: string
      siren?: string
    }
  }>) {
    const roleCode = pouvoir.roleEntreprise
    const role = ROLES_ENTREPRISE[roleCode] || `Rôle ${roleCode}`
    const isActif = pouvoir.actif !== false

    if (pouvoir.typeDePersonne === 'INDIVIDU' && pouvoir.individu) {
      const personne = pouvoir.individu.descriptionPersonne
      dirigeants.push({
        nom: personne.nom,
        prenom: personne.prenoms?.join(' '),
        role,
        roleCode,
        typePersonne: 'INDIVIDU',
        actif: isActif,
        dateNaissance: personne.dateDeNaissance,
        nationalite: personne.nationalite,
        adresseDomicile: pouvoir.individu.adresseDomicile
          ? {
              commune: pouvoir.individu.adresseDomicile.commune,
              codePostal: pouvoir.individu.adresseDomicile.codePostal,
            }
          : undefined,
      })
    } else if (pouvoir.typeDePersonne === 'PERSONNE_MORALE' && pouvoir.entreprise) {
      dirigeants.push({
        nom: pouvoir.entreprise.denomination || pouvoir.entreprise.siren || 'Inconnu',
        role,
        roleCode,
        typePersonne: 'PERSONNE_MORALE',
        actif: isActif,
        sirenPM: pouvoir.entreprise.siren,
      })
    }
  }

  return dirigeants
}

/**
 * Récupère les informations complètes et structurées d'une entreprise INPI
 */
export async function fetchINPICompanyInfo(siren: string): Promise<FetchINPICompanyInfoResult> {
  try {
    if (!isINPIConfigured()) {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    const sirenClean = siren.replace(/\s/g, '')
    if (!/^\d{9}$/.test(sirenClean)) {
      return {
        success: false,
        error: 'SIREN invalide (9 chiffres requis)',
      }
    }

    const companyInfo = await getCompanyInfo(sirenClean)

    if (!companyInfo) {
      return {
        success: false,
        error: 'Entreprise non trouvée',
      }
    }

    // Structure réelle: formality.content contient les données
    const formality = companyInfo.formality
    const content = formality?.content
    const personneMorale = content?.personneMorale
    const personnePhysique = content?.personnePhysique

    // Extraire les informations de base
    const identiteEntreprise = personneMorale?.identite?.entreprise
    const description = personneMorale?.identite?.description

    // Forme juridique
    const formeJuridiqueCode =
      identiteEntreprise?.formeJuridique ||
      formality?.formeJuridique ||
      content?.natureCreation?.formeJuridique
    const formeJuridique = formeJuridiqueCode
      ? {
          code: formeJuridiqueCode,
          libelle: FORMES_JURIDIQUES[formeJuridiqueCode] || `Code ${formeJuridiqueCode}`,
        }
      : undefined

    // Capital
    const capital =
      description?.montantCapital !== undefined
        ? {
            montant: description.montantCapital,
            devise: description.deviseCapital || 'EUR',
            variable: description.capitalVariable || false,
          }
        : undefined

    // Adresse
    const adresseRaw =
      personneMorale?.adresseEntreprise?.adresse || personnePhysique?.adresseEntreprise?.adresse
    const adresseSiege: INPIAdresseStructuree | undefined = adresseRaw
      ? {
          numeroVoie: adresseRaw.numVoie,
          typeVoie: adresseRaw.typeVoie,
          libelleVoie: adresseRaw.voie,
          codePostal: adresseRaw.codePostal,
          commune: adresseRaw.commune,
          pays: adresseRaw.pays,
          adresseComplete: buildAdresseComplete(adresseRaw),
        }
      : undefined

    // Dirigeants
    const pouvoirs = personneMorale?.composition?.pouvoirs || []
    const dirigeants = extractDirigeants(pouvoirs)
    const dirigeantsActifs = dirigeants.filter((d) => d.actif)

    // Observations RCS
    const observationsRaw = content?.observations?.rcs || []
    const observationsRCS: INPIObservationRCS[] = observationsRaw.map(
      (obs: { dateAjout: string; texte: string; codeObs?: string; etatObs?: string }) => ({
        date: obs.dateAjout,
        texte: obs.texte,
        code: obs.codeObs || '',
        etat: obs.etatObs || '',
      })
    )

    // Historique
    const historiqueRaw = content?.historique || []
    const historique: INPIHistoriqueEvent[] = historiqueRaw.map(
      (evt: { dateIntegration: string; codeEvenement: string; libelleEvenement: string }) => ({
        date: evt.dateIntegration,
        code: evt.codeEvenement,
        libelle: evt.libelleEvenement,
      })
    )

    // Nom pour personne physique
    const entrepreneurPhysique = personnePhysique?.identite?.entrepreneur
    const nomPersonnePhysique = entrepreneurPhysique?.descriptionPersonne
      ? [
          entrepreneurPhysique.descriptionPersonne.prenoms?.join(' '),
          entrepreneurPhysique.descriptionPersonne.nom,
        ]
          .filter(Boolean)
          .join(' ')
      : undefined

    // Nature de création
    const natureCreation = content?.natureCreation

    // Établissement principal
    const etabPrincipal = content?.etablissementPrincipal
    const etablissementPrincipal: INPIEtablissementStructure | undefined = etabPrincipal
      ? {
          siret: etabPrincipal.siret,
          nic: etabPrincipal.nic,
          codeApe: etabPrincipal.codeApe,
          activiteNonSedentaire: etabPrincipal.activiteNonSedentaire,
          principal: etabPrincipal.indicateurEtablissementPrincipal || true,
          adresse: etabPrincipal.adresse
            ? {
                ...etabPrincipal.adresse,
                libelleVoie: etabPrincipal.adresse.voie,
                numeroVoie: etabPrincipal.adresse.numVoie,
                adresseComplete: buildAdresseComplete(etabPrincipal.adresse),
              }
            : undefined,
        }
      : undefined

    // Activités
    const activitesRaw = content?.activites || []
    const activites: INPIActiviteStructuree[] = activitesRaw.map(
      (act: {
        categoryCode?: string
        activiteId?: string
        indicateurPrincipal?: boolean
        dateDebut?: string
        dateFin?: string
        exerciceActivite?: string
        formeExercice?: string
        descriptionDetaillee?: string
        codeApe?: string
      }) => ({
        codeCategorie: act.categoryCode,
        activiteId: act.activiteId,
        principale: act.indicateurPrincipal || false,
        dateDebut: act.dateDebut,
        dateFin: act.dateFin,
        exercice: act.exerciceActivite,
        formeExercice: act.formeExercice,
        description: act.descriptionDetaillee,
        codeApe: act.codeApe,
      })
    )

    // Registres antérieurs
    const registresRaw = content?.registresAnterieurs
    const registres: INPIRegistresStructure | undefined = registresRaw
      ? {
          raaPresent: registresRaw.raaPresent || false,
          rnmPresent: registresRaw.rnmPresent || false,
          rncsPresent: registresRaw.rncsPresent || false,
          rncsDateDebut: registresRaw.rncsDateDebut,
          rncsDateImmatriculation: registresRaw.rncsDateImmatriculation,
        }
      : undefined

    // Construire le type complet
    const fullData: INPICompanyFullData = {
      idINPI: companyInfo.id,
      siren: sirenClean,
      updatedAt: companyInfo.updatedAt,
      nombreRepresentantsActifs: companyInfo.nombreRepresentantsActifs,
      nombreEtablissementsOuverts: companyInfo.nombreEtablissementsOuverts,

      denomination: identiteEntreprise?.denomination || nomPersonnePhysique,
      sigle: description?.sigle || identiteEntreprise?.sigle,
      nomCommercial: identiteEntreprise?.nomCommercial,
      formeJuridique,
      nicSiege: identiteEntreprise?.nicSiege,
      codeApe: identiteEntreprise?.codeApe,
      dateImmatriculation: identiteEntreprise?.dateImmat,
      dateDebutActivite: identiteEntreprise?.dateDebutActiv,

      objetSocial: description?.objet,
      duree: description?.duree,
      dateClotureExerciceSocial: formatDateCloture(description?.dateClotureExerciceSocial),
      datePremiereCloture: description?.datePremiereCloture,
      dateFinExistence: description?.dateFinExistence,
      capital,
      ess: description?.ess,
      societeMission: description?.societeMission,
      indicateurOrigineFusionScission: description?.indicateurOrigineFusionScission,
      indicateurAssocieUnique: description?.indicateurAssocieUnique,
      indicateurAssocieUniqueDirigeant: description?.indicateurAssocieUniqueDirigeant,

      dateCreation: natureCreation?.dateCreation,
      societeEtrangere: natureCreation?.societeEtrangere,
      microEntreprise: natureCreation?.microEntreprise,
      etablieEnFrance: natureCreation?.etablieEnFrance,
      salarieEnFrance: natureCreation?.salarieEnFrance,
      relieeEntrepriseAgricole: natureCreation?.relieeEntrepriseAgricole,
      entrepriseAgricole: natureCreation?.entrepriseAgricole,
      eirl: natureCreation?.eirl,

      adresseSiege,
      etablissementPrincipal,
      activites,
      dirigeants,
      registres,

      diffusionINSEE: formality?.diffusionINSEE,
      diffusionCommerciale: formality?.diffusionCommerciale,
      typePersonne: formality?.typePersonne,

      observationsRCS,
      historique,
    }

    // Résultat avec rétrocompatibilité
    const result: INPICompanyInfoStructured = {
      siren: sirenClean,
      denomination: identiteEntreprise?.denomination || nomPersonnePhysique,
      sigle: description?.sigle,
      nomCommercial: identiteEntreprise?.nomCommercial,
      formeJuridique,
      capital,
      dateCreation: content?.natureCreation?.dateCreation,
      dateClotureExerciceSocial: formatDateCloture(description?.dateClotureExerciceSocial),
      objetSocial: description?.objet,
      adresseSiege,
      dirigeants: dirigeantsActifs,
      observationsRCS,
      historique,
      fullData,
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    const inpiError = error as INPIError

    if (inpiError.code === 'UNAUTHORIZED') {
      return {
        success: false,
        error: 'Authentification INPI échouée',
      }
    }

    if (inpiError.code === 'CONFIG_ERROR') {
      return {
        success: false,
        error: 'Service INPI non configuré',
      }
    }

    console.error('[INPI Actions] fetchINPICompanyInfo error:', error)
    return {
      success: false,
      error: inpiError.message || 'Erreur lors de la récupération des informations entreprise',
    }
  }
}
