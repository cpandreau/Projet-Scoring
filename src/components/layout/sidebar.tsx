'use client'

import {
  BarChart3,
  Bell,
  Building,
  Building2,
  FileText,
  Info,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  Newspaper,
  Scale,
  Settings,
} from 'lucide-react'
import Image from 'next/image'
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
import type { UserType } from '@/lib/auth'
import { GlobalSearch } from './global-search'
import { ThemeToggle } from './theme-toggle'

interface SidebarProps {
  email: string
  userType: UserType
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

function SidebarContent({ email, userType, onNavigate }: SidebarContentProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { enterprise, enterpriseId, loading } = useCurrentEnterprise()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  // Détermine si le score est disponible (statut "valide" ou "analyse")
  const isScoreAvailable = enterprise?.statut === 'valide' || enterprise?.statut === 'analyse'

  // Navigation Dirigeant (simplifiée)
  const dirigeantLinks = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Mon Entreprise',
      href: enterpriseId ? `/enterprise/${enterpriseId}/informations` : '/enterprise',
      icon: Building2,
    },
    {
      name: 'Alertes',
      href: '/alertes',
      icon: Bell,
    },
    {
      name: 'Paramètres',
      href: '/parametres',
      icon: Settings,
    },
  ]

  // Liens pour l'entreprise en cours (comptable uniquement)
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
        {
          name: 'Veille',
          href: `/enterprise/${enterpriseId}/veille`,
          icon: Newspaper,
          segment: 'veille',
        },
      ]
    : []

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="p-6">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image
            src="/bilantia_logo.svg"
            alt="BILANTIA"
            width={140}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Recherche globale (comptable uniquement) */}
      {userType === 'comptable' && (
        <div className="px-4 pb-4">
          <GlobalSearch />
        </div>
      )}

      <Separator />

      {/* Navigation Dirigeant */}
      {userType === 'dirigeant' && (
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {dirigeantLinks.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200',
                    isActive
                      ? 'bg-brand text-white shadow-brand'
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
      )}

      {/* Navigation Comptable */}
      {userType === 'comptable' && (
        <>
          <div className="p-4">
            <p className="mb-2 px-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              Navigation
            </p>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200',
                  pathname === '/dashboard'
                    ? 'bg-brand text-white shadow-brand'
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
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-all duration-200',
                  pathname === '/enterprise' || (pathname.startsWith('/enterprise/') && !enterpriseId)
                    ? 'bg-brand text-white shadow-brand'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Building className="h-4 w-4" />
                Entreprises
              </Link>
            </nav>
          </div>

          {/* Section Entreprise en cours (comptable) */}
          {enterpriseId && (
            <>
              <Separator />
              <div className="flex-1 overflow-auto p-4">
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
                      className="truncate font-semibold text-sm text-foreground"
                      title={enterprise?.raison_sociale || 'Sans nom'}
                    >
                      {enterprise?.raison_sociale || 'Sans nom'}
                    </p>
                  )}
                </div>

                {/* Liens de l'entreprise */}
                <nav className="space-y-1">
                  {enterpriseLinks.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const Icon = item.icon

                    if (item.disabled) {
                      return (
                        <div
                          key={item.name}
                          className="flex cursor-not-allowed items-center justify-between gap-2 rounded-lg px-3 py-2 text-muted-foreground/50 text-sm"
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
                          'flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-all duration-200',
                          isActive
                            ? 'bg-brand text-white shadow-brand'
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
        </>
      )}

      <div className="mt-auto">
        <Separator />

        {/* User section */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarFallback className="bg-brand/10 text-brand text-sm font-medium">
                {getInitials(email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-sm">{email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ email, userType }: SidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile header */}
      <header className="fixed top-0 right-0 left-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 py-3 lg:hidden">
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
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SidebarContent email={email} userType={userType} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/bilantia_logo.svg"
              alt="BILANTIA"
              width={120}
              height={35}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden border-r bg-card lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent email={email} userType={userType} />
      </aside>
    </>
  )
}
