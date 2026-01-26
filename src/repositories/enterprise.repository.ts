import { createClient } from '@/lib/supabase/server'
import type { Enterprise } from '@/types'

export type CreatorFilter = 'all' | 'mine' | string

export interface GetEnterprisesOptions {
  userId?: string
  creatorFilter?: CreatorFilter
}

/**
 * Get all enterprises with optional filtering by creator
 * @param options.userId - Current user's ID (for "mine" filter)
 * @param options.creatorFilter - "all" | "mine" | email string
 */
export async function getEnterprises(options: GetEnterprisesOptions = {}): Promise<Enterprise[]> {
  const supabase = await createClient()
  const { userId, creatorFilter = 'all' } = options

  let query = supabase
    .from('dossiers')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(500)

  // Apply filter based on creatorFilter
  if (creatorFilter === 'mine' && userId) {
    query = query.eq('user_id', userId)
  } else if (creatorFilter !== 'all' && creatorFilter !== 'mine') {
    // Filter by specific email
    query = query.eq('created_by_email', creatorFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching enterprises:', error)
    return []
  }

  return data as Enterprise[]
}

/**
 * Get list of unique creator emails for filter dropdown
 */
export async function getCreatorEmails(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossiers')
    .select('created_by_email')
    .is('deleted_at', null)
    .not('created_by_email', 'is', null)
    .limit(1000)

  if (error) {
    console.error('Error fetching creator emails:', error)
    return []
  }

  // Extract unique emails
  const emails = [...new Set(data.map((d) => d.created_by_email).filter(Boolean))] as string[]
  return emails.sort()
}

export async function getEnterprisesByUser(userId: string): Promise<Enterprise[]> {
  return getEnterprises({ userId, creatorFilter: 'mine' })
}

export async function getEnterpriseById(id: string): Promise<Enterprise | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dossiers')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    console.error('Error fetching enterprise:', error)
    return null
  }

  return data as Enterprise
}

/**
 * Enterprise avec score optionnel
 */
export interface EnterpriseWithScore extends Enterprise {
  score: number | null
}

/**
 * Get all enterprises with their scores
 * Utilise une RPC PostgreSQL pour optimiser les performances (1 requête au lieu de 2+)
 * @param options.userId - Current user's ID (for "mine" filter)
 * @param options.creatorFilter - "all" | "mine" | email string
 */
export async function getEnterprisesWithScores(
  options: GetEnterprisesOptions = {}
): Promise<EnterpriseWithScore[]> {
  const supabase = await createClient()
  const { userId, creatorFilter = 'all' } = options

  const { data, error } = await supabase.rpc('get_enterprises_with_scores', {
    p_user_id: userId ?? null,
    p_creator_filter: creatorFilter,
    p_limit: 500,
  })

  if (error) {
    console.error('Error fetching enterprises with scores via RPC:', error)
    return []
  }

  return (data as EnterpriseWithScore[]) ?? []
}

/**
 * Filtres pour la liste paginée des entreprises
 */
export interface EnterpriseFilters {
  search?: string
  status?: string
  scoreZone?: string
  creatorFilter?: CreatorFilter
  sort?: string
  page?: number
  perPage?: number
}

/**
 * Résultat paginé des entreprises
 */
export interface PaginatedEnterprises {
  data: EnterpriseWithScore[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

/**
 * Get paginated enterprises with search, sort, and filters
 * Uses server-side pagination via RPC for optimal performance
 */
export async function getEnterprisesPaginated(
  userId: string,
  filters: EnterpriseFilters = {}
): Promise<PaginatedEnterprises> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_enterprises_paginated', {
    p_user_id: userId,
    p_search: filters.search || null,
    p_status: filters.status || null,
    p_score_zone: filters.scoreZone || null,
    p_creator_filter: filters.creatorFilter || 'all',
    p_sort: filters.sort || 'updated_desc',
    p_page: filters.page || 1,
    p_per_page: filters.perPage || 15,
  })

  if (error) {
    console.error('Error fetching paginated enterprises:', error)
    return {
      data: [],
      pagination: { page: 1, perPage: 15, total: 0, totalPages: 0 },
    }
  }

  return data as PaginatedEnterprises
}

/**
 * Archive avec informations de suppression
 */
export interface ArchivedEnterprise {
  id: string
  siren: string | null
  raison_sociale: string | null
  deleted_at: string
  deleted_by: string | null
  created_by_email: string | null
}

/**
 * Filtres pour la liste paginée des archives
 */
export interface ArchiveFilters {
  search?: string
  sort?: string
  page?: number
  perPage?: number
}

/**
 * Résultat paginé des archives
 */
export interface PaginatedArchives {
  data: ArchivedEnterprise[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

/**
 * Get paginated archives with search and sort
 * Uses server-side pagination via RPC for optimal performance
 */
export async function getArchivesPaginated(
  userId: string,
  filters: ArchiveFilters = {}
): Promise<PaginatedArchives> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_archives_paginated', {
    p_user_id: userId,
    p_search: filters.search || null,
    p_sort: filters.sort || 'deleted_desc',
    p_page: filters.page || 1,
    p_per_page: filters.perPage || 15,
  })

  if (error) {
    console.error('Error fetching paginated archives:', error)
    return {
      data: [],
      pagination: { page: 1, perPage: 15, total: 0, totalPages: 0 },
    }
  }

  return data as PaginatedArchives
}
