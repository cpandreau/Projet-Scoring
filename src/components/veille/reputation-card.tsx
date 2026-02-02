'use client'

import { AlertCircle, ExternalLink, Info, MapPin, MessageSquare, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompactRating, StarRating } from '@/components/ui/star-rating'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatPriceLevel, type GoogleReview, type PlaceReputation } from '@/lib/api/google-places'

interface ReputationCardProps {
  reputation: PlaceReputation
  companyName: string
}

export function ReputationCard({ reputation, companyName }: ReputationCardProps) {
  if (!reputation.found) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Réputation Google</CardTitle>
            </div>
            <MethodologyTooltip methodology={reputation.methodology} />
          </div>
          <CardDescription>Avis clients sur Google Maps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {reputation.error || `"${companyName}" n'a pas été trouvé sur Google Maps`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              L'entreprise n'a peut-être pas de fiche Google Business
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { rating, userRatingsTotal, reviews, priceLevel, googleMapsUrl, placeName } = reputation

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Réputation Google</CardTitle>
          </div>
          <MethodologyTooltip methodology={reputation.methodology} />
        </div>
        <CardDescription className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {placeName || companyName}
          </span>
          {reputation.matchedName && reputation.matchedName !== companyName && (
            <span className="text-xs text-muted-foreground/70">
              Trouvé via : {reputation.matchedName}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score principal */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            {/* Note */}
            <div className="text-center">
              <div className="text-4xl font-bold tracking-tight">{rating?.toFixed(1) || '-'}</div>
              <div className="text-xs text-muted-foreground">/5</div>
            </div>

            {/* Étoiles */}
            <div className="space-y-1">
              <StarRating rating={rating || 0} size="lg" />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {userRatingsTotal
                    ? `${userRatingsTotal.toLocaleString('fr-FR')} avis`
                    : 'Aucun avis'}
                </span>
              </div>
            </div>
          </div>

          {/* Prix */}
          {priceLevel !== undefined && priceLevel > 0 && (
            <Badge variant="outline" className="text-sm">
              {formatPriceLevel(priceLevel)}
            </Badge>
          )}
        </div>

        {/* Derniers avis */}
        {reviews && reviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Derniers avis</span>
            </div>
            <div className="max-h-[200px] space-y-2 overflow-y-auto">
              {reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Lien Google Maps */}
        {googleMapsUrl && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir sur Google Maps
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Composant avis individuel
 */
function ReviewItem({ review }: { review: GoogleReview }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1.5">
      <div className="flex items-center justify-between">
        <StarRating rating={review.rating} size="xs" />
        <span className="text-xs text-muted-foreground">{review.relativeTime}</span>
      </div>
      {review.text && <p className="text-muted-foreground line-clamp-2">"{review.text}"</p>}
      <p className="text-xs font-medium">{review.authorName}</p>
    </div>
  )
}

/**
 * Tooltip méthodologie
 */
function MethodologyTooltip({ methodology }: { methodology: PlaceReputation['methodology'] }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Info className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Méthodologie</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          <div className="space-y-2 text-xs">
            <div className="border-b pb-1 font-medium">Méthodologie de recherche</div>
            <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
              <span className="text-muted-foreground">Source :</span>
              <span>{methodology.source}</span>

              {methodology.searchedNames && methodology.searchedNames.length > 0 && (
                <>
                  <span className="text-muted-foreground">Noms essayés :</span>
                  <span className="break-words">{methodology.searchedNames.join(', ')}</span>
                </>
              )}

              {methodology.matchedName && (
                <>
                  <span className="text-muted-foreground">Nom trouvé :</span>
                  <span className="break-words font-medium">{methodology.matchedName}</span>
                </>
              )}

              {methodology.searchQuery && (
                <>
                  <span className="text-muted-foreground">Recherche :</span>
                  <span className="break-words">{methodology.searchQuery}</span>
                </>
              )}

              <span className="text-muted-foreground">Données :</span>
              <span>Note, nombre d'avis, 5 derniers avis</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
