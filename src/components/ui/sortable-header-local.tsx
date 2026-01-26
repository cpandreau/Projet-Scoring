'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SortableHeaderLocalProps {
  label: string
  sortKey: string
  currentSort: string
  onSort: (key: string) => void
  className?: string
}

export function SortableHeaderLocal({
  label,
  sortKey,
  currentSort,
  onSort,
  className,
}: SortableHeaderLocalProps) {
  const isActive = currentSort.startsWith(sortKey)
  const isAsc = currentSort === `${sortKey}_asc`

  const handleClick = () => {
    const newSort = isActive && !isAsc ? `${sortKey}_asc` : `${sortKey}_desc`
    onSort(newSort)
  }

  return (
    <Button variant="ghost" onClick={handleClick} className={cn('h-8 px-2 font-medium', className)}>
      {label}
      {isActive ? (
        isAsc ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-1 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}
