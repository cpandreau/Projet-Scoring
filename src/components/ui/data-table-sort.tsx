'use client'

import { ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SortOption {
  value: string
  label: string
}

interface DataTableSortProps {
  options: SortOption[]
  defaultValue?: string
  paramName?: string
}

export function DataTableSort({
  options,
  defaultValue = '',
  paramName = 'sort',
}: DataTableSortProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentValue = searchParams.get(paramName) ?? defaultValue

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== defaultValue) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <Select value={currentValue || defaultValue} onValueChange={handleChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]">
        <ArrowUpDown className="mr-2 h-4 w-4" />
        <SelectValue placeholder="Trier par..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
