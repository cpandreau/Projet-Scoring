import { jsPDF } from 'jspdf'
import type { AnnuaireEntreprise } from '@/lib/api/annuaire-entreprises'
import type { NewsArticle, SectorNewsMethodology } from '@/lib/api/google-news'
import type { PlaceReputation } from '@/lib/api/google-places'
import type { SectorTrendsResult } from '@/lib/api/google-trends'

/**
 * Supprime les accents d'une chaîne pour compatibilité PDF
 */
function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE')
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
}

/**
 * Tronque une chaîne à une longueur maximale
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.substring(0, maxLength - 3)}...`
}

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

export interface VeilleReportData {
  enterprise: {
    nom: string
    siren?: string | null
    nafCode?: string | null
  }
  companyName: string
  trends: SectorTrendsResult
  reputation: PlaceReputation
  annuaire: AnnuaireEntreprise | null
  companyNews: NewsArticle[]
  sectorNews: NewsArticle[]
  sectorMethodology: SectorNewsMethodology
  period: string
  generatedAt: string
}

export async function generateVeilleReport(data: VeilleReportData): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = 210
  const margin = 15
  let y = 20

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // ===== PAGE 1 - SYNTHESE VEILLE =====

  // Titre
  doc.setFontSize(22)
  doc.setTextColor(59, 130, 246) // Bleu
  doc.text('Rapport de Veille', pageWidth / 2, y, { align: 'center' })
  y += 15

  // Nom entreprise
  doc.setFontSize(18)
  doc.setTextColor(31, 41, 55)
  doc.text(removeAccents(data.enterprise.nom), pageWidth / 2, y, { align: 'center' })
  y += 12

  // SIREN et NAF
  doc.setFontSize(11)
  doc.setTextColor(107, 114, 128)
  const infoLine = [
    data.enterprise.siren ? `SIREN : ${data.enterprise.siren}` : null,
    data.enterprise.nafCode ? `NAF : ${data.enterprise.nafCode}` : null,
  ]
    .filter(Boolean)
    .join(' - ')
  if (infoLine) {
    doc.text(infoLine, pageWidth / 2, y, { align: 'center' })
    y += 7
  }

  // Date et période
  doc.text(`Rapport du ${dateStr} - Periode : ${data.period}`, pageWidth / 2, y, {
    align: 'center',
  })
  y += 25

  // ===== SECTION TENDANCES =====
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text('Tendances de recherche (Google Trends)', margin, y)
  y += 10

  if (data.trends.mainTrend) {
    const trend = data.trends.mainTrend
    const trendLabel =
      trend.trend === 'up' ? 'En hausse' : trend.trend === 'down' ? 'En baisse' : 'Stable'
    const trendColor =
      trend.trend === 'up' ? '#22c55e' : trend.trend === 'down' ? '#ef4444' : '#6b7280'

    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)
    doc.text(`Mot-cle : "${removeAccents(trend.keyword)}"`, margin, y)
    y += 6

    const [tr, tg, tb] = hexToRgb(trendColor)
    doc.setTextColor(tr, tg, tb)
    doc.text(
      `Tendance : ${trendLabel} (${trend.trendPercentage > 0 ? '+' : ''}${trend.trendPercentage}%)`,
      margin,
      y
    )
    y += 6

    doc.setTextColor(31, 41, 55)
    doc.text(`Interet moyen : ${trend.averageInterest}/100`, margin, y)
    y += 12
  } else {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Donnees de tendances non disponibles', margin, y)
    y += 12
  }

  // ===== SECTION REPUTATION =====
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text('Reputation en ligne (Google Places)', margin, y)
  y += 10

  if (data.reputation.found) {
    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)

    if (data.reputation.rating) {
      const ratingColor =
        data.reputation.rating >= 4
          ? '#22c55e'
          : data.reputation.rating >= 3
            ? '#f59e0b'
            : '#ef4444'
      const [rr, rg, rb] = hexToRgb(ratingColor)
      doc.setTextColor(rr, rg, rb)
      doc.text(`Note : ${data.reputation.rating.toFixed(1)}/5`, margin, y)
      y += 6
    }

    doc.setTextColor(31, 41, 55)
    if (data.reputation.userRatingsTotal) {
      doc.text(`Nombre d'avis : ${data.reputation.userRatingsTotal}`, margin, y)
      y += 6
    }

    if (data.reputation.priceLevel !== undefined) {
      const priceLevels = ['Gratuit', 'Bon marche', 'Modere', 'Cher', 'Tres cher']
      doc.text(`Niveau de prix : ${priceLevels[data.reputation.priceLevel] || 'N/A'}`, margin, y)
      y += 6
    }
    y += 6
  } else {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Etablissement non trouve sur Google', margin, y)
    y += 12
  }

  // ===== SECTION DONNEES OFFICIELLES =====
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text('Donnees officielles (Annuaire Entreprises)', margin, y)
  y += 10

  if (data.annuaire) {
    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)

    // Effectifs
    if (data.annuaire.tranche_effectif_salarie) {
      const effectifMap: Record<string, string> = {
        '00': '0 salarie',
        '01': '1 a 2 salaries',
        '02': '3 a 5 salaries',
        '03': '6 a 9 salaries',
        '11': '10 a 19 salaries',
        '12': '20 a 49 salaries',
        '21': '50 a 99 salaries',
        '22': '100 a 199 salaries',
        '31': '200 a 249 salaries',
        '32': '250 a 499 salaries',
        '41': '500 a 999 salaries',
        '42': '1000 a 1999 salaries',
        '51': '2000 a 4999 salaries',
        '52': '5000 a 9999 salaries',
        '53': '10000 salaries et plus',
      }
      doc.text(
        `Effectif : ${effectifMap[data.annuaire.tranche_effectif_salarie] || 'Non renseigne'}`,
        margin,
        y
      )
      y += 6
    }

    // Date création
    if (data.annuaire.date_creation) {
      const dateCreation = new Date(data.annuaire.date_creation).toLocaleDateString('fr-FR')
      doc.text(`Date de creation : ${dateCreation}`, margin, y)
      y += 6
    }

    // Catégorie
    if (data.annuaire.categorie_entreprise) {
      const catMap: Record<string, string> = {
        PME: 'PME',
        ETI: 'ETI',
        GE: 'Grande entreprise',
        TPE: 'Micro-entreprise',
      }
      doc.text(`Categorie : ${catMap[data.annuaire.categorie_entreprise] || 'N/A'}`, margin, y)
      y += 6
    }
    y += 6
  } else {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Donnees non disponibles', margin, y)
    y += 12
  }

  // Footer page 1
  doc.setFontSize(8)
  doc.setTextColor(107, 114, 128)
  doc.text(`Defaillantometre - Rapport genere le ${dateStr}`, pageWidth / 2, 285, {
    align: 'center',
  })

  // ===== PAGE 2 - ACTUALITES =====
  doc.addPage()
  y = 20

  // Actualités entreprise
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text(`Actualites de l'entreprise (${data.companyNews.length} articles)`, margin, y)
  y += 10

  if (data.companyNews.length > 0) {
    doc.setFontSize(9)
    for (const article of data.companyNews.slice(0, 8)) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setTextColor(31, 41, 55)
      doc.setFont('helvetica', 'bold')
      doc.text(removeAccents(truncate(article.title, 80)), margin, y, {
        maxWidth: pageWidth - 2 * margin,
      })
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const pubDate = article.pubDate ? new Date(article.pubDate).toLocaleDateString('fr-FR') : ''
      doc.text(`${article.source}${pubDate ? ` - ${pubDate}` : ''}`, margin, y)
      y += 8
    }
  } else {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Aucune actualite trouvee pour cette entreprise', margin, y)
    y += 10
  }

  y += 10

  // Actualités secteur
  doc.setFontSize(14)
  doc.setTextColor(59, 130, 246)
  doc.text(`Actualites du secteur : ${removeAccents(data.sectorMethodology.nafLabel)}`, margin, y)
  y += 10

  if (data.sectorNews.length > 0) {
    doc.setFontSize(9)
    for (const article of data.sectorNews.slice(0, 8)) {
      if (y > 250) {
        doc.addPage()
        y = 20
      }

      doc.setTextColor(31, 41, 55)
      doc.setFont('helvetica', 'bold')
      doc.text(removeAccents(truncate(article.title, 80)), margin, y, {
        maxWidth: pageWidth - 2 * margin,
      })
      y += 5

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(107, 114, 128)
      const pubDate = article.pubDate ? new Date(article.pubDate).toLocaleDateString('fr-FR') : ''
      doc.text(`${article.source}${pubDate ? ` - ${pubDate}` : ''}`, margin, y)
      y += 8
    }
  } else {
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text('Aucune actualite trouvee pour ce secteur', margin, y)
  }

  // Footer dernière page
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(107, 114, 128)
    doc.text(
      `Defaillantometre - Rapport genere le ${dateStr} - Page ${i}/${totalPages}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    )
  }

  return new Uint8Array(doc.output('arraybuffer'))
}
