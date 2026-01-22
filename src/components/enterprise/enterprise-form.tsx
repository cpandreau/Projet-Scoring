"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSireneSearch, useCreateEnterprise, useFormAutoFill } from "@/hooks";
import type { SireneResult } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function EnterpriseForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { searching, results, error: searchError, search, clearResults } = useSireneSearch();
  const { loading, error: createError, create } = useCreateEnterprise();
  const { fillFromSirene } = useFormAutoFill(formRef);

  const handleSearch = async () => {
    await search(searchQuery);
  };

  const handleSelectResult = (result: SireneResult) => {
    fillFromSirene(result);
    clearResults();
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const data = {
      siren: formData.get("siren") as string,
      siret: (formData.get("siret") as string) || undefined,
      raison_sociale: formData.get("raison_sociale") as string,
      forme_juridique: (formData.get("forme_juridique") as string) || undefined,
      code_naf: (formData.get("code_naf") as string) || undefined,
      adresse: (formData.get("adresse") as string) || undefined,
    };

    await create(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau dossier</CardTitle>
        <CardDescription>
          Créez un nouveau dossier d&apos;entreprise pour analyse
        </CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
            <Label htmlFor="search">Rechercher une entreprise (SIREN, SIRET ou nom)</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Entrez un SIREN, SIRET ou nom d'entreprise..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                variant="secondary"
              >
                {searching ? "Recherche..." : "Rechercher"}
              </Button>
            </div>

            {searchError && (
              <p className="text-sm text-red-500">{searchError}</p>
            )}

            {results.length > 0 && (
              <ul className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {results.map((result) => (
                  <li key={result.siret}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="w-full p-3 text-left hover:bg-muted transition-colors"
                    >
                      <p className="font-medium">{result.raison_sociale}</p>
                      <p className="text-sm text-muted-foreground">
                        SIREN: {result.siren} | SIRET: {result.siret}
                      </p>
                      <p className="text-xs text-muted-foreground">{result.adresse}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Form Fields */}
          {createError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siren">SIREN *</Label>
              <Input
                id="siren"
                name="siren"
                placeholder="123456789"
                pattern="\d{9}"
                maxLength={9}
                required
              />
              <p className="text-xs text-muted-foreground">9 chiffres</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                name="siret"
                placeholder="12345678900001"
                pattern="\d{14}"
                maxLength={14}
              />
              <p className="text-xs text-muted-foreground">
                14 chiffres (optionnel)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raison_sociale">Raison sociale *</Label>
            <Input
              id="raison_sociale"
              name="raison_sociale"
              placeholder="Nom de l'entreprise"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forme_juridique">Forme juridique</Label>
              <Input
                id="forme_juridique"
                name="forme_juridique"
                placeholder="SAS, SARL, SA..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code_naf">Code NAF</Label>
              <Input
                id="code_naf"
                name="code_naf"
                placeholder="62.01Z"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              placeholder="10 rue de l'exemple, 75001 Paris"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Création..." : "Créer le dossier"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Annuler
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
