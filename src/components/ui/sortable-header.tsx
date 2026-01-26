'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SortableHeaderProps {
  label: string
  sortKey: string
  className?: string
}

export function SortableHeader({ label, sortKey, className }: SortableHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSort = searchParams.get('sort') ?? 'created_desc'

  const isActive = currentSort.startsWith(sortKey)
  const isAsc = currentSort === `${sortKey}_asc`

  const handleClick = () => {
    const params = new URLSearchParams(searchParams.toString())
    const newSort = isActive && !isAsc ? `${sortKey}_asc` : `${sortKey}_desc`
    params.set('sort', newSort)
    params.delete('page')
    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={isPending}
      className={cn('h-8 px-2 font-medium', className)}
    >
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
