'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { PublicLayout } from '@/components/public'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  title: string
}

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  toc: TocItem[]
  children: React.ReactNode
}

export function LegalPageLayout({ title, lastUpdated, toc, children }: LegalPageLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <PublicLayout headerVariant="solid">
      <main className="bg-background py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.article
            className="prose prose-slate dark:prose-invert max-w-none"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <header className="not-prose mb-10">
              <h1 className="text-3xl sm:text-4xl font-display font-semibold text-foreground">
                {title}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Dernière mise à jour : {lastUpdated}
              </p>
            </header>

            {/* Table of Contents */}
            <nav className="not-prose mb-10 p-5 rounded-xl bg-muted/50 border border-border">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-3">
                Table des matières
              </h2>
              <ol className="space-y-1.5">
                {toc.map((item, index) => (
                  <li key={item.id}>
                    <Link
                      href={`#${item.id}`}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {index + 1}. {item.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            {/* Content */}
            <div className="legal-content">{children}</div>
          </motion.article>
        </div>
      </main>

      <style jsx global>{`
        .legal-content h2 {
          @apply text-xl font-display font-semibold text-foreground mt-10 mb-4 pt-6 border-t border-border;
        }
        .legal-content h2:first-child {
          @apply mt-0 pt-0 border-t-0;
        }
        .legal-content h3 {
          @apply text-lg font-semibold text-foreground mt-6 mb-3;
        }
        .legal-content p {
          @apply text-muted-foreground leading-relaxed mb-4;
        }
        .legal-content ul,
        .legal-content ol {
          @apply text-muted-foreground mb-4 pl-5;
        }
        .legal-content li {
          @apply mb-2;
        }
        .legal-content a {
          @apply text-brand hover:text-brand-light underline-offset-2 hover:underline transition-colors;
        }
        .legal-content strong {
          @apply text-foreground font-semibold;
        }
        .legal-content table {
          @apply w-full text-sm mb-6;
        }
        .legal-content th {
          @apply text-left font-semibold text-foreground bg-muted/50 px-3 py-2 border border-border;
        }
        .legal-content td {
          @apply text-muted-foreground px-3 py-2 border border-border;
        }
        .legal-content .placeholder {
          @apply bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono text-sm;
        }
      `}</style>
    </PublicLayout>
  )
}
