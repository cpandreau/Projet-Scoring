"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useUpdateDocument,
  useDeleteDocument,
  useExtraction,
  useDocumentUrl,
  getDocumentStatus,
  getDocumentsSummary,
} from "@/hooks";
import type { Document, DocumentType, TypeLiasse } from "@/types";
import type { ExtractionData } from "@/schemas/extraction.schema";
import { AVAILABLE_YEARS, DOCUMENT_TYPES, TYPE_LIASSE_OPTIONS } from "@/types/document";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FileText,
  Loader2,
  Trash2,
  Check,
  Sparkles,
  Eye,
  RefreshCw,
  FileCheck,
  Clock,
  FileX,
  MoreVertical,
  PlayCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { showSuccess, showWarning, showInfo } from "@/lib/toast";
import { ExtractionPreview } from "./extraction-preview";
import { ExtractionSplitView } from "./extraction-split-view";
import { cn } from "@/lib/utils";

interface ExtractedData {
  id: string;
  donnees: ExtractionData;
  is_validated: boolean;
}

interface DocumentListProps {
  enterpriseId: string;
  documents: Document[];
  extractions?: Map<string, ExtractedData>;
}

// Type pour le document sélectionné dans la split-view
interface SelectedDocument {
  id: string;
  name: string;
  extractionId: string;
  data: ExtractionData;
  isValidated: boolean;
  typeLiasse: TypeLiasse | null;
}

// Badge de statut
function StatusBadge({ status, label, color }: { status: string; label: string; color: "gray" | "orange" | "green" }) {
  const colorClasses = {
    gray: "bg-muted text-muted-foreground",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    green: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  };

  const icons = {
    valide: <FileCheck className="h-3 w-3" />,
    extrait: <Clock className="h-3 w-3" />,
    en_attente: <Sparkles className="h-3 w-3" />,
    non_applicable: <FileX className="h-3 w-3" />,
  };

  return (
    <Badge variant="secondary" className={cn("text-xs font-medium gap-1", colorClasses[color])}>
      {icons[status as keyof typeof icons]}
      {label}
    </Badge>
  );
}

// Résumé des documents
function DocumentsSummary({
  total,
  valides,
  extraits,
  enAttente,
}: {
  total: number;
  valides: number;
  extraits: number;
  enAttente: number;
}) {
  const parts: string[] = [];
  if (valides > 0) parts.push(`${valides} validé${valides > 1 ? "s" : ""}`);
  if (extraits > 0) parts.push(`${extraits} extrait${extraits > 1 ? "s" : ""}`);
  if (enAttente > 0) parts.push(`${enAttente} à extraire`);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{total} document{total > 1 ? "s" : ""}</span>
      {parts.length > 0 && (
        <>
          <span>·</span>
          <span>{parts.join(" · ")}</span>
        </>
      )}
    </div>
  );
}

export function DocumentList({ enterpriseId, documents, extractions = new Map() }: DocumentListProps) {
  const router = useRouter();
  const { updating, error: updateError, updateYear, updateType, updateTypeLiasse } = useUpdateDocument(enterpriseId);
  const { deleting, error: deleteError, remove } = useDeleteDocument(enterpriseId);
  const { extracting, error: extractError, extract } = useExtraction();
  const { loading: loadingUrl, url: documentUrl, fetchUrl, clearUrl } = useDocumentUrl();

  const [extractingDocId, setExtractingDocId] = useState<string | null>(null);
  const [splitViewOpen, setSplitViewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<SelectedDocument | null>(null);

  // État pour l'extraction en série
  const [isExtractingAll, setIsExtractingAll] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState({ current: 0, total: 0 });

  const error = updateError || deleteError || extractError;

  // Calcul du résumé - utilise uniquement les données serveur
  const summary = getDocumentsSummary(documents, extractions);

  // Filtrer les documents éligibles à l'extraction
  const getExtractableDocuments = () => {
    return documents.filter(doc =>
      doc.type === "liasse_fiscale" &&
      doc.type_liasse && // Type de liasse défini
      !extractions.get(doc.id) // Pas encore extrait
    );
  };

  const extractableCount = getExtractableDocuments().length;

  // Fonction d'extraction en série
  const handleExtractAll = async () => {
    const docsToExtract = getExtractableDocuments();
    if (docsToExtract.length === 0) {
      showInfo("Aucun document à extraire");
      return;
    }

    setIsExtractingAll(true);
    setExtractionProgress({ current: 0, total: docsToExtract.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < docsToExtract.length; i++) {
      const doc = docsToExtract[i];
      setExtractionProgress({ current: i + 1, total: docsToExtract.length });
      setExtractingDocId(doc.id);

      try {
        const result = await extract(doc.id);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
          console.error(`Erreur extraction ${doc.nom_fichier}:`, result.error);
        }
      } catch (error) {
        errorCount++;
        console.error(`Erreur extraction ${doc.nom_fichier}:`, error);
      }

      // Petit délai entre chaque extraction pour éviter de surcharger l'API
      if (i < docsToExtract.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setIsExtractingAll(false);
    setExtractingDocId(null);
    setExtractionProgress({ current: 0, total: 0 });

    // Rafraîchir les données
    await new Promise(resolve => setTimeout(resolve, 300));
    router.refresh();

    // Toast récapitulatif
    if (errorCount === 0) {
      showSuccess(`${successCount} document${successCount > 1 ? "s" : ""} extrait${successCount > 1 ? "s" : ""} avec succès`);
    } else {
      showWarning(`${successCount} succès, ${errorCount} erreur${errorCount > 1 ? "s" : ""}`);
    }
  };

  // Fonctions d'accès aux données - source unique : props serveur
  const getDocumentExtraction = (documentId: string) => {
    return extractions.get(documentId) || null;
  };

  const getExtractionData = (documentId: string): ExtractionData | null => {
    return getDocumentExtraction(documentId)?.donnees ?? null;
  };

  const getExtractionId = (documentId: string): string | undefined => {
    return getDocumentExtraction(documentId)?.id;
  };

  const isExtractionValidated = (documentId: string): boolean => {
    return getDocumentExtraction(documentId)?.is_validated ?? false;
  };

  const handleExtract = async (documentId: string) => {
    setExtractingDocId(documentId);
    const result = await extract(documentId);
    if (result.success) {
      // Attendre que revalidatePath soit effectif avant de rafraîchir
      await new Promise(resolve => setTimeout(resolve, 300));
      router.refresh();
    }
    setExtractingDocId(null);
  };

  const handleDataUpdated = () => {
    router.refresh();
  };

  const openSplitView = async (doc: Document) => {
    const extractionId = getExtractionId(doc.id);
    const data = getExtractionData(doc.id);
    const validated = isExtractionValidated(doc.id);

    if (!extractionId || !data) return;

    setSelectedDoc({
      id: doc.id,
      name: doc.nom_fichier,
      extractionId,
      data,
      isValidated: validated,
      typeLiasse: doc.type_liasse,
    });
    setSplitViewOpen(true);

    // Charger l'URL du document
    await fetchUrl(doc.id);
  };

  const closeSplitView = () => {
    setSplitViewOpen(false);
    setSelectedDoc(null);
    clearUrl();
  };

  const handleSplitViewSaved = () => {
    router.refresh();
  };

  const handleSplitViewValidated = () => {
    router.refresh();
    // Mettre à jour le statut local
    if (selectedDoc) {
      setSelectedDoc({ ...selectedDoc, isValidated: true });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Documents
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              Configurez le type et l&apos;année de chaque document
            </CardDescription>
          </div>

          {/* Bouton Extraire tout */}
          {extractableCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExtractAll}
              disabled={isExtractingAll || extractingDocId !== null}
              className="hidden sm:flex"
            >
              {isExtractingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {extractionProgress.current}/{extractionProgress.total}
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Extraire tout ({extractableCount})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Barre de progression extraction en série */}
        {isExtractingAll && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Extraction en cours...
              </span>
              <span className="text-sm text-muted-foreground">
                {extractionProgress.current} / {extractionProgress.total}
              </span>
            </div>
            <Progress
              value={(extractionProgress.current / extractionProgress.total) * 100}
              className="h-2"
            />
          </div>
        )}

        {/* Résumé */}
        <div className="pt-2">
          <DocumentsSummary
            total={summary.total}
            valides={summary.valides}
            extraits={summary.extraits}
            enAttente={summary.enAttente}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
            {error}
          </div>
        )}

        <ul className="space-y-2 sm:space-y-3">
          {documents.map((doc) => {
            const extraction = extractions.get(doc.id);
            const statusInfo = getDocumentStatus(doc, extraction);
            const extractionData = getExtractionData(doc.id);
            const isExtracting = extractingDocId === doc.id && extracting;

            return (
              <li
                key={doc.id}
                className="border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="shrink-0 p-1.5 sm:p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <p className="text-sm sm:text-base font-medium truncate max-w-[150px] sm:max-w-none" title={doc.nom_fichier}>
                        {doc.nom_fichier}
                      </p>
                      <StatusBadge
                        status={statusInfo.status}
                        label={statusInfo.label}
                        color={statusInfo.color}
                      />
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">
                      Uploadé le {formatDate(doc.created_at)}
                    </p>
                  </div>
                  {/* Actions desktop */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    {statusInfo.canExtract && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtract(doc.id)}
                        disabled={isExtracting || (doc.type === "liasse_fiscale" && !doc.type_liasse)}
                        className="text-xs"
                        title={doc.type === "liasse_fiscale" && !doc.type_liasse ? "Choisir le type de liasse d'abord" : undefined}
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Extraction...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Extraire
                          </>
                        )}
                      </Button>
                    )}
                    {statusInfo.canView && getExtractionId(doc.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSplitView(doc)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    )}
                    {statusInfo.canReextract && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExtract(doc.id)}
                        disabled={isExtracting}
                        className="text-xs text-muted-foreground"
                        title="Relancer l'extraction"
                      >
                        {isExtracting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(doc.id, doc.nom_fichier)}
                      disabled={deleting === doc.id}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Actions mobile - dropdown menu */}
                  <div className="sm:hidden shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {isExtracting || deleting === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statusInfo.canExtract && (
                          <DropdownMenuItem
                            onClick={() => handleExtract(doc.id)}
                            disabled={isExtracting || (doc.type === "liasse_fiscale" && !doc.type_liasse)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {doc.type === "liasse_fiscale" && !doc.type_liasse ? "Choisir le type de liasse" : "Extraire"}
                          </DropdownMenuItem>
                        )}
                        {statusInfo.canView && getExtractionId(doc.id) && (
                          <DropdownMenuItem onClick={() => openSplitView(doc)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les données
                          </DropdownMenuItem>
                        )}
                        {statusInfo.canReextract && (
                          <DropdownMenuItem
                            onClick={() => handleExtract(doc.id)}
                            disabled={isExtracting}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Relancer l&apos;extraction
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => remove(doc.id, doc.nom_fichier)}
                          disabled={deleting === doc.id}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Type de document</Label>
                    <Select
                      value={doc.type}
                      onValueChange={(value) => updateType(doc.id, value as DocumentType)}
                      disabled={updating === doc.id}
                    >
                      <SelectTrigger className="h-9">
                        {updating === doc.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Année d&apos;exercice</Label>
                    <Select
                      value={doc.annee_exercice?.toString() ?? "none"}
                      onValueChange={(value) => updateYear(doc.id, value)}
                      disabled={updating === doc.id}
                    >
                      <SelectTrigger className="h-9">
                        {updating === doc.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <SelectValue placeholder="Non définie" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Non définie</SelectItem>
                        {AVAILABLE_YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type de liasse fiscale - affiché uniquement pour les liasses fiscales */}
                  {doc.type === "liasse_fiscale" && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Type de liasse</Label>
                      <Select
                        value={doc.type_liasse ?? ""}
                        onValueChange={(value) => updateTypeLiasse(doc.id, value as TypeLiasse)}
                        disabled={updating === doc.id || !!extraction}
                      >
                        <SelectTrigger className={cn("h-9", !doc.type_liasse && "border-orange-300 dark:border-orange-700")}>
                          {updating === doc.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <SelectValue placeholder="Choisir..." />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {TYPE_LIASSE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!doc.type_liasse && !extraction && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">
                          Requis pour l&apos;extraction
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {doc.type !== "autre" && doc.type !== "non_classe" && doc.annee_exercice && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    <span>Document configuré</span>
                  </div>
                )}

                {/* Aperçu des données extraites */}
                {extractionData && (
                  <div className="pt-2 border-t">
                    <ExtractionPreview
                      extractionId={getExtractionId(doc.id)}
                      enterpriseId={enterpriseId}
                      documentId={doc.id}
                      data={extractionData}
                      isValidated={isExtractionValidated(doc.id)}
                      onDataUpdated={handleDataUpdated}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>

      {/* Split View Dialog */}
      {selectedDoc && (
        <ExtractionSplitView
          open={splitViewOpen}
          onOpenChange={(open) => {
            if (!open) closeSplitView();
          }}
          documentName={selectedDoc.name}
          documentUrl={documentUrl}
          loadingUrl={loadingUrl}
          extractionId={selectedDoc.extractionId}
          enterpriseId={enterpriseId}
          data={selectedDoc.data}
          isValidated={selectedDoc.isValidated}
          typeLiasse={selectedDoc.typeLiasse}
          onSaved={handleSplitViewSaved}
          onValidated={handleSplitViewValidated}
        />
      )}
    </Card>
  );
}
