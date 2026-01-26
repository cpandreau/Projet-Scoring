/**
 * Utilitaires d'agrégation NAF vers nomenclature A21
 *
 * La nomenclature A21 est le niveau d'agrégation le plus élevé
 * de la NAF (Nomenclature d'Activités Française).
 * Elle comporte 21 sections identifiées par une lettre.
 *
 * Source: INSEE - NAF rév.2
 * https://www.insee.fr/fr/information/2120875
 */

export interface A21Section {
  code: string
  libelle: string
}

/**
 * Mapping des 2 premiers caractères du code NAF vers la section A21
 */
export const NAF_A21_MAPPING: Record<string, A21Section> = {
  // A - Agriculture, sylviculture et pêche
  '01': { code: 'AZ', libelle: 'Agriculture, sylviculture et pêche' },
  '02': { code: 'AZ', libelle: 'Agriculture, sylviculture et pêche' },
  '03': { code: 'AZ', libelle: 'Agriculture, sylviculture et pêche' },

  // B - Industries extractives
  '05': { code: 'BZ', libelle: 'Industries extractives' },
  '06': { code: 'BZ', libelle: 'Industries extractives' },
  '07': { code: 'BZ', libelle: 'Industries extractives' },
  '08': { code: 'BZ', libelle: 'Industries extractives' },
  '09': { code: 'BZ', libelle: 'Industries extractives' },

  // C - Industrie manufacturière
  '10': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '11': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '12': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '13': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '14': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '15': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '16': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '17': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '18': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '19': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '20': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '21': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '22': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '23': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '24': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '25': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '26': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '27': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '28': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '29': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '30': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '31': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '32': { code: 'CZ', libelle: 'Industrie manufacturière' },
  '33': { code: 'CZ', libelle: 'Industrie manufacturière' },

  // D - Production et distribution d'électricité, gaz, vapeur et air conditionné
  '35': { code: 'DZ', libelle: "Production d'électricité, gaz" },

  // E - Production et distribution d'eau, assainissement, gestion des déchets
  '36': { code: 'EZ', libelle: 'Eau, assainissement, déchets' },
  '37': { code: 'EZ', libelle: 'Eau, assainissement, déchets' },
  '38': { code: 'EZ', libelle: 'Eau, assainissement, déchets' },
  '39': { code: 'EZ', libelle: 'Eau, assainissement, déchets' },

  // F - Construction
  '41': { code: 'FZ', libelle: 'Construction' },
  '42': { code: 'FZ', libelle: 'Construction' },
  '43': { code: 'FZ', libelle: 'Construction' },

  // G - Commerce, réparation d'automobiles et de motocycles
  '45': { code: 'GZ', libelle: 'Commerce, réparation auto' },
  '46': { code: 'GZ', libelle: 'Commerce, réparation auto' },
  '47': { code: 'GZ', libelle: 'Commerce, réparation auto' },

  // H - Transports et entreposage
  '49': { code: 'HZ', libelle: 'Transports et entreposage' },
  '50': { code: 'HZ', libelle: 'Transports et entreposage' },
  '51': { code: 'HZ', libelle: 'Transports et entreposage' },
  '52': { code: 'HZ', libelle: 'Transports et entreposage' },
  '53': { code: 'HZ', libelle: 'Transports et entreposage' },

  // I - Hébergement et restauration
  '55': { code: 'IZ', libelle: 'Hébergement et restauration' },
  '56': { code: 'IZ', libelle: 'Hébergement et restauration' },

  // J - Information et communication
  '58': { code: 'JZ', libelle: 'Information et communication' },
  '59': { code: 'JZ', libelle: 'Information et communication' },
  '60': { code: 'JZ', libelle: 'Information et communication' },
  '61': { code: 'JZ', libelle: 'Information et communication' },
  '62': { code: 'JZ', libelle: 'Information et communication' },
  '63': { code: 'JZ', libelle: 'Information et communication' },

  // K - Activités financières et d'assurance
  '64': { code: 'KZ', libelle: 'Activités financières' },
  '65': { code: 'KZ', libelle: 'Activités financières' },
  '66': { code: 'KZ', libelle: 'Activités financières' },

  // L - Activités immobilières
  '68': { code: 'LZ', libelle: 'Activités immobilières' },

  // M - Activités spécialisées, scientifiques et techniques
  '69': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '70': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '71': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '72': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '73': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '74': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },
  '75': { code: 'MZ', libelle: 'Activités spécialisées, scientifiques' },

  // N - Activités de services administratifs et de soutien
  '77': { code: 'NZ', libelle: 'Activités de services administratifs' },
  '78': { code: 'NZ', libelle: 'Activités de services administratifs' },
  '79': { code: 'NZ', libelle: 'Activités de services administratifs' },
  '80': { code: 'NZ', libelle: 'Activités de services administratifs' },
  '81': { code: 'NZ', libelle: 'Activités de services administratifs' },
  '82': { code: 'NZ', libelle: 'Activités de services administratifs' },

  // O - Administration publique
  '84': { code: 'OZ', libelle: 'Administration publique' },

  // P - Enseignement
  '85': { code: 'PZ', libelle: 'Enseignement' },

  // Q - Santé humaine et action sociale
  '86': { code: 'QZ', libelle: 'Santé humaine et action sociale' },
  '87': { code: 'QZ', libelle: 'Santé humaine et action sociale' },
  '88': { code: 'QZ', libelle: 'Santé humaine et action sociale' },

  // R - Arts, spectacles et activités récréatives
  '90': { code: 'RZ', libelle: 'Arts, spectacles, activités récréatives' },
  '91': { code: 'RZ', libelle: 'Arts, spectacles, activités récréatives' },
  '92': { code: 'RZ', libelle: 'Arts, spectacles, activités récréatives' },
  '93': { code: 'RZ', libelle: 'Arts, spectacles, activités récréatives' },

  // S - Autres activités de services
  '94': { code: 'SZ', libelle: 'Autres activités de services' },
  '95': { code: 'SZ', libelle: 'Autres activités de services' },
  '96': { code: 'SZ', libelle: 'Autres activités de services' },

  // T - Activités des ménages (employeurs)
  '97': { code: 'TZ', libelle: 'Activités des ménages' },
  '98': { code: 'TZ', libelle: 'Activités des ménages' },

  // U - Activités extraterritoriales
  '99': { code: 'UZ', libelle: 'Activités extraterritoriales' },
}

/**
 * Retourne la section A21 correspondant à un code NAF
 *
 * @param codeNAF - Code NAF complet (ex: "4120A", "6201Z")
 * @returns La section A21 avec code et libellé, ou null si non trouvé
 *
 * @example
 * getA21FromNAF("4120A") // { code: "FZ", libelle: "Construction" }
 * getA21FromNAF("6201Z") // { code: "JZ", libelle: "Information et communication" }
 * getA21FromNAF("XXXXX") // null
 */
export function getA21FromNAF(codeNAF: string): A21Section | null {
  if (!codeNAF || codeNAF.length < 2) {
    return null
  }

  const prefix = codeNAF.substring(0, 2)
  return NAF_A21_MAPPING[prefix] ?? null
}
