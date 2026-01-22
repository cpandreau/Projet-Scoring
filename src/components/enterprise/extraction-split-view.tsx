"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ExtractionEdit } from "./extraction-edit";
import type { ExtractionData } from "@/schemas/extraction.schema";
import type { TypeLiasse } from "@/types/document";
import { getLiasseTypeLabel } from "@/config/fields-by-liasse.config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, Minimize2, FileText, Database } from "lucide-react";

// Chargement dynamique du PdfViewer sans SSR (utilise des APIs DOM)
const PdfViewer = dynamic(() => import("./pdf-viewer").then((mod) => mod.PdfViewer), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
});

interface ExtractionSplitViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  documentUrl: string | null;
  loadingUrl?: boolean;
  extractionId: string;
  enterpriseId: string;
  data: ExtractionData;
  isValidated: boolean;
  typeLiasse?: TypeLiasse | null;
  onSaved?: () => void;
  onValidated?: () => void;
}

// Composant PDF Panel réutilisable
function PdfPanel({
  loadingUrl,
  documentUrl,
}: {
  loadingUrl: boolean;
  documentUrl: string | null;
}) {
  if (loadingUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (documentUrl) {
    return <PdfViewer url={documentUrl} className="h-full" />;
  }

  return (
    <div className="flex items-center justify-center h-full text-muted-foreground">
      Impossible de charger le document
    </div>
  );
}

// Composant interne pour éviter le reset de state à chaque render
function ExtractionSplitViewContent({
  onOpenChange,
  documentName,
  documentUrl,
  loadingUrl = false,
  extractionId,
  enterpriseId,
  data,
  isValidated,
  typeLiasse,
  onSaved,
  onValidated,
}: Omit<ExtractionSplitViewProps, "open">) {
  // État local pour affichage immédiat du badge après validation
  const [hasBeenValidated, setHasBeenValidated] = useState(false);
  const [mobileTab, setMobileTab] = useState<"pdf" | "data">("data");
  const showValidated = isValidated || hasBeenValidated;

  // Synchroniser l'état local avec les props serveur
  useEffect(() => {
    if (isValidated) {
      setHasBeenValidated(true);
    }
  }, [isValidated]);

  const handleSaved = () => {
    onSaved?.();
  };

  const handleValidated = () => {
    setHasBeenValidated(true);
    onValidated?.();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h2 className="text-sm sm:text-base font-medium truncate max-w-[180px] sm:max-w-[400px]">
            {documentName}
          </h2>
          {typeLiasse && (
            <Badge variant="outline" className="text-xs shrink-0">
              {getLiasseTypeLabel(typeLiasse)}
            </Badge>
          )}
          {showValidated && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-xs shrink-0">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Validé
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-8 w-8 shrink-0"
          title="Fermer"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Tabs view */}
      <div className="flex-1 min-h-0 md:hidden">
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "pdf" | "data")} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-2 mx-3 mt-2 shrink-0">
            <TabsTrigger value="pdf" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="h-3.5 w-3.5 mr-1.5" />
              Données
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pdf" className="flex-1 mt-2 min-h-0 data-[state=inactive]:hidden">
            <div className="h-full bg-muted/20">
              <PdfPanel loadingUrl={loadingUrl} documentUrl={documentUrl} />
            </div>
          </TabsContent>

          <TabsContent value="data" className="flex-1 mt-2 min-h-0 overflow-y-auto data-[state=inactive]:hidden">
            <div className="p-3">
              <ExtractionEdit
                extractionId={extractionId}
                enterpriseId={enterpriseId}
                data={data}
                isValidated={showValidated}
                typeLiasse={typeLiasse}
                onCancel={handleClose}
                onSaved={handleSaved}
                onValidated={handleValidated}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop: Split view */}
      <div className="hidden md:flex flex-row flex-1 min-h-0">
        {/* PDF Panel - Left */}
        <div className="flex-1 border-r overflow-hidden bg-muted/20 min-h-0">
          <PdfPanel loadingUrl={loadingUrl} documentUrl={documentUrl} />
        </div>

        {/* Extraction Panel - Right */}
        <div className="w-[500px] xl:w-[550px] flex flex-col min-h-0 shrink-0">
          <div className="px-4 py-3 border-b bg-background shrink-0">
            <h3 className="font-medium">Données extraites</h3>
            <p className="text-xs text-muted-foreground">
              Vérifiez et validez les données extraites du document
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <ExtractionEdit
              extractionId={extractionId}
              enterpriseId={enterpriseId}
              data={data}
              isValidated={showValidated}
              typeLiasse={typeLiasse}
              onCancel={handleClose}
              onSaved={handleSaved}
              onValidated={handleValidated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtractionSplitView({
  open,
  extractionId,
  isValidated,
  ...props
}: ExtractionSplitViewProps) {
  if (!open) return null;

  // Utilise key pour reset le state local quand l'extraction ou le statut de validation change
  return (
    <ExtractionSplitViewContent
      key={`${extractionId}-${isValidated}`}
      extractionId={extractionId}
      isValidated={isValidated}
      {...props}
    />
  );
}
