'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchTerritorialContext, getAvailableYears } from '@/actions/territorial.actions'
import type { TerritorialContext } from '@/types/territorial'

interface UseTerritorialContextReturn {
  data: TerritorialContext | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
  availableYears: number[]
  selectedYear: number | undefined
  setSelectedYear: (year: number) => void
}

export function useTerritorialContext(
  siren: string | null,
  codeNAF: string | null,
  codeDepartement: string | null
): UseTerritorialContextReturn {
  const [data, setData] = useState<TerritorialContext | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)

  // Track the last fetched params to avoid duplicate requests
  const lastFetchedRef = useRef<string | null>(null)
  // Counter to force refetch
  const refetchCounterRef = useRef(0)

  // Load available years on mount
  useEffect(() => {
    getAvailableYears().then((years) => {
      setAvailableYears(years)
      if (years.length > 0 && selectedYear === undefined) {
        setSelectedYear(years[0]) // Default to most recent
      }
    })
  }, [selectedYear])

  const fetchContext = useCallback(async () => {
    // If any param is null/undefined, don't call the service
    if (!siren || !codeNAF || !codeDepartement) {
      setData(null)
      setIsLoading(false)
      setError(null)
      return
    }

    const cacheKey = `${siren}-${codeNAF}-${codeDepartement}-${selectedYear}-${refetchCounterRef.current}`

    // Skip if already fetched with same params (unless refetch was called)
    if (lastFetchedRef.current === cacheKey) {
      return
    }

    lastFetchedRef.current = cacheKey
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchTerritorialContext(siren, codeNAF, codeDepartement, selectedYear)
      if (result.error) {
        setError(new Error(result.error))
        setData(null)
      } else {
        setData(result.data)
      }
    } catch (err) {
      console.error('[useTerritorialContext] Error:', err)
      setError(
        err instanceof Error
          ? err
          : new Error('Erreur lors de la récupération du contexte territorial')
      )
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [siren, codeNAF, codeDepartement, selectedYear])

  // Fetch when params change
  useEffect(() => {
    let cancelled = false

    const doFetch = async () => {
      if (cancelled) return
      await fetchContext()
    }

    doFetch()

    return () => {
      cancelled = true
    }
  }, [fetchContext])

  // Refetch function to force reload
  const refetch = useCallback(() => {
    refetchCounterRef.current += 1
    lastFetchedRef.current = null
    fetchContext()
  }, [fetchContext])

  return {
    data,
    isLoading,
    error,
    refetch,
    availableYears,
    selectedYear,
    setSelectedYear,
  }
}
