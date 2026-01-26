import { type NextRequest, NextResponse } from 'next/server'
import {
  type DebugResult,
  debugINPIAttachments,
  debugINPICompany,
  debugINPIConnection,
} from '@/lib/api/inpi-debug'

export const dynamic = 'force-dynamic'

interface DiagnosticResponse {
  siren: string
  timestamp: string
  results: {
    connection: DebugResult
    company: DebugResult
    attachments: DebugResult
  }
  summary: {
    connectionOk: boolean
    companyOk: boolean
    attachmentsOk: boolean
    allOk: boolean
  }
}

/**
 * Route de diagnostic INPI
 * GET /api/debug-inpi?siren=XXXXXXXXX
 *
 * Codes erreur INPI à surveiller :
 * - 200 : OK
 * - 400 : Erreur dans la requête
 * - 401 : Non authentifié (credentials invalides ou token expiré)
 * - 403 : Pas les droits (API non activée sur le compte)
 * - 404 : Entreprise non trouvée
 * - 429 : Quota dépassé (10 000 requêtes/jour)
 * - 500 : Erreur serveur INPI
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<DiagnosticResponse | { error: string }>> {
  const searchParams = request.nextUrl.searchParams
  const siren = searchParams.get('siren')

  if (!siren) {
    return NextResponse.json(
      { error: "Paramètre 'siren' requis. Usage: /api/debug-inpi?siren=XXXXXXXXX" },
      { status: 400 }
    )
  }

  // Valider le format du SIREN
  const sirenClean = siren.replace(/\s/g, '')
  if (!/^\d{9}$/.test(sirenClean)) {
    return NextResponse.json(
      { error: 'SIREN invalide. Doit contenir exactement 9 chiffres.' },
      { status: 400 }
    )
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`DIAGNOSTIC INPI - ${new Date().toISOString()}`)
  console.log(`SIREN: ${sirenClean}`)
  console.log(`${'='.repeat(60)}\n`)

  // Exécuter les tests de diagnostic
  const connection = await debugINPIConnection()

  // Afficher les logs de connexion
  console.log('\n--- TEST CONNEXION ---')
  for (const log of connection.logs) {
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ ',
    }[log.level]
    console.log(`${prefix} ${log.message}`)
    if (log.data) {
      console.log('   ', JSON.stringify(log.data, null, 2).split('\n').join('\n    '))
    }
  }

  const company = await debugINPICompany(sirenClean)

  // Afficher les logs entreprise (sans dupliquer ceux de connexion)
  console.log('\n--- TEST ENTREPRISE ---')
  const companyOnlyLogs = company.logs.filter(
    (l) => !connection.logs.some((cl) => cl.message === l.message && cl.timestamp === l.timestamp)
  )
  for (const log of companyOnlyLogs) {
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ ',
    }[log.level]
    console.log(`${prefix} ${log.message}`)
    if (log.data) {
      console.log('   ', JSON.stringify(log.data, null, 2).split('\n').join('\n    '))
    }
  }

  const attachments = await debugINPIAttachments(sirenClean)

  // Afficher les logs attachments
  console.log('\n--- TEST PIÈCES JOINTES ---')
  for (const log of attachments.logs) {
    const prefix = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ ',
    }[log.level]
    console.log(`${prefix} ${log.message}`)
    if (log.data) {
      console.log('   ', JSON.stringify(log.data, null, 2).split('\n').join('\n    '))
    }
  }

  // Résumé
  const summary = {
    connectionOk: connection.success,
    companyOk: company.success,
    attachmentsOk: attachments.success,
    allOk: connection.success && company.success && attachments.success,
  }

  console.log('\n--- RÉSUMÉ ---')
  console.log(`Connexion: ${summary.connectionOk ? '✅ OK' : '❌ ÉCHEC'}`)
  console.log(`Entreprise: ${summary.companyOk ? '✅ OK' : '❌ ÉCHEC'}`)
  console.log(`Pièces jointes: ${summary.attachmentsOk ? '✅ OK' : '❌ ÉCHEC'}`)
  console.log(`\nDiagnostic global: ${summary.allOk ? '✅ TOUT OK' : '❌ DES ERREURS DÉTECTÉES'}`)
  console.log(`${'='.repeat(60)}\n`)

  const response: DiagnosticResponse = {
    siren: sirenClean,
    timestamp: new Date().toISOString(),
    results: {
      connection,
      company,
      attachments,
    },
    summary,
  }

  return NextResponse.json(response)
}
