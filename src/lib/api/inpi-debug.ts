/**
 * Script de diagnostic pour l'API INPI
 * Permet de tester la connexion et les endpoints
 */

const INPI_API_URL = process.env.INPI_API_URL || 'https://registre-national-entreprises.inpi.fr/api'
const INPI_USERNAME = process.env.INPI_USERNAME || ''
const INPI_PASSWORD = process.env.INPI_PASSWORD || ''

export interface DebugLog {
  timestamp: string
  level: 'info' | 'success' | 'error' | 'warning'
  message: string
  data?: unknown
}

export interface DebugResult {
  success: boolean
  logs: DebugLog[]
  token?: string
  data?: unknown
}

function log(logs: DebugLog[], level: DebugLog['level'], message: string, data?: unknown): void {
  logs.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  })
}

/**
 * Vérifie la connexion à l'API INPI et tente une authentification
 */
export async function debugINPIConnection(): Promise<DebugResult> {
  const logs: DebugLog[] = []

  // Vérification des credentials
  log(logs, 'info', 'Vérification des credentials INPI...')

  if (!INPI_USERNAME) {
    log(logs, 'error', "INPI_USERNAME non défini dans les variables d'environnement")
    return { success: false, logs }
  }
  log(logs, 'success', `INPI_USERNAME défini: ${INPI_USERNAME.substring(0, 3)}***`)

  if (!INPI_PASSWORD) {
    log(logs, 'error', "INPI_PASSWORD non défini dans les variables d'environnement")
    return { success: false, logs }
  }
  log(logs, 'success', `INPI_PASSWORD défini: ${INPI_PASSWORD.substring(0, 3)}***`)

  // Tentative d'authentification
  log(logs, 'info', `Tentative d'authentification sur ${INPI_API_URL}/sso/login`)

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

    log(logs, 'info', `Statut HTTP: ${response.status} ${response.statusText}`)

    const responseText = await response.text()
    let responseData: unknown

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (!response.ok) {
      log(logs, 'error', 'Authentification échouée', {
        status: response.status,
        statusText: response.statusText,
        body: responseData,
      })

      // Détail des codes d'erreur
      if (response.status === 401) {
        log(logs, 'warning', '401 Unauthorized - Credentials invalides ou compte non activé')
      } else if (response.status === 403) {
        log(logs, 'warning', "403 Forbidden - L'API n'est pas activée sur ce compte INPI")
      } else if (response.status === 429) {
        log(logs, 'warning', '429 Too Many Requests - Quota dépassé (10 000 req/jour)')
      }

      return { success: false, logs }
    }

    // Succès - extraire le token
    const data = responseData as { token?: string; access_token?: string }
    const token = data.token || data.access_token

    if (!token) {
      log(logs, 'error', 'Token non trouvé dans la réponse', responseData)
      return { success: false, logs }
    }

    log(logs, 'success', `Token obtenu: ${token.substring(0, 20)}...`)
    log(logs, 'info', `Longueur du token: ${token.length} caractères`)

    return { success: true, logs, token }
  } catch (error) {
    log(logs, 'error', "Erreur réseau lors de l'authentification", {
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, logs }
  }
}

/**
 * Teste la récupération des informations d'une entreprise
 */
export async function debugINPICompany(siren: string): Promise<DebugResult> {
  const logs: DebugLog[] = []

  log(logs, 'info', `Test de récupération des infos entreprise pour SIREN: ${siren}`)

  // Récupérer le token
  const authResult = await debugINPIConnection()
  logs.push(...authResult.logs)

  if (!authResult.success || !authResult.token) {
    log(logs, 'error', 'Impossible de récupérer le token, abandon')
    return { success: false, logs }
  }

  // Appel API
  const url = `${INPI_API_URL}/companies/${siren}`
  log(logs, 'info', `GET ${url}`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authResult.token}`,
        Accept: 'application/json',
      },
    })

    log(logs, 'info', `Statut HTTP: ${response.status} ${response.statusText}`)

    const responseText = await response.text()
    let responseData: unknown

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (!response.ok) {
      log(logs, 'error', 'Erreur lors de la récupération', {
        status: response.status,
        body: responseData,
      })

      if (response.status === 404) {
        log(
          logs,
          'warning',
          '404 Not Found - Entreprise non trouvée (SIREN invalide ou non inscrite au RCS)'
        )
      } else if (response.status === 401) {
        log(logs, 'warning', '401 Unauthorized - Token expiré ou invalide')
      }

      return { success: false, logs }
    }

    // Succès - log des clés de premier niveau
    const data = responseData as Record<string, unknown>
    const keys = Object.keys(data)
    log(logs, 'success', 'Données reçues avec succès')
    log(logs, 'info', `Clés de premier niveau: ${keys.join(', ')}`)

    // Log quelques infos utiles
    if (data.siren) {
      log(logs, 'info', `SIREN: ${data.siren}`)
    }
    if (data.diffusionINSEE) {
      log(logs, 'info', `Diffusion INSEE: ${data.diffusionINSEE}`)
    }
    if (data.content && typeof data.content === 'object') {
      const contentKeys = Object.keys(data.content as object)
      log(logs, 'info', `Clés dans content: ${contentKeys.join(', ')}`)
    }

    return { success: true, logs, data: responseData }
  } catch (error) {
    log(logs, 'error', 'Erreur réseau', {
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, logs }
  }
}

/**
 * Teste la récupération des pièces jointes (bilans, actes)
 */
export async function debugINPIAttachments(siren: string): Promise<DebugResult> {
  const logs: DebugLog[] = []

  log(logs, 'info', `Test de récupération des pièces jointes pour SIREN: ${siren}`)

  // Récupérer le token
  const authResult = await debugINPIConnection()
  // Ne pas ajouter les logs d'auth pour éviter la duplication

  if (!authResult.success || !authResult.token) {
    log(logs, 'error', 'Impossible de récupérer le token, abandon')
    return { success: false, logs }
  }

  log(logs, 'success', 'Token récupéré')

  // Appel API
  const url = `${INPI_API_URL}/companies/${siren}/attachments`
  log(logs, 'info', `GET ${url}`)

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authResult.token}`,
        Accept: 'application/json',
      },
    })

    log(logs, 'info', `Statut HTTP: ${response.status} ${response.statusText}`)

    const responseText = await response.text()
    let responseData: unknown

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    if (!response.ok) {
      log(logs, 'error', 'Erreur lors de la récupération', {
        status: response.status,
        body: responseData,
      })
      return { success: false, logs }
    }

    // Succès - analyser les données
    const data = responseData as {
      actes?: unknown[]
      bilansPdf?: unknown[]
      bilansSaisis?: Array<{
        id: string
        dateCloture: string
        confidentialite: string
        type?: string
        dateDepot?: string
      }>
    }

    log(logs, 'success', 'Données reçues avec succès')

    // Compter les éléments
    const nbActes = data.actes?.length || 0
    const nbBilansPdf = data.bilansPdf?.length || 0
    const nbBilansSaisis = data.bilansSaisis?.length || 0

    log(logs, 'info', `Nombre d'actes: ${nbActes}`)
    log(logs, 'info', `Nombre de bilans PDF: ${nbBilansPdf}`)
    log(logs, 'info', `Nombre de bilans saisis: ${nbBilansSaisis}`)

    // Détail des bilans saisis
    if (data.bilansSaisis && data.bilansSaisis.length > 0) {
      log(logs, 'info', 'Détail des bilans saisis:')
      for (const bilan of data.bilansSaisis) {
        log(
          logs,
          'info',
          `  - ID: ${bilan.id}, Clôture: ${bilan.dateCloture}, Confidentialité: ${bilan.confidentialite}, Type: ${bilan.type || 'N/A'}`
        )
      }

      // Compter les bilans publics vs confidentiels
      const publics = data.bilansSaisis.filter((b) => b.confidentialite !== 'Confidential').length
      const confidentiels = data.bilansSaisis.filter(
        (b) => b.confidentialite === 'Confidential'
      ).length
      log(logs, 'info', `Bilans publics: ${publics}, Bilans confidentiels: ${confidentiels}`)
    }

    return { success: true, logs, data: responseData }
  } catch (error) {
    log(logs, 'error', 'Erreur réseau', {
      error: error instanceof Error ? error.message : String(error),
    })
    return { success: false, logs }
  }
}

/**
 * Exécute tous les tests de diagnostic
 */
export async function runFullDiagnostic(siren: string): Promise<{
  connection: DebugResult
  company: DebugResult
  attachments: DebugResult
}> {
  console.log('=== DIAGNOSTIC INPI ===')
  console.log(`SIREN: ${siren}`)
  console.log(`URL API: ${INPI_API_URL}`)
  console.log('')

  // Test de connexion
  console.log('--- Test de connexion ---')
  const connection = await debugINPIConnection()
  for (const log of connection.logs) {
    console.log(`[${log.level.toUpperCase()}] ${log.message}`)
    if (log.data) console.log('  Data:', log.data)
  }
  console.log('')

  // Test entreprise
  console.log('--- Test infos entreprise ---')
  const company = await debugINPICompany(siren)
  // Filtrer les logs de connexion déjà affichés
  const companyOnlyLogs = company.logs.filter(
    (l) => !connection.logs.some((cl) => cl.message === l.message)
  )
  for (const log of companyOnlyLogs) {
    console.log(`[${log.level.toUpperCase()}] ${log.message}`)
    if (log.data) console.log('  Data:', log.data)
  }
  console.log('')

  // Test attachments
  console.log('--- Test pièces jointes ---')
  const attachments = await debugINPIAttachments(siren)
  for (const log of attachments.logs) {
    console.log(`[${log.level.toUpperCase()}] ${log.message}`)
    if (log.data) console.log('  Data:', log.data)
  }

  console.log('')
  console.log('=== FIN DIAGNOSTIC ===')

  return { connection, company, attachments }
}
