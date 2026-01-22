import { notFound } from "next/navigation";
import { getEnterpriseById } from "@/repositories/enterprise.repository";
import { getDocumentsByEnterprise } from "@/repositories/document.repository";
import { getExtractionsByEnterprise } from "@/repositories/extraction.repository";
import { getScoreHistory } from "@/repositories/score-history.repository";
import { calculateEnterpriseScore } from "@/actions/score.actions";
import { EnterpriseTabs } from "@/components/enterprise";

interface EnterprisePageProps {
  params: Promise<{ id: string }>;
}

export default async function EnterprisePage({ params }: EnterprisePageProps) {
  const { id } = await params;
  const [enterprise, documents, extractions, scoreResult, scoreHistory] = await Promise.all([
    getEnterpriseById(id),
    getDocumentsByEnterprise(id),
    getExtractionsByEnterprise(id),
    calculateEnterpriseScore(id),
    getScoreHistory(id),
  ]);

  if (!enterprise) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <EnterpriseTabs
        enterprise={enterprise}
        documents={documents}
        extractions={extractions}
        scoreResult={scoreResult}
        scoreHistory={scoreHistory}
      />
    </div>
  );
}
