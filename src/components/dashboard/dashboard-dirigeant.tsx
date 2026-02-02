import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lightbulb,
  Loader2,
  PartyPopper,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import type {
  DirigeantDashboardData,
  DossierSummary,
  RatioDetail,
} from '@/actions/dirigeant-dashboard.actions'
import { Button } from '@/components/ui/button'
import { getRecommandations } from '@/lib/recommandations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface DashboardDirigeantProps {
  email: string
  data: DirigeantDashboardData
}

/**
 * État 1 : Aucun dossier - Onboarding
 */
function StateNoDossier({ userName }: { userName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Bienvenue sur BILANTIA, {userName}</h1>
        <p className="text-muted-foreground">
          Commencez par ajouter votre entreprise pour obtenir votre score de santé financière
        </p>
      </div>

      <Card className="border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand/10">
              <Building2 className="h-6 w-6 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Ajoutez votre entreprise</CardTitle>
              <CardDescription>
                Nous récupérerons automatiquement les informations depuis les registres officiels
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
              <Search className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-sm">Recherche par SIREN</p>
                <p className="text-xs text-muted-foreground">
                  Entrez votre numéro SIREN à 9 chiffres
                </p>
              </div>
            </div>

            <Button asChild size="lg" className="w-full gap-2">
              <Link href="/enterprise/new">
                <Plus className="h-5 w-5" />
                Ajouter mon entreprise
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Étapes à venir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Ajoutez votre entreprise</p>
                <p className="text-xs text-muted-foreground">Via votre numéro SIREN</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Importez votre liasse fiscale</p>
                <p className="text-xs text-muted-foreground">Document PDF de votre comptable</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Obtenez votre score</p>
                <p className="text-xs text-muted-foreground">Analyse automatique en quelques minutes</p>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * État 2 : Dossier brouillon - Attente import documents
 */
function StateBrouillon({
  dossier,
  justCreated,
}: {
  dossier: DossierSummary
  justCreated: boolean
}) {
  return (
    <div className="space-y-6">
      {/* Message de bienvenue si création automatique */}
      {justCreated && (
        <Card className="border-brand/30 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-brand/20">
                <PartyPopper className="h-6 w-6 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-lg">Votre entreprise a ete ajoutee !</p>
                <p className="text-sm text-muted-foreground">
                  Nous avons recupere automatiquement les informations de votre entreprise.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="font-bold text-2xl">
          {justCreated ? 'Bienvenue sur BILANTIA' : 'Votre entreprise est creee'}
        </h1>
        <p className="text-muted-foreground">
          Importez votre liasse fiscale pour calculer votre score de sante financiere
        </p>
      </div>

      {/* Entreprise créée */}
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold">{dossier.raisonSociale || 'Sans nom'}</p>
              <p className="text-sm text-muted-foreground">SIREN : {dossier.siren || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action : Importer documents */}
      <Card className="border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand/10">
              <Upload className="h-6 w-6 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Importez votre liasse fiscale</CardTitle>
              <CardDescription>
                Document PDF fourni par votre comptable (2050 à 2059 ou 2033)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={`/enterprise/${dossier.id}/documents`}>
              <FileText className="h-5 w-5" />
              Importer mes documents
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Progression */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Entreprise</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-brand animate-pulse" />
          <span className="font-medium text-brand">Documents</span>
        </div>
        <div className="flex-1 h-0.5 bg-muted" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span>Score</span>
        </div>
      </div>
    </div>
  )
}

/**
 * État 3 : Documents uploadés ou extraits - En cours de traitement
 */
function StateProcessing({ dossier }: { dossier: DossierSummary }) {
  const isExtracted = dossier.statut === 'extrait'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">
          {isExtracted ? 'Données extraites' : 'Extraction en cours...'}
        </h1>
        <p className="text-muted-foreground">
          {isExtracted
            ? 'Vérifiez et validez les données extraites de vos documents'
            : 'Nous analysons vos documents. Cela peut prendre quelques minutes.'}
        </p>
      </div>

      {/* Statut entreprise */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">{dossier.raisonSociale || 'Sans nom'}</p>
              <p className="text-sm text-muted-foreground">SIREN : {dossier.siren || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statut extraction */}
      <Card className={cn(
        'border-2',
        isExtracted
          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
          : 'border-brand/20 bg-brand/5'
      )}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4">
            {isExtracted ? (
              <>
                <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900">
                  <FileText className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Données prêtes à valider</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vérifiez les informations extraites avant de calculer votre score
                  </p>
                </div>
                <Button asChild size="lg" className="gap-2">
                  <Link href={`/enterprise/${dossier.id}/documents`}>
                    Valider mes données
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-brand/10">
                  <Loader2 className="h-8 w-8 text-brand animate-spin" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Analyse en cours</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Notre IA extrait les données de votre liasse fiscale...
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/enterprise/${dossier.id}/documents`}>
                    Voir les documents
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Progression */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Entreprise</span>
        </div>
        <div className="flex-1 h-0.5 bg-green-500" />
        <div className="flex items-center gap-1">
          <div className={cn(
            'w-3 h-3 rounded-full',
            isExtracted ? 'bg-amber-500' : 'bg-brand animate-pulse'
          )} />
          <span className={cn('font-medium', isExtracted ? 'text-amber-600' : 'text-brand')}>
            {isExtracted ? 'Validation' : 'Extraction'}
          </span>
        </div>
        <div className="flex-1 h-0.5 bg-muted" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted" />
          <span>Score</span>
        </div>
      </div>
    </div>
  )
}

/**
 * État 4 : Données validées - Calcul du score en cours
 */
function StateValidated({ dossier }: { dossier: DossierSummary }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Données validées</h1>
        <p className="text-muted-foreground">
          Le calcul de votre score de santé financière est en cours...
        </p>
      </div>

      {/* Statut entreprise */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold">{dossier.raisonSociale || 'Sans nom'}</p>
              <p className="text-sm text-muted-foreground">Données financières validées</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calcul en cours */}
      <Card className="border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center gap-4 py-8">
            <div className="p-4 rounded-full bg-brand/10">
              <Loader2 className="h-10 w-10 text-brand animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-lg">Calcul du score en cours</p>
              <p className="text-sm text-muted-foreground mt-1">
                Analyse de 50+ ratios financiers...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Entreprise</span>
        </div>
        <div className="flex-1 h-0.5 bg-green-500" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Documents</span>
        </div>
        <div className="flex-1 h-0.5 bg-green-500" />
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-brand animate-pulse" />
          <span className="font-medium text-brand">Score</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Composant Points d'attention
 */
function PointsAttentionCard({
  pointsAttention,
  dossierId,
}: {
  pointsAttention: RatioDetail[]
  dossierId: string
}) {
  const rouges = pointsAttention.filter((r) => r.zone === 'rouge')
  const jaunes = pointsAttention.filter((r) => r.zone === 'jaune')

  // Tout est vert
  if (rouges.length === 0 && jaunes.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Tous vos indicateurs sont au vert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Félicitations ! Votre entreprise présente une bonne santé financière sur l&apos;ensemble des indicateurs analysés.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Il y a des rouges
  if (rouges.length > 0) {
    const displayedRatios = rouges.slice(0, 5)
    const hasMore = rouges.length > 5

    return (
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Points d&apos;attention
          </CardTitle>
          <CardDescription>
            {rouges.length} indicateur{rouges.length > 1 ? 's' : ''} nécessite{rouges.length > 1 ? 'nt' : ''} votre attention
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedRatios.map((ratio) => (
            <div key={ratio.code} className="flex items-start gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{ratio.nom}</p>
                <p className="text-xs text-muted-foreground">{ratio.explicationSimple}</p>
              </div>
              <span className="text-sm font-mono text-muted-foreground">
                {ratio.valeur.toFixed(1)}
              </span>
            </div>
          ))}
          {hasMore && (
            <Button asChild variant="ghost" size="sm" className="w-full mt-2">
              <Link href={`/enterprise/${dossierId}/score`}>
                Voir tous les détails ({rouges.length - 5} autres)
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Uniquement des jaunes
  const displayedRatios = jaunes.slice(0, 3)

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-500" />
          Points de vigilance
        </CardTitle>
        <CardDescription>
          {jaunes.length} indicateur{jaunes.length > 1 ? 's' : ''} à surveiller
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedRatios.map((ratio) => (
          <div key={ratio.code} className="flex items-start gap-3">
            <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{ratio.nom}</p>
              <p className="text-xs text-muted-foreground">{ratio.explicationSimple}</p>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              {ratio.valeur.toFixed(1)}
            </span>
          </div>
        ))}
        {jaunes.length > 3 && (
          <Button asChild variant="ghost" size="sm" className="w-full mt-2">
            <Link href={`/enterprise/${dossierId}/score`}>
              Voir tous les détails
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Composant Recommandations (placeholder)
 */
function RecommandationsCard({ pointsAttention }: { pointsAttention: RatioDetail[] }) {
  const recommandations = getRecommandations(pointsAttention)

  // Aucune recommandation = tout va bien
  if (recommandations.length === 0) {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Continuez ainsi !
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vos indicateurs sont bons. Maintenez vos bonnes pratiques de gestion pour conserver cette performance.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-brand">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-brand" />
          Recommandations
        </CardTitle>
        <CardDescription>
          Actions prioritaires pour améliorer votre score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommandations.map((reco, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0" aria-hidden="true">
              {reco.icone}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{reco.titre}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{reco.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

/**
 * État 5 : Score disponible - Dashboard complet
 */
function StateAnalysed({
  dossier,
  allDossiers,
  pointsAttention,
}: {
  dossier: DossierSummary
  allDossiers: DossierSummary[]
  pointsAttention: RatioDetail[]
}) {
  const score = dossier.score!
  const hasMultipleDossiers = allDossiers.filter((d) => d.statut === 'analyse').length > 1

  // Couleur du score selon la valeur
  const getScoreColor = (value: number) => {
    if (value >= 7) return 'text-green-600 dark:text-green-400'
    if (value >= 5) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBg = (value: number) => {
    if (value >= 7) return 'bg-green-100 dark:bg-green-900/30'
    if (value >= 5) return 'bg-amber-100 dark:bg-amber-900/30'
    return 'bg-red-100 dark:bg-red-900/30'
  }

  const families = [
    { id: 'liquidite', name: 'Liquidité', value: score.liquidite, weight: 30 },
    { id: 'rentabilite', name: 'Rentabilité', value: score.rentabilite, weight: 20 },
    { id: 'solvabilite', name: 'Solvabilité', value: score.solvabilite, weight: 20 },
    { id: 'activite', name: 'Activité', value: score.activite, weight: 15 },
    { id: 'evolution', name: 'Évolution', value: score.evolution, weight: 15 },
  ]

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur si plusieurs entreprises */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Score de santé financière</h1>
          <p className="text-muted-foreground">
            {dossier.raisonSociale} — Exercice {score.anneeExercice}
          </p>
        </div>

        {hasMultipleDossiers && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Building2 className="h-4 w-4" />
                <span className="max-w-32 truncate">{dossier.raisonSociale}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {allDossiers
                .filter((d) => d.statut === 'analyse')
                .map((d) => (
                  <DropdownMenuItem key={d.id} asChild>
                    <Link
                      href={`/enterprise/${d.id}/score`}
                      className={cn(d.id === dossier.id && 'bg-muted')}
                    >
                      {d.raisonSociale || 'Sans nom'}
                      {d.score && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {d.score.global.toFixed(1)}/10
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Score global */}
      <Card className="border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="flex items-baseline gap-2">
              <span className={cn('font-bold text-6xl font-mono', getScoreColor(score.global))}>
                {score.global.toFixed(1)}
              </span>
              <span className="text-2xl text-muted-foreground">/10</span>
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {score.global >= 7
                  ? 'Bonne santé financière'
                  : score.global >= 5
                    ? 'Santé financière correcte'
                    : 'Points de vigilance identifiés'}
              </p>
              <p className="text-sm text-muted-foreground">
                Basé sur l&apos;analyse de 50+ ratios financiers
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/enterprise/${dossier.id}/score`}>
                Voir le détail
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Familles de ratios */}
      <div>
        <h2 className="font-semibold mb-3">Détail par famille</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {families.map((family) => (
            <Card key={family.id} className="relative overflow-hidden">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{family.name}</span>
                  <span className="text-xs text-muted-foreground">{family.weight}%</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn('font-bold text-2xl font-mono', getScoreColor(family.value))}>
                    {family.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">/10</span>
                </div>
                {/* Barre de progression */}
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', getScoreBg(family.value))}
                    style={{ width: `${(family.value / 10) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Points d'attention et Recommandations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PointsAttentionCard pointsAttention={pointsAttention} dossierId={dossier.id} />
        <RecommandationsCard pointsAttention={pointsAttention} />
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <Link
              href={`/enterprise/${dossier.id}/comparatif`}
              className="flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-brand/10 transition-colors">
                <BarChart3 className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-brand transition-colors">
                  Comparatif sectoriel
                </p>
                <p className="text-xs text-muted-foreground">
                  Comparez-vous aux entreprises de votre secteur
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <Link
              href={`/enterprise/${dossier.id}/veille`}
              className="flex items-center gap-3 group"
            >
              <div className="p-2 rounded-lg bg-muted group-hover:bg-brand/10 transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-medium group-hover:text-brand transition-colors">
                  Veille économique
                </p>
                <p className="text-xs text-muted-foreground">
                  Actualités et tendances de votre secteur
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Dashboard Dirigeant - Composant principal
 */
export function DashboardDirigeant({ email, data }: DashboardDirigeantProps) {
  const userName = email.split('@')[0]
  const { dossiers, currentDossierId, pointsAttention, justCreated } = data

  // Pas de dossier
  if (dossiers.length === 0) {
    return <StateNoDossier userName={userName} />
  }

  // Trouver le dossier courant
  const currentDossier = dossiers.find((d) => d.id === currentDossierId)

  if (!currentDossier) {
    return <StateNoDossier userName={userName} />
  }

  // Affichage selon le statut
  switch (currentDossier.statut) {
    case 'brouillon':
      return <StateBrouillon dossier={currentDossier} justCreated={justCreated} />

    case 'documents_uploades':
    case 'extrait':
      return <StateProcessing dossier={currentDossier} />

    case 'valide':
      return <StateValidated dossier={currentDossier} />

    case 'analyse':
      return (
        <StateAnalysed
          dossier={currentDossier}
          allDossiers={dossiers}
          pointsAttention={pointsAttention}
        />
      )

    default:
      return <StateNoDossier userName={userName} />
  }
}
