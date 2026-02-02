'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number // 0-5
  maxStars?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showValue?: boolean
  showCount?: boolean
  count?: number
  className?: string
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  showValue = false,
  showCount = false,
  count,
  className,
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(rating, maxStars))
  const fullStars = Math.floor(clampedRating)
  const decimal = clampedRating % 1
  const hasHalfStar = decimal >= 0.25 && decimal < 0.75
  const hasAlmostFullStar = decimal >= 0.75
  const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0) - (hasAlmostFullStar ? 1 : 0)

  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const starSize = sizeClasses[size]
  const textSize = textSizeClasses[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars + (hasAlmostFullStar ? 1 : 0) }).map((_, i) => (
          <Star key={`full-${i}`} className={cn(starSize, 'fill-yellow-400 text-yellow-400')} />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={cn(starSize, 'text-muted-foreground/30')} />
            <div className="absolute inset-0 w-1/2 overflow-hidden">
              <Star className={cn(starSize, 'fill-yellow-400 text-yellow-400')} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className={cn(starSize, 'text-muted-foreground/30')} />
        ))}
      </div>

      {/* Numeric value */}
      {showValue && <span className={cn('font-medium', textSize)}>{rating.toFixed(1)}</span>}

      {/* Review count */}
      {showCount && count !== undefined && (
        <span className={cn('text-muted-foreground', textSize)}>
          ({count.toLocaleString('fr-FR')})
        </span>
      )}
    </div>
  )
}

/**
 * Compact star display with just the rating number and one star
 */
interface CompactRatingProps {
  rating: number
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export function CompactRating({ rating, size = 'sm', className }: CompactRatingProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Star className={cn(sizeClasses[size], 'fill-yellow-400 text-yellow-400')} />
      <span className={cn('font-medium', textSizeClasses[size])}>{rating.toFixed(1)}</span>
    </div>
  )
}

/**
 * Large rating display for cards
 */
interface LargeRatingProps {
  rating: number
  count?: number
  className?: string
}

export function LargeRating({ rating, count, className }: LargeRatingProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="text-center">
        <div className="text-4xl font-bold tracking-tight">{rating.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">/5</div>
      </div>
      <div className="space-y-1">
        <StarRating rating={rating} size="lg" />
        {count !== undefined && (
          <p className="text-sm text-muted-foreground">{count.toLocaleString('fr-FR')} avis</p>
        )}
      </div>
    </div>
  )
}
