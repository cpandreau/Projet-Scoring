'use client'

import {
  BarChart3,
  Building,
  FileText,
  Info,
  LayoutDashboard,
  Loader2,
  MapPin,
  Scale,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCurrentEnterprise } from '@/hooks'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { GlobalSearch } from './global-search'
import { ThemeToggle } from './theme-toggle'

interface SidebarProps {
  email: string
}

interface SidebarContentProps extends SidebarProps {
  onNavigate?: () => void
}

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function SidebarContent({ email, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { enterprise, enterpriseId, loading } = useCurrentEnterprise()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Détermine si le score est disponible (statut "valide" ou "analyse")
  const isScoreAvailable = enterprise?.statut === 'valide' || enterprise?.statut === 'analyse'

  // Liens pour l'entreprise en cours (routes imbriquées Next.js)
  const enterpriseLinks = enterpriseId
    ? [
        {
          name: 'Informations',
          href: `/enterprise/${enterpriseId}/informations`,
          icon: Info,
          segment: 'informations',
        },
        {
          name: 'Documents',
          href: `/enterprise/${enterpriseId}/documents`,
          icon: FileText,
          segment: 'documents',
        },
        {
          name: 'Score',
          href: `/enterprise/${enterpriseId}/score`,
          icon: BarChart3,
          segment: 'score',
          badge: !isScoreAvailable ? 'Indisponible' : null,
          disabled: !isScoreAvailable,
        },
        {
          name: 'Comparatif',
          href: `/enterprise/${enterpriseId}/comparatif`,
          icon: Scale,
          segment: 'comparatif',
          badge: !isScoreAvailable ? 'Indisponible' : null,
          disabled: !isScoreAvailable,
        },
        {
          name: 'Contexte',
          href: `/enterprise/${enterpriseId}/contexte`,
          icon: MapPin,
          segment: 'contexte',
        },
      ]
    : []

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-bold text-primary-foreground text-sm">D</span>
          </div>
          <span className="font-semibold text-lg">Défaillantomètre</span>
        </Link>
      </div>

      {/* Recherche globale */}
      <div className="px-4 pb-4">
        <GlobalSearch />
      </div>

      <Separator />

      {/* Navigation principale */}
      <div className="p-4">
        <p className="mb-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
          Navigation
        </p>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors',
              pathname === '/dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Tableau de bord
          </Link>
          <Link
            href="/enterprise"
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors',
              pathname === '/enterprise' || (pathname.startsWith('/enterprise/') && !enterpriseId)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Building className="h-4 w-4" />
            Entreprises
          </Link>
        </nav>
      </div>

      {/* Section Entreprise en cours */}
      {enterpriseId && (
        <>
          <Separator />
          <div className="flex-1 p-4">
            <p className="mb-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Entreprise en cours
            </p>

            {/* Nom de l'entreprise */}
            <div className="mb-2 px-3 py-2">
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Chargement...</span>
                </div>
              ) : (
                <p
                  className="truncate font-medium text-sm"
                  title={enterprise?.raison_sociale || 'Sans nom'}
                >
                  {enterprise?.raison_sociale || 'Sans nom'}
                </p>
              )}
            </div>

            {/* Liens de l'entreprise */}
            <nav className="space-y-1">
              {enterpriseLinks.map((item) => {
                // Vérifie si le pathname correspond au segment de route
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon

                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex cursor-not-allowed items-center justify-between gap-2 rounded-md px-3 py-2 text-muted-foreground/50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 font-medium text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </>
      )}

      <div className="mt-auto">
        <Separator />

        {/* User section */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                {getInitials(email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ email }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 right-0 left-0 z-40 border-b bg-background px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                <span className="ml-2">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SidebarContent email={email} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="font-semibold">Défaillantomètre</span>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent email={email} />
      </aside>
    </>
  )
}
