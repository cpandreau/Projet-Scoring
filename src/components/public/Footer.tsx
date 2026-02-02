import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const footerLinks = {
  produit: {
    title: 'Produit',
    links: [
      { label: 'Fonctionnalités', href: '/produit' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'Méthodologie', href: '/produit#methodologie' },
      { label: 'FAQ', href: '/tarifs#faq' },
    ],
  },
  pourQui: {
    title: 'Pour qui',
    links: [
      { label: 'Dirigeants TPE/PME', href: '/dirigeants' },
      { label: 'Experts-Comptables', href: '/experts-comptables' },
    ],
  },
  legal: {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'CGU', href: '/cgu' },
      { label: 'Confidentialité', href: '/confidentialite' },
    ],
  },
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer aria-label="Pied de page" className="bg-muted/50 border-t border-border">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand section */}
          <div className="col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/bilantia_logo.svg"
                alt="BILANTIA"
                width={140}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
              L&apos;équilibre financier révélé. Plateforme d&apos;intelligence financière
              pour les dirigeants de PME et TPE.
            </p>
          </div>

          {/* Navigation columns */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <nav key={key} aria-label={section.title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-brand transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="font-display text-xl lg:text-2xl font-semibold text-primary-foreground">
                Prêt à voir clair dans vos finances ?
              </h3>
              <p className="mt-1 text-primary-foreground/70 text-sm">
                Rejoignez les dirigeants qui pilotent leur entreprise avec confiance.
              </p>
            </div>
            <Link
              href="/inscription"
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                'text-sm font-semibold',
                'bg-brand text-white hover:bg-brand-light',
                'shadow-brand hover:shadow-brand-lg',
                'transition-all duration-300 hover:scale-[1.02]'
              )}
            >
              Commencer gratuitement
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} BILANTIA. Tous droits réservés.
            </p>
            <p className="text-xs text-muted-foreground">
              Fait avec <span className="text-brand">&#9830;</span> en France
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
