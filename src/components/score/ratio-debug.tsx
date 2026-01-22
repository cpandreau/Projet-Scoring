"use client";

import { useMemo, useState } from "react";
import type { ExtractionValues } from "@/schemas/extraction.schema";
import {
  calculateRatiosWithDetails,
  type CalculationDetails,
  type AggregateDetail,
  type RatioDetail,
} from "@/lib/ratios/calculate-with-details";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Bug, ChevronDown, ChevronRight, Calculator, Database, Percent, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatioDebugProps {
  donnees: ExtractionValues;
}

// Composant pour afficher une valeur formatée
function FormattedValue({ value, unite }: { value: number | null; unite?: string }) {
  if (value === null) {
    return <span className="text-muted-foreground italic">null</span>;
  }

  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <span className="font-mono font-semibold">
      {formatted}
      {unite && <span className="text-muted-foreground ml-1">{unite}</span>}
    </span>
  );
}

// Composant pour afficher un agrégat
function AggregateCard({ name, detail }: { name: string; detail: AggregateDetail }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{name}</span>
          </div>
          <FormattedValue value={detail.valeur} unite="€" />
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 ml-6 p-3 border rounded-lg space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Formule : </span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {detail.formule}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground">Variables :</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {Object.entries(detail.variables).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  <FormattedValue value={val} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">Calcul : </span>
            <div className="font-mono text-xs bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200 px-2 py-1 rounded mt-1">
              {detail.calcul}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Composant pour afficher un ratio
function RatioCard({ name, detail }: { name: string; detail: RatioDetail }) {
  const [isOpen, setIsOpen] = useState(false);

  const uniteIcon = {
    "%": <Percent className="h-3 w-3" />,
    jours: <Clock className="h-3 w-3" />,
    ratio: <Hash className="h-3 w-3" />,
    "€": <span className="text-xs">€</span>,
  }[detail.unite];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">{name}</span>
          </div>
          <div className="flex items-center gap-1">
            {uniteIcon}
            <FormattedValue value={detail.valeur} />
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 ml-6 p-3 bg-muted/30 rounded-lg space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Formule : </span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {detail.formule}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground">Variables :</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {Object.entries(detail.variables).map(([key, val]) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{key}</span>
                  <FormattedValue value={val} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground">Calcul : </span>
            <div
              className={cn(
                "font-mono text-xs px-2 py-1 rounded mt-1",
                detail.valeur !== null
                  ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200"
              )}
            >
              {detail.calcul}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Composant pour une section de ratios
function RatioSection({
  title,
  ratios,
}: {
  title: string;
  ratios: Record<string, RatioDetail>;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const ratioCount = Object.keys(ratios).length;
  const calculatedCount = Object.values(ratios).filter((r) => r.valeur !== null).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-2 bg-primary/10 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-semibold">{title}</span>
          </div>
          <Badge variant="outline">
            {calculatedCount}/{ratioCount}
          </Badge>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2">
          {Object.entries(ratios).map(([name, detail]) => (
            <RatioCard key={name} name={name} detail={detail} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Labels pour les agrégats
const AGGREGATE_LABELS: Record<string, string> = {
  passif_circulant: "Passif circulant",
  capitaux_permanents: "Capitaux permanents",
  frng: "FRNG (Fonds de Roulement Net Global)",
  bfr: "BFR (Besoin en Fonds de Roulement)",
  va: "VA (Valeur Ajoutée)",
  ebe: "EBE (Excédent Brut d'Exploitation)",
  caf: "CAF (Capacité d'Autofinancement)",
  marge_commerciale: "Marge commerciale",
  total_passif: "Total passif",
  marge_brute: "Marge brute",
};

// Labels pour les familles
const FAMILY_LABELS: Record<string, string> = {
  liquidite: "Liquidité",
  rentabilite: "Rentabilité",
  solvabilite: "Solvabilité",
  activite: "Activité",
};

export function RatioDebug({ donnees }: RatioDebugProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Ne pas afficher en production
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const details = useMemo(() => calculateRatiosWithDetails(donnees), [donnees]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bug className="h-4 w-4" />
          Debug calculs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Détails des calculs de ratios
          </DialogTitle>
          <DialogDescription>
            Visualisation détaillée de chaque étape du calcul des ratios financiers
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Section des données d'entrée */}
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-800 dark:text-blue-200">
                      Données d'entrée (Extraction)
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {Object.values(details.donnees).filter((v) => v !== null).length}/
                    {Object.keys(details.donnees).length} champs
                  </Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 border rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {Object.entries(details.donnees).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-2 p-1 bg-muted/30 rounded">
                        <span className="text-muted-foreground truncate">{key}</span>
                        <FormattedValue value={value} />
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Section des agrégats */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-500" />
                Agrégats intermédiaires
              </h3>
              <div className="space-y-2">
                {Object.entries(details.aggregats).map(([key, detail]) => (
                  <AggregateCard
                    key={key}
                    name={AGGREGATE_LABELS[key] || key}
                    detail={detail}
                  />
                ))}
              </div>
            </div>

            {/* Section des ratios par famille */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-500" />
                Ratios par famille
              </h3>
              <div className="space-y-4">
                {Object.entries(details.ratios).map(([family, ratios]) => (
                  <RatioSection
                    key={family}
                    title={FAMILY_LABELS[family] || family}
                    ratios={ratios}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
