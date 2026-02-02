'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Eye, EyeOff, Loader2, Mail } from 'lucide-react'
import { AuthLayout } from '@/components/auth'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export default function ConnexionPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const prefersReducedMotion = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect')
        }
        throw error
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      visualMessage="Bon retour parmi nous"
      visualSubtitle="Accédez à votre tableau de bord et gardez un oeil sur la santé financière de votre entreprise."
    >
      <motion.div
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">
            Connexion
          </h2>
          <p className="mt-2 text-muted-foreground">
            Entrez vos identifiants pour accéder à votre compte
          </p>
        </motion.div>

        {/* Google Button */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
          <button
            type="button"
            disabled
            className={cn(
              'w-full py-3 rounded-xl font-medium transition-all duration-200',
              'text-muted-foreground border border-border',
              'hover:bg-muted hover:border-border',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-3'
            )}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
            <span className="text-xs">(bientôt)</span>
          </button>
        </motion.div>

        {/* Divider */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="my-6 flex items-center gap-4"
        >
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.fr"
                required
                autoFocus
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
                  'border-border'
                )}
              />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <Link
                href="/mot-de-passe-oublie"
                className="text-sm text-brand hover:text-brand-light transition-colors"
              >
                Oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                minLength={6}
                className={cn(
                  'w-full pl-4 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
                  'border-border'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </motion.div>

          {/* Submit button */}
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300',
                'bg-brand hover:bg-brand-light',
                'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
                'hover:scale-[1.01] active:scale-[0.99]',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
                'flex items-center justify-center gap-2'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </motion.div>
        </form>

        {/* Sign up link */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="font-semibold text-brand hover:text-brand-light transition-colors">
            Créer un compte
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  )
}
