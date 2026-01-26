'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DataTableSearchProps {
  placeholder?: string
  paramName?: string
  className?: string
}

export function DataTableSearch({
  placeholder = 'Rechercher...',
  paramName = 'search',
  className,
}: DataTableSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentValue = searchParams.get(paramName) ?? ''
  const [value, setValue] = useState(currentValue)

  const updateSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (term) {
      params.set(paramName, term)
    } else {
      params.delete(paramName)
    }

    // Reset to page 1 when searching
    params.delete('page')

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }, 300)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    updateSearch(e.target.value)
  }

  const handleClear = () => {
    setValue('')
    updateSearch('')
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pr-9 pl-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Effacer la recherche</span>
        </Button>
      )}
      {isPending && (
        <div className="absolute top-1/2 right-10 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
