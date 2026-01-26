'use client'

import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  Globe,
  History,
  MapPin,
  Radio,
  Users,
  XCircle,
} from 'lucide-react'

import type { INPICompanyInfoStructured } from '@/actions/inpi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getProcedureLabel,
  getProcedureSeverityColor,
  type ProcedureCollectiveResult,
} from '@/lib/utils/procedure-collective-detector'

import type { CompanyState } from './inpi-import-button.types'
import { formatCurrency, formatDate } from './inpi-import-button.utils'

interface CompanyInfoTabProps {
  state: CompanyState
  procedureResult: ProcedureCollectiveResult | null
  onRetry: () => void
}

/**
 * Onglet affichant toutes les informations entreprise INPI
 */
export function CompanyInfoTab({ state, procedureResult, onRetry }: CompanyInfoTabProps) {
  if (state.type === 'loading') {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (state.type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">{state.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  if (state.type !== 'loaded') return null

  const data = state.data

  return (
    <ScrollArea className="h-[450px] pr-4">
      <div className="space-y-4">
        {/* Identité */}
        <IdentitySection data={data} />

        {/* Caractéristiques */}
        {data.fullData && <CharacteristicsSection data={data} />}

        {/* Siège */}
        {data.adresseSiege && <AddressSection data={data} />}

        {/* Établissement principal */}
        {data.fullData?.etablissementPrincipal && <EstablishmentSection data={data} />}

        {/* Activités */}
        {data.fullData?.activites && data.fullData.activites.length > 0 && (
          <ActivitiesSection data={data} />
        )}

        {/* Dirigeants */}
        {data.dirigeants.length > 0 && <DirectorsSection data={data} />}

        {/* Observations RCS */}
        {data.observationsRCS.length > 0 && (
          <ObservationsSection data={data} procedureResult={procedureResult} />
        )}

        {/* Historique */}
        {data.historique.length > 0 && <HistorySection data={data} />}

        {/* Registres */}
        {data.fullData?.registres && <RegistersSection data={data} />}

        {/* Diffusion */}
        {data.fullData && <DiffusionSection data={data} />}
      </div>
    </ScrollArea>
  )
}

// =============================================================================
// SUB-SECTIONS
// =============================================================================

function IdentitySection({ data }: { data: INPICompanyInfoStructured }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          Identité
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Dénomination</span>
          <span className="text-right font-medium">{data.denomination || '-'}</span>
        </div>
        {data.sigle && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sigle</span>
            <span>{data.sigle}</span>
          </div>
        )}
        {data.nomCommercial && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nom commercial</span>
            <span>{data.nomCommercial}</span>
          </div>
        )}
        {data.formeJuridique && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Forme juridique</span>
            <span>
              {data.formeJuridique.libelle}
              <Badge variant="outline" className="ml-2 text-xs">
                {data.formeJuridique.code}
              </Badge>
            </span>
          </div>
        )}
        {data.capital && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Banknote className="h-3 w-3" />
              Capital
            </span>
            <span>
              {formatCurrency(data.capital.montant, data.capital.devise)}
              {data.capital.variable && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Variable
                </Badge>
              )}
            </span>
          </div>
        )}
        {data.dateCreation && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date de création</span>
            <span>{formatDate(data.dateCreation)}</span>
          </div>
        )}
        {data.dateClotureExerciceSocial && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clôture exercice</span>
            <span>{data.dateClotureExerciceSocial}</span>
          </div>
        )}
        {data.objetSocial && (
          <div className="border-t pt-2">
            <span className="text-muted-foreground text-xs">Objet social</span>
            <p className="mt-1 text-xs">{data.objetSocial}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CharacteristicsSection({ data }: { data: INPICompanyInfoStructured }) {
  const fd = data.fullData
  if (!fd) return null

  const hasAny =
    fd.ess ||
    fd.societeMission ||
    fd.microEntreprise ||
    fd.eirl ||
    fd.societeEtrangere ||
    fd.entrepriseAgricole ||
    fd.indicateurAssocieUnique ||
    fd.indicateurOrigineFusionScission

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4" />
          Caractéristiques
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {fd.ess && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              ESS
            </Badge>
          )}
          {fd.societeMission && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Société à mission
            </Badge>
          )}
          {fd.microEntreprise && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Micro-entreprise
            </Badge>
          )}
          {fd.eirl && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              EIRL
            </Badge>
          )}
          {fd.societeEtrangere && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="mr-1 h-3 w-3" />
              Société étrangère
            </Badge>
          )}
          {fd.entrepriseAgricole && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="mr-1 h-3 w-3" />
              Entreprise agricole
            </Badge>
          )}
          {fd.indicateurAssocieUnique && (
            <Badge variant="secondary" className="text-xs">
              Associé unique
            </Badge>
          )}
          {fd.indicateurOrigineFusionScission && (
            <Badge variant="outline" className="text-xs">
              Origine fusion/scission
            </Badge>
          )}
          {!hasAny && (
            <span className="text-muted-foreground text-sm">
              Aucune caractéristique particulière
            </span>
          )}
        </div>
        {fd.duree && (
          <div className="mt-3 flex justify-between border-t pt-2 text-sm">
            <span className="text-muted-foreground">Durée de la société</span>
            <span>{fd.duree} ans</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AddressSection({ data }: { data: INPICompanyInfoStructured }) {
  if (!data.adresseSiege) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" />
          Siège social
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{data.adresseSiege.adresseComplete}</p>
      </CardContent>
    </Card>
  )
}

function EstablishmentSection({ data }: { data: INPICompanyInfoStructured }) {
  const ep = data.fullData?.etablissementPrincipal
  if (!ep) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          Établissement principal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {ep.siret && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">SIRET</span>
            <span className="font-mono">{ep.siret}</span>
          </div>
        )}
        {ep.codeApe && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Code APE</span>
            <Badge variant="outline" className="text-xs">
              {ep.codeApe}
            </Badge>
          </div>
        )}
        {ep.activiteNonSedentaire && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Activité</span>
            <Badge variant="secondary" className="text-xs">
              Non sédentaire
            </Badge>
          </div>
        )}
        {ep.adresse && (
          <div className="border-t pt-2">
            <span className="text-muted-foreground text-xs">Adresse</span>
            <p className="mt-1">{ep.adresse.adresseComplete}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ActivitiesSection({ data }: { data: INPICompanyInfoStructured }) {
  const activites = data.fullData?.activites
  if (!activites || activites.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Briefcase className="h-4 w-4" />
          Activités
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activites.map((activite, idx) => (
            <div key={idx} className="rounded-lg bg-muted/50 p-2 text-sm">
              <div className="mb-1 flex items-center gap-2">
                {activite.principale && (
                  <Badge variant="default" className="text-xs">
                    Principale
                  </Badge>
                )}
                {activite.codeApe && (
                  <Badge variant="outline" className="text-xs">
                    APE: {activite.codeApe}
                  </Badge>
                )}
                {activite.formeExercice && (
                  <Badge variant="secondary" className="text-xs">
                    {activite.formeExercice}
                  </Badge>
                )}
              </div>
              {activite.description && (
                <p className="mt-1 text-muted-foreground text-xs">{activite.description}</p>
              )}
              {activite.dateDebut && (
                <span className="text-muted-foreground text-xs">
                  Depuis le {formatDate(activite.dateDebut)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function DirectorsSection({ data }: { data: INPICompanyInfoStructured }) {
  if (data.dirigeants.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Dirigeants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.dirigeants.map((dirigeant, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border-b py-1 text-sm last:border-0"
            >
              <span className="font-medium">
                {dirigeant.prenom ? `${dirigeant.prenom} ${dirigeant.nom}` : dirigeant.nom}
              </span>
              <Badge variant="outline" className="text-xs">
                {dirigeant.role}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ObservationsSection({
  data,
  procedureResult,
}: {
  data: INPICompanyInfoStructured
  procedureResult: ProcedureCollectiveResult | null
}) {
  if (data.observationsRCS.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          Observations RCS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.observationsRCS.map((obs, idx) => {
            const matchingProcedure = procedureResult?.allProcedures.find(
              (p) => p.texte === obs.texte && p.date === obs.date
            )
            const isProcedure = !!matchingProcedure
            const obsColors = matchingProcedure
              ? getProcedureSeverityColor(procedureResult?.severityLevel ?? 3)
              : null

            return (
              <div
                key={idx}
                className={`rounded-lg p-2 text-sm ${
                  isProcedure && obsColors
                    ? `${obsColors.bg} ${obsColors.border} border`
                    : 'bg-muted/50'
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  {isProcedure && (
                    <AlertTriangle className={`h-3 w-3 ${obsColors?.text || 'text-red-500'}`} />
                  )}
                  <span className="text-muted-foreground text-xs">{formatDate(obs.date)}</span>
                  <Badge variant={isProcedure ? 'destructive' : 'secondary'} className="text-xs">
                    {obs.code}
                  </Badge>
                  {matchingProcedure && (
                    <Badge variant="outline" className={`text-xs ${obsColors?.text || ''}`}>
                      {getProcedureLabel(matchingProcedure.type)}
                    </Badge>
                  )}
                </div>
                <p className={isProcedure && obsColors ? obsColors.text : ''}>{obs.texte}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function HistorySection({ data }: { data: INPICompanyInfoStructured }) {
  if (data.historique.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <History className="h-4 w-4" />
          Historique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.historique.map((evt, idx) => (
            <div key={idx} className="flex items-start gap-3 border-b py-1 text-sm last:border-0">
              <span className="whitespace-nowrap text-muted-foreground text-xs">
                {formatDate(evt.date)}
              </span>
              <span className="flex-1">{evt.libelle}</span>
              <Badge variant="outline" className="shrink-0 text-xs">
                {evt.code}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RegistersSection({ data }: { data: INPICompanyInfoStructured }) {
  const reg = data.fullData?.registres
  if (!reg) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          Registres
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-2">
            {reg.rncsPresent ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={reg.rncsPresent ? '' : 'text-muted-foreground'}>RNCS</span>
          </div>
          <div className="flex items-center gap-2">
            {reg.rnmPresent ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={reg.rnmPresent ? '' : 'text-muted-foreground'}>RNM</span>
          </div>
          <div className="flex items-center gap-2">
            {reg.raaPresent ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={reg.raaPresent ? '' : 'text-muted-foreground'}>RAA</span>
          </div>
        </div>
        {reg.rncsDateImmatriculation && (
          <div className="mt-3 flex justify-between border-t pt-2 text-sm">
            <span className="text-muted-foreground">Date immatriculation RNCS</span>
            <span>{formatDate(reg.rncsDateImmatriculation)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DiffusionSection({ data }: { data: INPICompanyInfoStructured }) {
  const fd = data.fullData
  if (!fd) return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Radio className="h-4 w-4" />
          Diffusion
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {fd.diffusionINSEE && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diffusion INSEE</span>
            <Badge
              variant={fd.diffusionINSEE === 'O' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {fd.diffusionINSEE === 'O' ? 'Oui' : 'Non'}
            </Badge>
          </div>
        )}
        {fd.diffusionCommerciale !== undefined && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diffusion commerciale</span>
            <Badge variant={fd.diffusionCommerciale ? 'default' : 'secondary'} className="text-xs">
              {fd.diffusionCommerciale ? 'Autorisée' : 'Non autorisée'}
            </Badge>
          </div>
        )}
        {fd.typePersonne && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type de personne</span>
            <span>{fd.typePersonne === 'M' ? 'Morale' : 'Physique'}</span>
          </div>
        )}
        {fd.idINPI && (
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">ID INPI</span>
            <span className="font-mono text-xs">{fd.idINPI}</span>
          </div>
        )}
        {fd.updatedAt && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dernière mise à jour</span>
            <span className="text-xs">{formatDate(fd.updatedAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
