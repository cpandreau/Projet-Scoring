export interface SireneEtablissement {
  siren: string
  siret: string
  uniteLegale: {
    denominationUniteLegale?: string
    nomUniteLegale?: string
    prenomUsuelUniteLegale?: string
    categorieJuridiqueUniteLegale: string
    activitePrincipaleUniteLegale: string
  }
  adresseEtablissement: {
    numeroVoieEtablissement?: string
    typeVoieEtablissement?: string
    libelleVoieEtablissement?: string
    codePostalEtablissement?: string
    libelleCommuneEtablissement?: string
  }
}

export interface SireneResult {
  siren: string
  siret: string
  raison_sociale: string
  forme_juridique: string
  code_naf: string
  adresse: string
}

export interface SireneSearchResponse {
  results?: SireneResult[]
  error?: string
}
