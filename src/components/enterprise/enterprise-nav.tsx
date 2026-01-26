'use client'

import { BarChart3, FileText, Info, MapPin, Scale } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface EnterpriseNavProps {
  enterpriseId: string
}

const navItems = [
  { href: 'informations', label: 'Infos', icon: Info },
  { href: 'documents', label: 'Docs', icon: FileText },
  { href: 'score', label: 'Score', icon: BarChart3 },
  { href: 'comparatif', label: 'Comparatif', icon: Scale },
  { href: 'contexte', label: 'Contexte', icon: MapPin },
]

export function EnterpriseNav({ enterpriseId }: EnterpriseNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto border-b">
      {navItems.map((item) => {
        const href = `/enterprise/${enterpriseId}/${item.href}`
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 font-medium text-sm transition-colors sm:px-4',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
