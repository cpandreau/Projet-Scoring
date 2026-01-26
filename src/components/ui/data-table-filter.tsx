'use client'

import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  value: string
  label: string
}

interface DataTableFilterProps {
  options: FilterOption[]
  placeholder: string
  paramName: string
  allLabel?: string
  icon?: React.ReactNode
  className?: string
}

export function DataTableFilter({
  options,
  placeholder,
  paramName,
  allLabel = 'Tous',
  icon,
  className,
}: DataTableFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentValue = searchParams.get(paramName) ?? 'all'

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== 'all') {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }

    // Reset to page 1 when filtering
    params.delete('page')

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <Select value={currentValue} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className={className ?? 'w-auto min-w-[140px]'}>
        {icon ?? <Filter className="mr-2 h-4 w-4" />}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
