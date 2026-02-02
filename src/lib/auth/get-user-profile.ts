import { createClient } from '@/lib/supabase/server'

/**
 * Type de profil utilisateur
 */
export type UserType = 'dirigeant' | 'comptable'
export type UserPlan = 'gratuit' | 'essentiel' | 'pro' | 'solo' | 'cabinet'

export interface UserProfile {
  id: string
  userType: UserType
  plan: UserPlan
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Récupère le profil de l'utilisateur connecté
 * @returns Le profil utilisateur ou null si non connecté
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient()

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  // Récupérer le profil depuis user_profiles
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_type, plan, is_admin, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[getUserProfile] Erreur récupération profil:', profileError?.message)
    return null
  }

  return {
    id: profile.id,
    userType: profile.user_type as UserType,
    plan: profile.plan as UserPlan,
    isAdmin: profile.is_admin,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  }
}

/**
 * Récupère le profil utilisateur avec les infos auth
 * Utile pour avoir email + profil en un seul appel
 */
export async function getUserWithProfile(): Promise<{
  user: { id: string; email: string }
  profile: UserProfile
} | null> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, user_type, plan, is_admin, created_at, updated_at')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('[getUserWithProfile] Erreur récupération profil:', profileError?.message)
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
    },
    profile: {
      id: profile.id,
      userType: profile.user_type as UserType,
      plan: profile.plan as UserPlan,
      isAdmin: profile.is_admin,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at),
    },
  }
}
