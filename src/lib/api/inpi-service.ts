/**
 * Service d'accès à l'API INPI (Registre National des Entreprises)
 * Documentation: https://registre-national-entreprises.inpi.fr/api/documentation
 */

const INPI_API_URL = process.env.INPI_API_URL || 'https://registre-national-entreprises.inpi.fr/api'
const INPI_USERNAME = process.env.INPI_USERNAME || ''
const INPI_PASSWORD = process.env.INPI_PASSWORD || ''

// Cache du token (durée 1h)
let tokenCache: {
  token: string
  expiresAt: number
} | null = null

const TOKEN_DURATION_MS = 60 * 60 * 1000 // 1 heure

export interface INPIError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'NETWORK_ERROR' | 'CONFIG_ERROR'
  message: string
}

export interface INPIAttachment {
  id: string
  type: string
  dateDepot: string
  dateCloture: string
  confidentialite: string
}

export interface INPICompanyAttachments {
  siren: string
  bilansSaisis: INPIAttachment[]
}

// Types pour les informations de l'entreprise (structure réelle complète de l'API INPI)

// Adresse complète avec tous les champs possibles
export interface INPIAdresse {
  pays?: string
  codePays?: string
  codePostal?: string
  commune?: string
  codeInseeCommune?: string
  typeVoie?: string
  voie?: string
  numVoie?: string
  indiceRepetition?: string
  distributionSpeciale?: string
  complementLocalisation?: string
  ambulant?: boolean
  domiciliataire?: boolean
}

// Activité de l'entreprise
export interface INPIActivite {
  categoryCode?: string
  activiteId?: string
  indicateurPrincipal?: boolean
  dateDebut?: string
  dateFin?: string
  exerciceActivite?: string
  formeExercice?: string
  categorisationActivite1?: string
  categorisationActivite2?: string
  categorisationActivite3?: string
  categorisationActivite4?: string
  descriptionDetaillee?: string
  codeApe?: string
}

// Établissement
export interface INPIEtablissement {
  siret?: string
  nic?: string
  codeApe?: string
  activiteNonSedentaire?: boolean
  indicateurEtablissementPrincipal?: boolean
  adresse?: INPIAdresse
  activites?: INPIActivite[]
}

// Registres antérieurs
export interface INPIRegistresAnterieurs {
  raaPresent?: boolean
  rnmPresent?: boolean
  rncsPresent?: boolean
  rncsDateDebut?: string
  rncsDateImmatriculation?: string
}

// Pouvoir / Dirigeant
export interface INPIPouvoir {
  typeDePersonne: 'INDIVIDU' | 'PERSONNE_MORALE'
  roleEntreprise: string
  actif?: boolean
  individu?: {
    descriptionPersonne: {
      nom: string
      prenoms?: string[]
      role?: string
      dateDeNaissance?: string // Format "1966-07" (mois/année)
      nationalite?: string
    }
    adresseDomicile?: {
      codePostal?: string
      commune?: string
      pays?: string
    }
  }
  entreprise?: {
    siren?: string
    denomination?: string
    formeJuridique?: string
  }
}

// Observation RCS
export interface INPIObservation {
  idObservation?: number
  dateAjout: string
  texte: string
  etatObs?: string
  codeObs?: string
}

// Événement historique
export interface INPIEvenement {
  dateIntegration: string
  codeEvenement: string
  libelleEvenement: string
}

// Nature de création (bloc complet)
export interface INPINatureCreation {
  dateCreation?: string
  formeJuridique?: string
  microEntreprise?: boolean
  societeEtrangere?: boolean
  etablieEnFrance?: boolean
  salarieEnFrance?: boolean
  relieeEntrepriseAgricole?: boolean
  entrepriseAgricole?: boolean
  eirl?: boolean
}

// Description de l'entreprise (bloc complet)
export interface INPIDescription {
  objet?: string
  sigle?: string
  duree?: number
  dateClotureExerciceSocial?: string // Format JJMM (ex: "3009" = 30/09)
  datePremiereCloture?: string
  dateFinExistence?: string
  montantCapital?: number
  deviseCapital?: string
  capitalVariable?: boolean
  ess?: boolean // Économie Sociale et Solidaire
  societeMission?: boolean
  indicateurOrigineFusionScission?: boolean
  indicateurAssocieUnique?: boolean
  indicateurAssocieUniqueDirigeant?: boolean
}

// Identité entreprise (bloc complet)
export interface INPIIdentiteEntreprise {
  siren?: string
  denomination?: string
  formeJuridique?: string
  nomCommercial?: string
  sigle?: string
  nicSiege?: string
  codeApe?: string
  dateImmat?: string
  dateDebutActiv?: string
}

// Structure du content dans formality
export interface INPICompanyContent {
  formeExerciceActivitePrincipale?: string
  natureCreation?: INPINatureCreation
  personneMorale?: {
    identite?: {
      entreprise?: INPIIdentiteEntreprise
      description?: INPIDescription
    }
    adresseEntreprise?: {
      adresse?: INPIAdresse
    }
    composition?: {
      pouvoirs?: INPIPouvoir[]
    }
  }
  personnePhysique?: {
    identite?: {
      entrepreneur?: {
        descriptionPersonne?: {
          nom?: string
          prenoms?: string[]
          nomUsage?: string
        }
      }
      description?: INPIDescription
    }
    adresseEntreprise?: {
      adresse?: INPIAdresse
    }
  }
  etablissementPrincipal?: INPIEtablissement
  activites?: INPIActivite[]
  observations?: {
    rcs?: INPIObservation[]
  }
  historique?: INPIEvenement[]
  registresAnterieurs?: INPIRegistresAnterieurs
}

// Structure de formality dans la réponse API
export interface INPIFormality {
  siren: string
  content?: INPICompanyContent
  diffusionINSEE?: string
  typePersonne?: 'M' | 'P' // "M" = Morale, "P" = Physique
  diffusionCommerciale?: boolean
  formeJuridique?: string
}

// Structure complète de la réponse GET /companies/{siren}
export interface INPICompanyResponse {
  id?: string
  siren: string
  updatedAt?: string
  nombreRepresentantsActifs?: number
  nombreEtablissementsOuverts?: number
  formality?: INPIFormality
}

// Type pour la compatibilité avec le code existant
export interface INPICompanyInfo {
  siren: string
  id?: string
  updatedAt?: string
  nombreRepresentantsActifs?: number
  nombreEtablissementsOuverts?: number
  formality?: INPIFormality
}

export interface INPIBilanSaisi {
  id: string
  siren: string
  dateCloture: string
  dureeExercice: number
  // Données du bilan (actif)
  actif?: {
    immobilisationsIncorporelles?: number
    immobilisationsCorporelles?: number
    immobilisationsFinancieres?: number
    stocks?: number
    creancesClients?: number
    autresCreances?: number
    disponibilites?: number
    chargesConstatees?: number
    totalActif?: number
  }
  // Données du passif
  passif?: {
    capitalSocial?: number
    reserves?: number
    resultatExercice?: number
    subventions?: number
    provisions?: number
    empruntsLongTerme?: number
    empruntsCourtTerme?: number
    dettesFournisseurs?: number
    autresDettes?: number
    produitsConstates?: number
    totalPassif?: number
  }
  // Données du compte de résultat
  compteResultat?: {
    chiffreAffaires?: number
    productionStockee?: number
    productionImmobilisee?: number
    subventionsExploitation?: number
    autresProduits?: number
    achats?: number
    variationStocks?: number
    autresChargesExternes?: number
    impotsTaxes?: number
    salaires?: number
    chargesSociales?: number
    dotationsAmortissements?: number
    dotationsProvisions?: number
    chargesFinancieres?: number
    produitsFinanciers?: number
    chargesExceptionnelles?: number
    produitsExceptionnels?: number
    impotSurBenefices?: number
    resultatNet?: number
  }
  // Données brutes si format différent
  donneesBrutes?: Record<string, unknown>
}

/**
 * Vérifie si la configuration INPI est présente
 */
export function isINPIConfigured(): boolean {
  return Boolean(INPI_USERNAME && INPI_PASSWORD)
}

/**
 * Authentification et récupération du token Bearer
 * Le token est mis en cache pendant 1 heure
 */
export async function getINPIToken(): Promise<string> {
  // Vérifier la configuration
  if (!isINPIConfigured()) {
    throw {
      code: 'CONFIG_ERROR',
      message: 'Les identifiants INPI ne sont pas configurés (INPI_USERNAME, INPI_PASSWORD)',
    } as INPIError
  }

  // Vérifier le cache
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token
  }

  try {
    const response = await fetch(`${INPI_API_URL}/sso/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        username: INPI_USERNAME,
        password: INPI_PASSWORD,
      }),
    })

    if (response.status === 401) {
      throw {
        code: 'UNAUTHORIZED',
        message: 'Identifiants INPI invalides',
      } as INPIError
    }

    if (!response.ok) {
      throw {
        code: 'NETWORK_ERROR',
        message: `Erreur d'authentification INPI: ${response.status} ${response.statusText}`,
      } as INPIError
    }

    const data = await response.json()
    const token = data.token || data.access_token

    if (!token) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'Token non trouvé dans la réponse INPI',
      } as INPIError
    }

    // Mettre en cache
    tokenCache = {
      token,
      expiresAt: Date.now() + TOKEN_DURATION_MS,
    }

    return token
  } catch (error) {
    // Si c'est déjà une INPIError, la propager
    if ((error as INPIError).code) {
      throw error
    }

    throw {
      code: 'NETWORK_ERROR',
      message: `Erreur réseau lors de l'authentification INPI: ${error}`,
    } as INPIError
  }
}

/**
 * Invalide le cache du token (utile en cas de 401)
 */
export function invalidateTokenCache(): void {
  tokenCache = null
}

/**
 * Récupère la liste des bilans disponibles pour une entreprise
 */
export async function getCompanyAttachments(siren: string): Promise<INPICompanyAttachments | null> {
  try {
    const token = await getINPIToken()

    const response = await fetch(`${INPI_API_URL}/companies/${siren}/attachments`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    // Token expiré - invalider le cache et réessayer une fois
    if (response.status === 401) {
      invalidateTokenCache()
      const newToken = await getINPIToken()

      const retryResponse = await fetch(`${INPI_API_URL}/companies/${siren}/attachments`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: 'application/json',
        },
      })

      if (retryResponse.status === 401) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Token INPI invalide après renouvellement',
        } as INPIError
      }

      if (retryResponse.status === 404) {
        return null
      }

      if (!retryResponse.ok) {
        throw {
          code: 'NETWORK_ERROR',
          message: `Erreur API INPI: ${retryResponse.status}`,
        } as INPIError
      }

      return await retryResponse.json()
    }

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw {
        code: 'NETWORK_ERROR',
        message: `Erreur API INPI: ${response.status} ${response.statusText}`,
      } as INPIError
    }

    const data = await response.json()

    return {
      siren,
      bilansSaisis: data.bilansSaisis || [],
    }
  } catch (error) {
    if ((error as INPIError).code) {
      throw error
    }

    throw {
      code: 'NETWORK_ERROR',
      message: `Erreur réseau INPI: ${error}`,
    } as INPIError
  }
}

/**
 * Récupère les données structurées d'un bilan saisi
 */
export async function getBilanSaisi(id: string): Promise<INPIBilanSaisi | null> {
  try {
    const token = await getINPIToken()

    const response = await fetch(`${INPI_API_URL}/bilans-saisis/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    // Token expiré - invalider le cache et réessayer une fois
    if (response.status === 401) {
      invalidateTokenCache()
      const newToken = await getINPIToken()

      const retryResponse = await fetch(`${INPI_API_URL}/bilans-saisis/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: 'application/json',
        },
      })

      if (retryResponse.status === 401) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Token INPI invalide après renouvellement',
        } as INPIError
      }

      if (retryResponse.status === 404) {
        return null
      }

      if (!retryResponse.ok) {
        throw {
          code: 'NETWORK_ERROR',
          message: `Erreur API INPI: ${retryResponse.status}`,
        } as INPIError
      }

      return await retryResponse.json()
    }

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw {
        code: 'NETWORK_ERROR',
        message: `Erreur API INPI: ${response.status} ${response.statusText}`,
      } as INPIError
    }

    return await response.json()
  } catch (error) {
    if ((error as INPIError).code) {
      throw error
    }

    throw {
      code: 'NETWORK_ERROR',
      message: `Erreur réseau INPI: ${error}`,
    } as INPIError
  }
}

/**
 * Récupère les informations complètes d'une entreprise
 */
export async function getCompanyInfo(siren: string): Promise<INPICompanyInfo | null> {
  try {
    const token = await getINPIToken()

    const response = await fetch(`${INPI_API_URL}/companies/${siren}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    // Token expiré - invalider le cache et réessayer une fois
    if (response.status === 401) {
      invalidateTokenCache()
      const newToken = await getINPIToken()

      const retryResponse = await fetch(`${INPI_API_URL}/companies/${siren}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: 'application/json',
        },
      })

      if (retryResponse.status === 401) {
        throw {
          code: 'UNAUTHORIZED',
          message: 'Token INPI invalide après renouvellement',
        } as INPIError
      }

      if (retryResponse.status === 404) {
        return null
      }

      if (!retryResponse.ok) {
        throw {
          code: 'NETWORK_ERROR',
          message: `Erreur API INPI: ${retryResponse.status}`,
        } as INPIError
      }

      return await retryResponse.json()
    }

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw {
        code: 'NETWORK_ERROR',
        message: `Erreur API INPI: ${response.status} ${response.statusText}`,
      } as INPIError
    }

    return await response.json()
  } catch (error) {
    if ((error as INPIError).code) {
      throw error
    }

    throw {
      code: 'NETWORK_ERROR',
      message: `Erreur réseau INPI: ${error}`,
    } as INPIError
  }
}
