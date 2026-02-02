'use client'

import { ChevronDown, Newspaper } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { NewsArticle } from '@/lib/api/google-news'
import { NewsCard } from './news-card'

interface NewsListProps {
  articles: NewsArticle[]
  emptyMessage?: string
  emptySubMessage?: string
  initialCount?: number
}

export function NewsList({
  articles,
  emptyMessage = 'Aucune actualité trouvée',
  emptySubMessage,
  initialCount = 5,
}: NewsListProps) {
  const [displayCount, setDisplayCount] = useState(initialCount)

  const visibleArticles = articles.slice(0, displayCount)
  const hasMore = displayCount < articles.length
  const remainingCount = articles.length - displayCount

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 5, articles.length))
  }

  // État vide
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Newspaper className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="mt-1 text-xs text-muted-foreground/70">{emptySubMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Liste des articles */}
      <div className="space-y-3">
        {visibleArticles.map((article, index) => (
          <NewsCard key={`${article.link}-${index}`} article={article} />
        ))}
      </div>

      {/* Bouton Voir plus */}
      {hasMore && (
        <Button variant="ghost" className="w-full" onClick={handleShowMore}>
          <ChevronDown className="mr-2 h-4 w-4" />
          Voir plus ({remainingCount} restant{remainingCount > 1 ? 's' : ''})
        </Button>
      )}

      {/* Indicateur fin de liste */}
      {!hasMore && articles.length > initialCount && (
        <p className="text-center text-xs text-muted-foreground">
          {articles.length} article{articles.length > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  )
}
