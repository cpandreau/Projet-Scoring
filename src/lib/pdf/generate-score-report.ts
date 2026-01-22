import { jsPDF } from "jspdf";
import { getScoreColor, getVerdict } from "./score-report-template";

/**
 * Supprime les accents d'une chaîne pour compatibilité PDF
 */
function removeAccents(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "AE");
}

/**
 * Formate un nombre avec virgule décimale (format français)
 */
function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals).replace(".", ",");
}

/**
 * Convertit une couleur hex en RGB
 */
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

export interface ReportData {
  enterprise: {
    nom: string;
    siren?: string;
    secteur?: string;
    formeJuridique?: string;
  };
  anneeExercice: number;
  dateCalcul: string;
  score: {
    global: number;
    liquidite: number | null;
    rentabilite: number | null;
    solvabilite: number | null;
    activite: number | null;
    evolution: number | null;
  };
  ratios: Array<{
    famille: string;
    nom: string;
    valeur: number | null;
    unite: string;
    zone: "vert" | "jaune" | "rouge";
  }>;
}

export async function generateScoreReport(
  data: ReportData
): Promise<Uint8Array> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 15;
  let y = 20;

  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // ===== PAGE 1 - SYNTHESE =====

  // Titre
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Bleu
  doc.text("Rapport de Sante Financiere", pageWidth / 2, y, { align: "center" });
  y += 15;

  // Nom entreprise
  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55); // Noir
  doc.text(removeAccents(data.enterprise.nom), pageWidth / 2, y, { align: "center" });
  y += 12;

  // SIREN
  doc.setFontSize(11);
  doc.setTextColor(107, 114, 128); // Gris
  doc.text(`SIREN : ${data.enterprise.siren || "N/A"}`, pageWidth / 2, y, { align: "center" });
  y += 7;

  // Exercice
  doc.text(
    `Exercice ${data.anneeExercice} - Rapport du ${data.dateCalcul}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );
  y += 25;

  // Score Global
  doc.setFontSize(16);
  doc.setTextColor(31, 41, 55);
  doc.text("Score Global", pageWidth / 2, y, { align: "center" });
  y += 20;

  // Valeur du score
  const scoreColor = getScoreColor(data.score.global);
  const [r, g, b] = hexToRgb(scoreColor);

  doc.setFontSize(48);
  doc.setTextColor(r, g, b);
  doc.text(formatNumber(data.score.global, 1), pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text("/ 10", pageWidth / 2, y, { align: "center" });
  y += 18;

  // Verdict
  doc.setFontSize(16);
  doc.setTextColor(r, g, b);
  doc.text(removeAccents(getVerdict(data.score.global)), pageWidth / 2, y, { align: "center" });
  y += 30;

  // Tableau des familles
  doc.setFontSize(14);
  doc.setTextColor(31, 41, 55);
  doc.text("Detail par Famille", margin, y);
  y += 12;

  // En-tête du tableau
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Famille", margin, y);
  doc.text("Score", margin + 55, y);
  doc.text("Poids", margin + 90, y);
  doc.text("Zone", margin + 120, y);
  y += 3;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  const familles = [
    { nom: "Liquidite", score: data.score.liquidite, poids: "30%" },
    { nom: "Rentabilite", score: data.score.rentabilite, poids: "20%" },
    { nom: "Solvabilite", score: data.score.solvabilite, poids: "20%" },
    { nom: "Activite", score: data.score.activite, poids: "15%" },
    { nom: "Evolution", score: data.score.evolution, poids: "15%" },
  ];

  doc.setFontSize(10);
  for (const f of familles) {
    const scoreVal = f.score ?? 0;
    const zone = scoreVal >= 7 ? "Bon" : scoreVal >= 5 ? "Moyen" : "Risque";
    const zoneColor =
      scoreVal >= 7 ? "#22c55e" : scoreVal >= 5 ? "#f59e0b" : "#ef4444";

    doc.setTextColor(31, 41, 55);
    doc.text(f.nom, margin, y);
    doc.text(f.score !== null ? `${formatNumber(f.score, 1)}/10` : "N/A", margin + 55, y);
    doc.text(f.poids, margin + 90, y);

    const [zr, zg, zb] = hexToRgb(zoneColor);
    doc.setTextColor(zr, zg, zb);
    doc.text(zone, margin + 120, y);

    y += 8;
  }

  // Footer page 1
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Defaillantometre - Rapport genere le ${dateStr}`, pageWidth / 2, 285, {
    align: "center",
  });

  // ===== PAGE 2 - DETAIL DES RATIOS =====
  doc.addPage();
  y = 20;

  doc.setFontSize(18);
  doc.setTextColor(59, 130, 246);
  doc.text("Detail des Ratios Financiers", margin, y);
  y += 15;

  // Grouper par famille
  const byFamille: Record<string, typeof data.ratios> = {};
  for (const ratio of data.ratios) {
    const familleClean = removeAccents(ratio.famille);
    if (!byFamille[familleClean]) byFamille[familleClean] = [];
    byFamille[familleClean].push(ratio);
  }

  doc.setFontSize(9);
  for (const [famille, ratios] of Object.entries(byFamille)) {
    // Vérifier si on a besoin d'une nouvelle page
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Titre famille
    doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text(`>> ${famille.toUpperCase()}`, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    for (const ratio of ratios) {
      // Nouvelle page si nécessaire
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      const nom = removeAccents(
        ratio.nom.length > 35 ? ratio.nom.substring(0, 32) + "..." : ratio.nom
      );
      const valeur =
        ratio.valeur !== null
          ? `${formatNumber(ratio.valeur)} ${ratio.unite}`
          : "N/A";
      const zone =
        ratio.zone === "vert" ? "Bon" : ratio.zone === "jaune" ? "Moyen" : "Risque";
      const zoneColor =
        ratio.zone === "vert"
          ? "#22c55e"
          : ratio.zone === "jaune"
            ? "#f59e0b"
            : "#ef4444";

      doc.setTextColor(31, 41, 55);
      doc.text(nom, margin, y);
      doc.text(valeur, margin + 100, y);

      const [zr, zg, zb] = hexToRgb(zoneColor);
      doc.setTextColor(zr, zg, zb);
      doc.text(`[${zone}]`, margin + 145, y);

      y += 5;
    }
    y += 5;
  }

  // Footer page 2
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Defaillantometre - Rapport genere le ${dateStr} - Page ${doc.getNumberOfPages()}`,
    pageWidth / 2,
    285,
    { align: "center" }
  );

  return new Uint8Array(doc.output("arraybuffer"));
}
