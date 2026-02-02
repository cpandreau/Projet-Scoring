'use client'

import { ExternalLink } from 'lucide-react'
import { formatRelativeTime, type NewsArticle } from '@/lib/api/google-news'

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  // Extraire le hostname pour le favicon
  const hostname = (() => {
    try {
      const url = article.sourceUrl || article.link
      return url ? new URL(url).hostname : null
    } catch {
      return null
    }
  })()

  const faviconUrl = hostname ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=16` : null

  // Afficher description seulement si différente du titre
  const showDescription = (() => {
    if (!article.description) return false
    const descLower = article.description.toLowerCase().trim()
    const titleLower = article.title.toLowerCase().trim()

    // Ne pas afficher si identique
    if (descLower === titleLower) return false

    // Ne pas afficher si le titre contient le début de la description
    if (titleLower.includes(descLower.substring(0, 30))) return false

    // Ne pas afficher si la description contient le titre complet
    if (descLower.includes(titleLower)) return false

    return true
  })()

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      {/* Thumbnail à gauche si disponible */}
      {article.thumbnail && (
        <div className="hidden flex-shrink-0 sm:block">
          <img
            src={article.thumbnail}
            alt=""
            className="h-20 w-28 rounded-md object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        {/* Titre */}
        <h3 className="line-clamp-2 font-medium leading-snug group-hover:text-primary">
          {article.title}
        </h3>

        {/* Description */}
        {showDescription && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.description}</p>
        )}

        {/* Footer : Source + Date */}
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {/* Favicon */}
          {faviconUrl && (
            <img
              src={faviconUrl}
              alt=""
              className="h-4 w-4 rounded-sm"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          )}

          {/* Source */}
          <span className="font-medium">{article.source}</span>

          <span>•</span>

          {/* Date */}
          <span>{formatRelativeTime(article.pubDate)}</span>

          {/* Icône externe */}
          <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </a>
  )
}
