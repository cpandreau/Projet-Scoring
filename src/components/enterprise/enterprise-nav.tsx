'use client'

import { BarChart3, FileText, Info, MapPin, Newspaper, Scale } from 'lucide-react'
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
  { href: 'veille', label: 'Veille', icon: Newspaper },
]

export function EnterpriseNav({ enterpriseId }: EnterpriseNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex overflow-x-auto border-b border-border bg-card/50">
      <div className="flex gap-1 p-1">
        {navItems.map((item) => {
          const href = `/enterprise/${enterpriseId}/${item.href}`
          const isActive = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200',
                isActive
                  ? 'bg-brand text-white shadow-brand'
                  : 'text-muted-foreground hover:bg-brand/10 hover:text-brand'
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
