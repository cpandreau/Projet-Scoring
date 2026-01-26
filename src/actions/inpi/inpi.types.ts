/**
 * Types et constantes pour l'intégration INPI
 */

import type { INPIBilanSaisi } from '@/lib/api/inpi-service'

/**
 * Catégories juridiques - Nomenclature INSEE CJ Niveau 3
 * Source officielle : https://www.insee.fr/fr/information/2028129
 * Mise à jour : Janvier 2026
 */
export const FORMES_JURIDIQUES: Record<string, string> = {
  // === PERSONNES PHYSIQUES (1xxx) ===
  '1000': 'Entrepreneur individuel',
  '1100': 'Artisan-commerçant',
  '1200': 'Commerçant',
  '1300': 'Artisan',
  '1400': 'Officier public ou ministériel',
  '1500': 'Profession libérale',
  '1600': 'Exploitant agricole',
  '1700': 'Agent commercial',
  '1800': 'Associé-gérant de société',
  '1900': 'Autre personne physique',

  // === INDIVISION ET DIVERS (2xxx) ===
  '2110': 'Indivision entre personnes physiques',
  '2120': 'Indivision avec personne morale',
  '2210': 'Société créée de fait entre personnes physiques',
  '2220': 'Société créée de fait avec personne morale',
  '2310': 'Société en participation entre personnes physiques',
  '2320': 'Société en participation avec personne morale',
  '2385': 'Société en participation de professions libérales',
  '2400': 'Fiducie',
  '2700': 'Paroisse hors Alsace-Moselle',
  '2900': 'Autre groupement de droit privé non doté de personnalité morale',

  // === PERSONNES MORALES DE DROIT ÉTRANGER (3xxx) ===
  '3110': "Représentation ou agence commerciale d'État étranger",
  '3120': 'Société commerciale étrangère immatriculée au RCS',
  '3205': 'Organisation internationale',
  '3210': 'État ou collectivité territoriale étrangère',
  '3220': 'Établissement public étranger',
  '3290': 'Autre personne morale de droit étranger',

  // === PERSONNES MORALES DE DROIT PUBLIC (4xxx) ===
  '4110': 'Région',
  '4120': 'Département',
  '4130': 'Commune ou commune nouvelle',
  '4140': 'Établissement public local (EPIC, CCAS)',
  '4150': "Établissement public local d'enseignement",
  '4160': 'Établissement public local social et médico-social',
  '4210': 'Établissement public national administratif',
  '4220': 'Établissement public national industriel et commercial (EPIC)',
  '4230': "Établissement public national d'enseignement",
  '4300': "Groupement d'intérêt public (GIP)",
  '4400': 'Établissement public de santé',

  // === SOCIÉTÉ EN NOM COLLECTIF (52xx) ===
  '5202': 'Société en nom collectif (SNC)',
  '5203': 'SNC entre personnes physiques',
  '5204': 'SNC avec personnes morales',

  // === SOCIÉTÉ EN COMMANDITE (53xx) ===
  '5306': 'Société en commandite simple (SCS)',
  '5307': 'SCS entre personnes physiques',
  '5308': 'Société en commandite par actions (SCA)',
  '5309': 'SCA entre personnes physiques',

  // === SARL (54xx) ===
  '5410': 'SARL nationale',
  '5415': "SARL d'exercice libéral",
  '5422': 'SARL immobilière pour le commerce et l\'industrie (SICOMI)',
  '5426': 'SARL immobilière de gestion',
  '5430': "SARL d'aménagement foncier et d'équipement rural (SAFER)",
  '5431': "SARL d'intérêt collectif agricole (SICA)",
  '5432': "SARL d'attribution",
  '5442': 'SARL coopérative de construction',
  '5443': "SARL coopérative d'achat immobilier",
  '5451': "SARL coopérative d'entreprise de transport",
  '5453': 'SARL coopérative artisanale',
  '5454': 'SARL coopérative maritime',
  '5460': 'SARL coopérative de consommation',
  '5470': 'SARL coopérative ouvrière de production (SCOP)',
  '5485': "SELARL (Société d'exercice libéral à responsabilité limitée)",
  '5498': 'SARL unipersonnelle (EURL)',
  '5499': 'Autre SARL',

  // === SA À CONSEIL D'ADMINISTRATION (55xx) ===
  '5505': "SA à participation ouvrière à conseil d'administration",
  '5510': "SA nationale à conseil d'administration",
  '5515': "SA d'économie mixte à conseil d'administration",
  '5520': 'SA de crédit immobilier à conseil d\'administration',
  '5522': 'SA immobilière pour le commerce et l\'industrie (SICOMI) à CA',
  '5525': "SA immobilière d'investissement à CA",
  '5530': "SA d'aménagement foncier et d'équipement rural (SAFER) à CA",
  '5531': "SA d'intérêt collectif agricole (SICA) à CA",
  '5532': "SA d'attribution à CA",
  '5542': 'SA coopérative de construction à CA',
  '5543': 'SA de HLM à CA',
  '5546': 'SA coopérative de production de HLM à CA',
  '5547': 'SA de crédit immobilier à CA',
  '5548': 'SA coopérative de consommation à CA',
  '5551': "SA coopérative d'entreprise de transport à CA",
  '5552': 'SA coopérative de banque populaire à CA',
  '5553': 'SA coopérative artisanale à CA',
  '5554': 'SA coopérative maritime à CA',
  '5555': 'SA coopérative de transport à CA',
  '5558': 'SA coopérative agricole à CA',
  '5560': 'SA coopérative ouvrière de production (SCOP) à CA',
  '5585': "SELAFA (Société d'exercice libéral à forme anonyme) à CA",
  '5599': "Autre SA à conseil d'administration",

  // === SA À DIRECTOIRE (56xx) ===
  '5605': 'SA à participation ouvrière à directoire',
  '5610': 'SA nationale à directoire',
  '5615': "SA d'économie mixte à directoire",
  '5620': 'SA de crédit immobilier à directoire',
  '5685': 'SELAFA à directoire',
  '5699': 'Autre SA à directoire',

  // === SAS (57xx) ===
  '5710': 'SAS (Société par actions simplifiée)',
  '5720': 'SASU (Société par actions simplifiée unipersonnelle)',
  '5785': "SELAS (Société d'exercice libéral par actions simplifiée)",
  '5799': 'Autre société par actions simplifiée',

  // === SOCIÉTÉ EUROPÉENNE (58xx) ===
  '5800': 'Société européenne',

  // === GROUPEMENTS D'INTÉRÊT ÉCONOMIQUE (62xx) ===
  '6100': "Caisse d'épargne et de prévoyance",
  '6210': "GIE (Groupement d'intérêt économique)",
  '6220': 'GIE coopératif',

  // === SOCIÉTÉS COOPÉRATIVES AGRICOLES (63xx) ===
  '6316': "CUMA (Coopérative d'utilisation de matériel agricole)",
  '6317': 'Société coopérative agricole',
  '6318': 'Union de sociétés coopératives agricoles',

  // === SOCIÉTÉS CIVILES (65xx) ===
  '6532': 'SCPI (Société civile de placement immobilier)',
  '6533': "GAEC (Groupement agricole d'exploitation en commun)",
  '6534': 'GFA (Groupement foncier agricole)',
  '6535': 'GFR (Groupement forestier)',
  '6538': 'SCM (Société civile de moyens)',
  '6539': 'SCP (Société civile professionnelle)',
  '6540': 'SCI (Société civile immobilière)',
  '6541': 'SCI de construction-vente',
  '6542': "SCI d'attribution",
  '6543': 'SCI de location',
  '6544': "SCIA (Société civile immobilière d'accession progressive à la propriété)",
  '6551': "SCIC (Société coopérative d'intérêt collectif)",
  '6554': 'SCE (Société coopérative européenne)',
  '6558': 'SCOP (Société coopérative de production)',
  '6560': 'SIE (Société interprofessionnelle de soins ambulatoires)',
  '6561': "SEP (Société d'exercice libéral professionnelle)",
  '6597': "SCEA (Société civile d'exploitation agricole)",
  '6598': 'EARL (Exploitation agricole à responsabilité limitée)',
  '6599': 'Autre société civile',

  // === AUTRES PERSONNES MORALES DE DROIT PRIVÉ (7xxx, 8xxx) ===
  '7111': 'Autorité constitutionnelle',
  '7112': 'Autorité administrative ou publique indépendante',
  '7120': 'Ministère',
  '7150': "Service déconcentré de l'État",
  '7160': "Service déconcentré d'un ministère",
  '7171': "Établissement d'enseignement",
  '7172': 'Établissement de santé',
  '8510': 'Régime auto-entrepreneur',

  // === ASSOCIATIONS (92xx) ===
  '9210': 'Association non déclarée',
  '9220': 'Association déclarée',
  '9221': "Association déclarée d'insertion par l'activité économique",
  '9222': 'Association intermédiaire',
  '9223': "Groupement d'employeurs",
  '9224': "Association d'avocats à responsabilité professionnelle individuelle",
  '9230': "Association déclarée reconnue d'utilité publique",
  '9240': 'Congrégation',
  '9260': 'Association de droit local (Alsace-Moselle)',
  '9300': 'Fondation',

  // === AUTRES FORMES (9xxx) ===
  '9900': 'Autre personne morale de droit privé',
  '9970': 'Groupement de coopération sanitaire à gestion privée',
}

/**
 * Codes rôles des représentants - INPI/RNE
 * Mise à jour : Janvier 2026
 */
export const ROLES_ENTREPRISE: Record<string, string> = {
  // === PRÉSIDENTS ===
  '10': 'Président',
  '11': "Président du conseil d'administration",
  '12': 'Président du directoire',
  '13': 'Président du conseil de surveillance',
  '14': 'Vice-président',
  '15': "Vice-président du conseil d'administration",
  '16': 'Vice-président du conseil de surveillance',

  // === DIRECTEURS ===
  '20': 'Directeur général',
  '21': 'Directeur général délégué',
  '22': 'Membre du directoire',
  '23': 'Membre du conseil de surveillance',
  '24': 'Directeur général adjoint',
  '25': 'Directeur',

  // === GÉRANTS ===
  '30': 'Gérant',
  '31': 'Co-gérant',
  '32': 'Gérant non associé',
  '33': 'Gérant associé',
  '34': 'Gérant commandité',
  '35': 'Gérant statutaire',

  // === ASSOCIÉS ===
  '40': 'Associé',
  '41': 'Associé commandité',
  '42': 'Associé commanditaire',
  '43': 'Associé unique',
  '44': 'Associé indéfiniment responsable',
  '45': 'Associé gérant',

  // === ADMINISTRATEURS ===
  '50': 'Administrateur',
  '51': 'Administrateur indépendant',
  '52': 'Administrateur délégué',
  '53': 'Administrateur judiciaire',

  // === LIQUIDATEURS ===
  '60': 'Liquidateur',
  '61': 'Liquidateur amiable',
  '62': 'Liquidateur judiciaire',

  // === COMMISSAIRES AUX COMPTES ===
  '70': 'Commissaire aux comptes titulaire',
  '71': 'Commissaire aux comptes suppléant',
  '72': 'Commissaire aux comptes (personne morale)',

  // === REPRÉSENTANTS ===
  '80': 'Représentant permanent (personne morale)',
  '81': 'Représentant légal',
  '82': 'Mandataire social',

  // === BÉNÉFICIAIRES EFFECTIFS ===
  '90': 'Bénéficiaire effectif',
  '91': 'Bénéficiaire effectif par détention de capital',
  '92': 'Bénéficiaire effectif par détention de droits de vote',
  '93': 'Bénéficiaire effectif par autre moyen de contrôle',

  // === AUTRES ===
  '99': 'Autre fonction',
}

/**
 * Retourne le libellé de la forme juridique ou le code si inconnu
 */
export function getFormeJuridiqueLabel(code: string | null | undefined): string {
  if (!code) return 'Non renseigné'
  return FORMES_JURIDIQUES[code] ?? `Code ${code}`
}

/**
 * Retourne le libellé du rôle ou le code si inconnu
 */
export function getRoleLabel(code: string | null | undefined): string {
  if (!code) return 'Non renseigné'
  return ROLES_ENTREPRISE[code] ?? `Code ${code}`
}

// --- Interfaces pour les bilans ---

export interface INPIBilanSummary {
  id: string
  dateCloture: string
  dateDepot: string
  typeBilan: string
  confidentialite: string
}

export interface FetchINPIBilansResult {
  success: boolean
  data?: {
    siren: string
    bilans: INPIBilanSummary[]
  }
  error?: string
}

export interface FetchINPIBilanDetailResult {
  success: boolean
  data?: INPIBilanSaisi
  error?: string
}

// --- Interfaces pour les informations entreprise ---

export interface INPIDirigeant {
  nom: string
  prenom?: string
  role: string
  roleCode: string
  dateNaissance?: string
  nationalite?: string
  adresseDomicile?: {
    commune?: string
    codePostal?: string
  }
  typePersonne: 'INDIVIDU' | 'PERSONNE_MORALE'
  actif: boolean
  sirenPM?: string
}

export interface INPIObservationRCS {
  date: string
  texte: string
  code: string
  etat: string
}

export interface INPIHistoriqueEvent {
  date: string
  code: string
  libelle: string
}

export interface INPIAdresseStructuree {
  pays?: string
  codePays?: string
  codePostal?: string
  commune?: string
  codeInseeCommune?: string
  typeVoie?: string
  libelleVoie?: string
  numeroVoie?: string
  indiceRepetition?: string
  distributionSpeciale?: string
  complementLocalisation?: string
  ambulant?: boolean
  domiciliataire?: boolean
  adresseComplete: string
}

export interface INPIActiviteStructuree {
  codeCategorie?: string
  activiteId?: string
  principale: boolean
  dateDebut?: string
  dateFin?: string
  exercice?: string
  formeExercice?: string
  description?: string
  codeApe?: string
}

export interface INPIEtablissementStructure {
  siret?: string
  nic?: string
  codeApe?: string
  activiteNonSedentaire?: boolean
  principal: boolean
  adresse?: INPIAdresseStructuree
}

export interface INPIRegistresStructure {
  raaPresent: boolean
  rnmPresent: boolean
  rncsPresent: boolean
  rncsDateDebut?: string
  rncsDateImmatriculation?: string
}

export interface INPICompanyFullData {
  // Bloc racine
  idINPI?: string
  siren: string
  updatedAt?: string
  nombreRepresentantsActifs?: number
  nombreEtablissementsOuverts?: number

  // Bloc identité
  denomination?: string
  sigle?: string
  nomCommercial?: string
  formeJuridique?: {
    code: string
    libelle: string
  }
  nicSiege?: string
  codeApe?: string
  dateImmatriculation?: string
  dateDebutActivite?: string

  // Bloc description
  objetSocial?: string
  duree?: number
  dateClotureExerciceSocial?: string
  datePremiereCloture?: string
  dateFinExistence?: string
  capital?: {
    montant: number
    devise: string
    variable: boolean
  }
  ess?: boolean
  societeMission?: boolean
  indicateurOrigineFusionScission?: boolean
  indicateurAssocieUnique?: boolean
  indicateurAssocieUniqueDirigeant?: boolean

  // Bloc nature création
  dateCreation?: string
  societeEtrangere?: boolean
  microEntreprise?: boolean
  etablieEnFrance?: boolean
  salarieEnFrance?: boolean
  relieeEntrepriseAgricole?: boolean
  entrepriseAgricole?: boolean
  eirl?: boolean

  // Bloc adresse siège
  adresseSiege?: INPIAdresseStructuree

  // Bloc établissement principal
  etablissementPrincipal?: INPIEtablissementStructure

  // Bloc activités
  activites: INPIActiviteStructuree[]

  // Bloc dirigeants
  dirigeants: INPIDirigeant[]

  // Bloc registres
  registres?: INPIRegistresStructure

  // Bloc diffusion
  diffusionINSEE?: string
  diffusionCommerciale?: boolean
  typePersonne?: 'M' | 'P'

  // Bloc observations & historique
  observationsRCS: INPIObservationRCS[]
  historique: INPIHistoriqueEvent[]
}

export interface INPICompanyInfoStructured {
  siren: string
  denomination?: string
  sigle?: string
  nomCommercial?: string
  formeJuridique?: {
    code: string
    libelle: string
  }
  capital?: {
    montant: number
    devise: string
    variable: boolean
  }
  dateCreation?: string
  dateClotureExerciceSocial?: string
  objetSocial?: string
  adresseSiege?: INPIAdresseStructuree
  dirigeants: INPIDirigeant[]
  observationsRCS: INPIObservationRCS[]
  historique: INPIHistoriqueEvent[]
  fullData?: INPICompanyFullData
}

export interface FetchINPICompanyInfoResult {
  success: boolean
  data?: INPICompanyInfoStructured
  error?: string
}

// --- Interface pour la synchronisation ---

export interface SyncINPIResult {
  success: boolean
  message: string
  syncedAt?: string
}
