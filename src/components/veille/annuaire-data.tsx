'use client'

import {
  AlertCircle,
  Award,
  Building,
  ExternalLink,
  FileText,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  type AnnuaireEntreprise,
  formatCategorieEntreprise,
  formatEtatAdministratif,
  formatTrancheEffectif,
  getConventionCollectiveTitle,
  getLatestFinances,
} from '@/lib/api/annuaire-entreprises'

interface AnnuaireDataProps {
  data: AnnuaireEntreprise | null
  siren?: string
}

export function AnnuaireData({ data, siren }: AnnuaireDataProps) {
  const annuaireUrl = siren ? `https://annuaire-entreprises.data.gouv.fr/entreprise/${siren}` : null

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Données officielles</CardTitle>
            </div>
            {annuaireUrl && (
              <a
                href={annuaireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <CardDescription>Source : annuaire-entreprises.data.gouv.fr</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Données non disponibles</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const etat = formatEtatAdministratif(data.etat_administratif)
  const effectif = formatTrancheEffectif(data.tranche_effectif_salarie)
  const idccList = data.complements?.liste_idcc || data.siege?.liste_idcc || []
  const latestFinances = getLatestFinances(data.finances)

  const hasCertifications =
    data.complements?.est_bio ||
    data.complements?.est_rge ||
    data.complements?.est_qualiopi ||
    data.complements?.est_ess ||
    data.complements?.est_societe_mission

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Données officielles</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={etat.variant}>{etat.label}</Badge>
            {annuaireUrl && (
              <a
                href={annuaireUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <CardDescription>Source : annuaire-entreprises.data.gouv.fr</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Effectifs */}
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <Users className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Effectifs</p>
            <p className="text-sm text-muted-foreground">{effectif}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {data.annee_tranche_effectif_salarie && (
                <span className="text-xs text-muted-foreground">
                  Année : {data.annee_tranche_effectif_salarie}
                </span>
              )}
              {data.categorie_entreprise && (
                <Badge variant="outline" className="text-xs">
                  {formatCategorieEntreprise(data.categorie_entreprise)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Finances */}
        {latestFinances && (latestFinances.ca || latestFinances.resultat_net) && (
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <TrendingUp className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Données financières {latestFinances.annee}</p>
              <div className="mt-1 grid gap-1">
                {latestFinances.ca && (
                  <p className="text-sm text-muted-foreground">
                    CA :{' '}
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                    }).format(latestFinances.ca)}
                  </p>
                )}
                {latestFinances.resultat_net && (
                  <p className="text-sm text-muted-foreground">
                    Résultat net :{' '}
                    <span
                      className={
                        latestFinances.resultat_net >= 0 ? 'text-green-600' : 'text-red-600'
                      }
                    >
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0,
                      }).format(latestFinances.resultat_net)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Convention collective */}
        {idccList.length > 0 && (
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Convention collective</p>
              {idccList.map((idcc, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  IDCC {idcc} — {getConventionCollectiveTitle(idcc)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {hasCertifications && (
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Award className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Labels & Certifications</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {data.complements.est_bio && (
                  <Badge variant="outline" className="text-xs">
                    Bio
                  </Badge>
                )}
                {data.complements.est_rge && (
                  <Badge variant="outline" className="text-xs">
                    RGE
                  </Badge>
                )}
                {data.complements.est_qualiopi && (
                  <Badge variant="outline" className="text-xs">
                    Qualiopi
                  </Badge>
                )}
                {data.complements.est_ess && (
                  <Badge variant="outline" className="text-xs">
                    ESS
                  </Badge>
                )}
                {data.complements.est_societe_mission && (
                  <Badge variant="outline" className="text-xs">
                    Société à mission
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Date création */}
        <div className="border-t pt-2 text-xs text-muted-foreground">
          Créée le {new Date(data.date_creation).toLocaleDateString('fr-FR')}
          {data.date_mise_a_jour && (
            <> • Mise à jour : {new Date(data.date_mise_a_jour).toLocaleDateString('fr-FR')}</>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
