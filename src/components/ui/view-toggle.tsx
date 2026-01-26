'use client'

import { LayoutGrid, LayoutList } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export type ViewMode = 'table' | 'cards'

interface ViewToggleProps {
  value: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg border p-1">
      <Button
        variant={value === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onChange('table')}
        aria-label="Vue tableau"
      >
        <LayoutList className="h-4 w-4" />
      </Button>
      <Button
        variant={value === 'cards' ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onChange('cards')}
        aria-label="Vue cartes"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
    </div>
  )
}

/**
 * Hook pour gérer la préférence de vue avec localStorage
 */
export function useViewMode(storageKey: string, defaultView: ViewMode = 'table') {
  const [view, setView] = useState<ViewMode>(defaultView)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(storageKey) as ViewMode | null
    if (saved === 'table' || saved === 'cards') {
      setView(saved)
    }
    setIsHydrated(true)
  }, [storageKey])

  const setAndSave = (newView: ViewMode) => {
    setView(newView)
    localStorage.setItem(storageKey, newView)
  }

  return [view, setAndSave, isHydrated] as const
}
