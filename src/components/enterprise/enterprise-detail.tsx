'use client'

import {
  AlertCircle,
  Banknote,
  Briefcase,
  Building2,
  CheckCircle2,
  FileText,
  History,
  MapPin,
  Settings2,
  Users,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type {
  DossierActivite,
  DossierDirigeant,
  DossierHistorique,
  DossierObservation,
} from '@/repositories/inpi.repository'
import type { Enterprise } from '@/types'
import { CompanyNamesCard } from './company-names-card'
import { DataSourcesSection } from './data-sources-section'
import { DataRowWithSource } from './source-indicator'

interface EnterpriseDetailProps {
  enterprise: Enterprise
  dirigeants?: DossierDirigeant[]
  activites?: DossierActivite[]
  observations?: DossierObservation[]
  historique?: DossierHistorique[]
}

// Composant utilitaire pour afficher une ligne de données
function DataRow({
  label,
  value,
  className = '',
}: {
  label: string
  value: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="font-medium text-muted-foreground text-sm">{label}</dt>
      <dd className="mt-0.5 text-sm">{value || '—'}</dd>
    </div>
  )
}

// Composant utilitaire pour afficher un booléen avec icône
function BooleanValue({
  value,
  trueLabel = 'Oui',
  falseLabel = 'Non',
}: {
  value: boolean | null | undefined
  trueLabel?: string
  falseLabel?: string
}) {
  if (value === null || value === undefined) return <span>—</span>
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-600">
      <CheckCircle2 className="h-3.5 w-3.5" />
      {trueLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-500">
      <XCircle className="h-3.5 w-3.5" />
      {falseLabel}
    </span>
  )
}

// Composant de section
function Section({
  title,
  icon: Icon,
  children,
  badge,
}: {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  badge?: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
          </CardTitle>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Formater une date
function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return date
  }
}

// Formater un montant
function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined
): string {
  if (amount === null || amount === undefined) return '—'
  const devise = currency || 'EUR'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Construire l'adresse complète
function buildFullAddress(enterprise: Enterprise): string {
  const parts: string[] = []

  if (enterprise.num_voie) parts.push(enterprise.num_voie)
  if (enterprise.indice_repetition) parts.push(enterprise.indice_repetition)
  if (enterprise.type_voie) parts.push(enterprise.type_voie)
  if (enterprise.libelle_voie) parts.push(enterprise.libelle_voie)

  const street = parts.join(' ')

  const addressParts: string[] = []
  if (enterprise.complement_localisation) addressParts.push(enterprise.complement_localisation)
  if (street) addressParts.push(street)
  if (enterprise.distribution_speciale) addressParts.push(enterprise.distribution_speciale)
  if (enterprise.code_postal && enterprise.ville) {
    addressParts.push(`${enterprise.code_postal} ${enterprise.ville}`)
  } else if (enterprise.code_postal) {
    addressParts.push(enterprise.code_postal)
  } else if (enterprise.ville) {
    addressParts.push(enterprise.ville)
  }

  return addressParts.join(', ') || enterprise.adresse || '—'
}

export function EnterpriseDetail({
  enterprise,
  dirigeants = [],
  activites = [],
  observations = [],
  historique = [],
}: EnterpriseDetailProps) {
  const hasINPIData = !!enterprise.inpi_sync_at
  const proceduresCollectives = observations.filter((obs) => obs.is_procedure_collective)

  // Si pas de données INPI synchronisées, afficher un message
  if (!hasINPIData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-amber-500" />
            <div>
              <CardTitle>Données INPI non synchronisées</CardTitle>
              <CardDescription>
                Les données enrichies de l&apos;INPI n&apos;ont pas encore été synchronisées pour
                cette entreprise.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Pour afficher les informations détaillées (dirigeants, capital, activités,
              historique...), cliquez sur le bouton &quot;Importer depuis INPI&quot; dans
              l&apos;onglet Documents, puis sur &quot;Synchroniser&quot;.
            </p>
            <Separator />
            <h4 className="font-medium text-sm">Informations de base</h4>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DataRow label="Raison sociale" value={enterprise.raison_sociale} />
              <DataRow label="SIREN" value={enterprise.siren} />
              <DataRow label="SIRET" value={enterprise.siret} />
              <DataRow label="Forme juridique" value={enterprise.forme_juridique} />
              <DataRow label="Code NAF" value={enterprise.code_naf} />
              <DataRow label="Adresse" value={enterprise.adresse} className="sm:col-span-2" />
            </dl>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Alerte procédures collectives */}
      {proceduresCollectives.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Procédure collective en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {proceduresCollectives.map((proc) => (
                <p key={proc.id} className="text-red-700 text-sm dark:text-red-400">
                  <strong>{proc.type_procedure || proc.code_observation}</strong>
                  {proc.date_ajout && ` - ${formatDate(proc.date_ajout)}`}
                  {proc.texte && `: ${proc.texte}`}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. Identité */}
      <Section title="Identité" icon={Building2}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowWithSource
            label="Dénomination"
            value={enterprise.raison_sociale}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          {enterprise.sigle && (
            <DataRowWithSource
              label="Sigle"
              value={enterprise.sigle}
              source="inpi"
              syncDate={enterprise.inpi_sync_at}
            />
          )}
          {enterprise.nom_commercial && (
            <DataRowWithSource
              label="Nom commercial"
              value={enterprise.nom_commercial}
              source="inpi"
              syncDate={enterprise.inpi_sync_at}
            />
          )}
          <DataRowWithSource
            label="SIREN"
            value={enterprise.siren}
            source="insee"
            syncDate={enterprise.insee_sync_at}
          />
          <DataRowWithSource
            label="SIRET"
            value={enterprise.siret || enterprise.siret_siege}
            source="insee"
            syncDate={enterprise.insee_sync_at}
          />
          <DataRowWithSource
            label="Forme juridique"
            value={enterprise.forme_juridique}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRowWithSource
            label="Date d'immatriculation"
            value={formatDate(enterprise.date_immatriculation)}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRowWithSource
            label="Début d'activité"
            value={formatDate(enterprise.date_debut_activite)}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          {enterprise.date_fin_existence && (
            <DataRowWithSource
              label="Fin d'existence"
              value={formatDate(enterprise.date_fin_existence)}
              source="inpi"
              syncDate={enterprise.inpi_sync_at}
            />
          )}
          {enterprise.duree_societe && (
            <DataRowWithSource
              label="Durée (années)"
              value={`${enterprise.duree_societe} ans`}
              source="inpi"
              syncDate={enterprise.inpi_sync_at}
            />
          )}
        </dl>
      </Section>

      {/* 1b. Dénominations */}
      {enterprise.siren && <CompanyNamesCard siren={enterprise.siren} />}

      {/* 2. Capital & Gouvernance */}
      <Section title="Capital & Gouvernance" icon={Banknote}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowWithSource
            label="Capital social"
            value={formatCurrency(enterprise.capital, enterprise.devise_capital)}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRowWithSource
            label="Capital variable"
            value={<BooleanValue value={enterprise.capital_variable} />}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRow label="Devise" value={enterprise.devise_capital || 'EUR'} />
          {enterprise.nombre_representants_actifs !== undefined &&
            enterprise.nombre_representants_actifs !== null && (
              <DataRowWithSource
                label="Représentants actifs"
                value={enterprise.nombre_representants_actifs}
                source="inpi"
                syncDate={enterprise.inpi_sync_at}
              />
            )}
        </dl>
      </Section>

      {/* 3. Siège social */}
      <Section title="Siège social" icon={MapPin}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRowWithSource
            label="Adresse complète"
            value={buildFullAddress(enterprise)}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
            className="sm:col-span-2 lg:col-span-3"
          />
          <DataRowWithSource
            label="Code postal"
            value={enterprise.code_postal}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRowWithSource
            label="Ville"
            value={enterprise.ville}
            source="inpi"
            syncDate={enterprise.inpi_sync_at}
          />
          <DataRow
            label="Pays"
            value={enterprise.code_pays === 'FRA' ? 'France' : enterprise.code_pays}
          />
          {enterprise.nombre_etablissements_ouverts !== undefined &&
            enterprise.nombre_etablissements_ouverts !== null && (
              <DataRowWithSource
                label="Établissements ouverts"
                value={enterprise.nombre_etablissements_ouverts}
                source="inpi"
                syncDate={enterprise.inpi_sync_at}
              />
            )}
        </dl>
      </Section>

      {/* 4. Dirigeants */}
      <Section
        title="Dirigeants"
        icon={Users}
        badge={dirigeants.length > 0 && <Badge variant="secondary">{dirigeants.length}</Badge>}
      >
        {dirigeants.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucun dirigeant enregistré</p>
        ) : (
          <div className="space-y-4">
            {dirigeants.map((dirigeant) => (
              <div
                key={dirigeant.id}
                className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {dirigeant.type_personne === 'INDIVIDU'
                        ? `${dirigeant.prenoms || ''} ${dirigeant.nom || ''}`.trim() ||
                          'Nom non renseigné'
                        : dirigeant.nom || 'Dénomination non renseignée'}
                    </span>
                    {dirigeant.role_libelle && (
                      <Badge variant="outline" className="text-xs">
                        {dirigeant.role_libelle}
                      </Badge>
                    )}
                  </div>
                  {dirigeant.type_personne === 'INDIVIDU' && (
                    <div className="space-x-3 text-muted-foreground text-sm">
                      {dirigeant.date_naissance && <span>Né(e) en {dirigeant.date_naissance}</span>}
                      {dirigeant.nationalite && <span>• {dirigeant.nationalite}</span>}
                    </div>
                  )}
                  {dirigeant.type_personne === 'PERSONNE_MORALE' && dirigeant.siren_pm && (
                    <p className="text-muted-foreground text-sm">SIREN: {dirigeant.siren_pm}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* 5. Activités */}
      <Section
        title="Activités"
        icon={Briefcase}
        badge={activites.length > 0 && <Badge variant="secondary">{activites.length}</Badge>}
      >
        <div className="space-y-4">
          {enterprise.objet_social && (
            <div>
              <h4 className="mb-1 font-medium text-muted-foreground text-sm">Objet social</h4>
              <p className="text-sm">{enterprise.objet_social}</p>
            </div>
          )}

          {activites.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-muted-foreground text-sm">
                Activités déclarées
              </h4>
              <div className="space-y-2">
                {activites.map((activite) => (
                  <div key={activite.id} className="flex items-start gap-2 rounded bg-muted/50 p-2">
                    {activite.code_ape && (
                      <Badge
                        variant={activite.principale ? 'default' : 'outline'}
                        className="shrink-0"
                      >
                        {activite.code_ape}
                      </Badge>
                    )}
                    <div className="flex-1">
                      <span className="text-sm">
                        {activite.description_detaillee || activite.forme_exercice || '—'}
                      </span>
                      {activite.date_debut && (
                        <p className="mt-0.5 text-muted-foreground text-xs">
                          Depuis le {formatDate(activite.date_debut)}
                        </p>
                      )}
                    </div>
                    {activite.principale && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Principale
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activites.length === 0 && !enterprise.objet_social && (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DataRow label="Code NAF" value={enterprise.code_naf} />
              <DataRow label="Code APE siège" value={enterprise.code_ape_siege} />
            </dl>
          )}
        </div>
      </Section>

      {/* 6. Caractéristiques */}
      <Section title="Caractéristiques" icon={Settings2}>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DataRow
            label="Type de personne"
            value={
              enterprise.type_personne === 'M'
                ? 'Personne morale'
                : enterprise.type_personne === 'P'
                  ? 'Personne physique'
                  : '—'
            }
          />
          <DataRow
            label="Économie Sociale et Solidaire (ESS)"
            value={<BooleanValue value={enterprise.ess} />}
          />
          <DataRow
            label="Société à mission"
            value={<BooleanValue value={enterprise.societe_mission} />}
          />
          <DataRow
            label="Micro-entreprise"
            value={<BooleanValue value={enterprise.micro_entreprise} />}
          />
          <DataRow label="EIRL" value={<BooleanValue value={enterprise.eirl} />} />
          <DataRow
            label="Société étrangère"
            value={<BooleanValue value={enterprise.societe_etrangere} />}
          />
          <DataRow
            label="Entreprise agricole"
            value={<BooleanValue value={enterprise.entreprise_agricole} />}
          />
          <DataRow
            label="Diffusible commercialement"
            value={<BooleanValue value={enterprise.diffusion_commerciale} />}
          />
          <DataRow
            label="Activité non sédentaire"
            value={<BooleanValue value={enterprise.activite_non_sedentaire} />}
          />
        </dl>
      </Section>

      {/* 7. Observations RCS */}
      {observations.length > 0 && (
        <Section
          title="Observations RCS"
          icon={FileText}
          badge={<Badge variant="secondary">{observations.length}</Badge>}
        >
          <div className="space-y-3">
            {observations.map((obs) => (
              <div
                key={obs.id}
                className={`rounded-lg p-3 ${
                  obs.is_procedure_collective
                    ? 'border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                    : 'bg-muted/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {obs.type_procedure || obs.code_observation || 'Observation'}
                      </span>
                      {obs.is_procedure_collective && (
                        <Badge variant="destructive" className="text-xs">
                          Procédure collective
                        </Badge>
                      )}
                    </div>
                    {obs.texte && <p className="text-muted-foreground text-sm">{obs.texte}</p>}
                  </div>
                  {obs.date_ajout && (
                    <span className="whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(obs.date_ajout)}
                    </span>
                  )}
                </div>
                {obs.num_observation && (
                  <p className="mt-1 text-muted-foreground text-xs">
                    N° observation: {obs.num_observation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 8. Historique */}
      {historique.length > 0 && (
        <Section
          title="Historique"
          icon={History}
          badge={<Badge variant="secondary">{historique.length}</Badge>}
        >
          <div className="relative">
            <div className="absolute top-0 bottom-0 left-2 w-px bg-border" />
            <div className="space-y-4">
              {historique.map((event) => (
                <div key={event.id} className="relative pl-6">
                  <div className="absolute top-1.5 left-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">
                        {event.libelle_evenement || event.code_evenement || 'Événement'}
                      </span>
                      {event.date_evenement && (
                        <span className="text-muted-foreground">
                          • {formatDate(event.date_evenement)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 9. Sources des données */}
      <DataSourcesSection
        dossierId={enterprise.id}
        siren={enterprise.siren}
        inpiSyncAt={enterprise.inpi_sync_at ?? null}
        inseeSyncAt={enterprise.insee_sync_at ?? null}
        inpiUpdatedAt={enterprise.inpi_updated_at}
      />
    </div>
  )
}
