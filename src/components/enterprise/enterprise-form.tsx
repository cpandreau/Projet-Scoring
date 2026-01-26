'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'

import { type ActionState, createEnterpriseAction } from '@/actions/enterprise.actions'
import { searchSirene } from '@/actions/sirene.actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/submit-button'
import type { SireneResult } from '@/types'

export function EnterpriseForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SireneResult[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)

  // useActionState pour la soumission du formulaire (React 19)
  const [state, formAction] = useActionState<ActionState<{ id: string }>, FormData>(
    createEnterpriseAction,
    null
  )

  // Redirection apres succes (si createEnterprise ne fait pas de redirect)
  useEffect(() => {
    if (state?.success && state.data?.id) {
      router.push(`/enterprise/${state.data.id}/informations`)
    }
  }, [state, router])

  const handleSearch = async () => {
    if (searchQuery.trim().length < 3) {
      setSearchError('La recherche doit contenir au moins 3 caracteres')
      return
    }

    setSearching(true)
    setSearchError(null)
    setResults([])

    const result = await searchSirene(searchQuery)

    if (result.error) {
      setSearchError(result.error)
      setSearching(false)
      return
    }

    if (result.results && result.results.length === 0) {
      setSearchError('Aucun resultat trouve')
      setSearching(false)
      return
    }

    if (result.results) {
      setResults(result.results)
    }

    setSearching(false)
  }

  const handleSelectResult = (result: SireneResult) => {
    if (!formRef.current) return

    const form = formRef.current
    const setValue = (name: string, value: string) => {
      const element = form.elements.namedItem(name) as HTMLInputElement | null
      if (element) {
        element.value = value
      }
    }

    setValue('siren', result.siren)
    setValue('siret', result.siret)
    setValue('raison_sociale', result.raison_sociale)
    setValue('forme_juridique', result.forme_juridique)
    setValue('code_naf', result.code_naf)
    setValue('adresse', result.adresse)

    setResults([])
    setSearchQuery('')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouveau dossier</CardTitle>
        <CardDescription>Creez un nouveau dossier d&apos;entreprise pour analyse</CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <Label htmlFor="search">Rechercher une entreprise (SIREN, SIRET ou nom)</Label>
            <div className="flex gap-2">
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Entrez un SIREN, SIRET ou nom d'entreprise..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button type="button" onClick={handleSearch} disabled={searching} variant="secondary">
                {searching ? 'Recherche...' : 'Rechercher'}
              </Button>
            </div>

            {searchError && <p className="text-red-500 text-sm">{searchError}</p>}

            {results.length > 0 && (
              <ul className="max-h-60 divide-y overflow-y-auto rounded-md border">
                {results.map((result) => (
                  <li key={result.siret}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(result)}
                      className="w-full p-3 text-left transition-colors hover:bg-muted"
                    >
                      <p className="font-medium">{result.raison_sociale}</p>
                      <p className="text-muted-foreground text-sm">
                        SIREN: {result.siren} | SIRET: {result.siret}
                      </p>
                      <p className="text-muted-foreground text-xs">{result.adresse}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Form Fields */}
          {state?.error && !state.fieldErrors && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
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
                aria-describedby={state?.fieldErrors?.siren ? 'siren-error' : undefined}
              />
              {state?.fieldErrors?.siren ? (
                <p id="siren-error" className="text-destructive text-xs">
                  {state.fieldErrors.siren[0]}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">9 chiffres</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                name="siret"
                placeholder="12345678900001"
                pattern="\d{14}"
                maxLength={14}
                aria-describedby={state?.fieldErrors?.siret ? 'siret-error' : undefined}
              />
              {state?.fieldErrors?.siret ? (
                <p id="siret-error" className="text-destructive text-xs">
                  {state.fieldErrors.siret[0]}
                </p>
              ) : (
                <p className="text-muted-foreground text-xs">14 chiffres (optionnel)</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="raison_sociale">Raison sociale *</Label>
            <Input
              id="raison_sociale"
              name="raison_sociale"
              placeholder="Nom de l'entreprise"
              required
              aria-describedby={state?.fieldErrors?.raison_sociale ? 'raison-error' : undefined}
            />
            {state?.fieldErrors?.raison_sociale && (
              <p id="raison-error" className="text-destructive text-xs">
                {state.fieldErrors.raison_sociale[0]}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="forme_juridique">Forme juridique</Label>
              <Input id="forme_juridique" name="forme_juridique" placeholder="SAS, SARL, SA..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code_naf">Code NAF</Label>
              <Input id="code_naf" name="code_naf" placeholder="62.01Z" maxLength={10} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input id="adresse" name="adresse" placeholder="10 rue de l'exemple, 75001 Paris" />
          </div>

          <div className="flex gap-4 pt-4">
            <SubmitButton pendingText="Creation en cours...">Creer le dossier</SubmitButton>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
