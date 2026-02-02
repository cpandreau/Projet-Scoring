'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DarkModeToggleProps {
  /** Show in header (inline) or as fixed floating button */
  variant?: 'fixed' | 'inline'
  /** Show system option in cycle */
  showSystem?: boolean
}

export function DarkModeToggle({
  variant = 'fixed',
  showSystem = false,
}: DarkModeToggleProps) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const cycleTheme = () => {
    if (showSystem) {
      // Cycle: light -> dark -> system -> light
      if (theme === 'light') {
        setTheme('dark')
      } else if (theme === 'dark') {
        setTheme('system')
      } else {
        setTheme('light')
      }
    } else {
      // Simple toggle: light <-> dark
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }
  }

  const getIcon = () => {
    if (!mounted) {
      return <Sun className="h-5 w-5" />
    }

    if (showSystem && theme === 'system') {
      return <Monitor className="h-5 w-5 text-muted-foreground" />
    }

    return resolvedTheme === 'dark' ? (
      <Sun className="h-5 w-5 text-brand" />
    ) : (
      <Moon className="h-5 w-5 text-foreground" />
    )
  }

  const getLabel = () => {
    if (!mounted) return 'Changer le thème'

    if (showSystem && theme === 'system') {
      return 'Thème système - Cliquer pour passer en mode clair'
    }

    return resolvedTheme === 'dark'
      ? 'Mode sombre - Cliquer pour passer en mode clair'
      : 'Mode clair - Cliquer pour passer en mode sombre'
  }

  const baseClasses = cn(
    'p-3 rounded-full transition-all duration-300',
    'bg-card border border-border',
    'hover:shadow-lg hover:scale-105',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background'
  )

  const fixedClasses = cn(baseClasses, 'fixed bottom-6 right-6 z-50 shadow-lg')

  const inlineClasses = cn(baseClasses, 'shadow-sm')

  // Render placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <button
        className={variant === 'fixed' ? fixedClasses : inlineClasses}
        aria-label="Changer le thème"
        disabled
      >
        <Sun className="h-5 w-5 text-muted-foreground" />
      </button>
    )
  }

  return (
    <button
      onClick={cycleTheme}
      className={variant === 'fixed' ? fixedClasses : inlineClasses}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  )
}
