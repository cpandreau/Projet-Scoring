'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
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

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const prefersReducedMotion = useReducedMotion()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        visualMessage="Email envoyé"
        visualSubtitle="Vérifiez votre boîte de réception pour réinitialiser votre mot de passe."
      >
        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </motion.div>

          <motion.h2
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="text-2xl font-display font-semibold text-foreground"
          >
            Vérifiez votre email
          </motion.h2>

          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-3 text-muted-foreground"
          >
            Si un compte existe avec l'adresse <strong className="text-foreground">{email}</strong>,
            vous recevrez un lien pour réinitialiser votre mot de passe.
          </motion.p>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mt-8">
            <Link
              href="/connexion"
              className={cn(
                'inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-light transition-colors'
              )}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </motion.div>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      visualMessage="Mot de passe oublié ?"
      visualSubtitle="Pas de panique, nous allons vous aider à récupérer l'accès à votre compte."
    >
      <motion.div
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mb-8">
          <Link
            href="/connexion"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          <h2 className="text-2xl sm:text-3xl font-display font-semibold text-foreground">
            Réinitialiser le mot de passe
          </h2>
          <p className="mt-2 text-muted-foreground">
            Entrez votre adresse email et nous vous enverrons un lien pour créer un nouveau mot de
            passe.
          </p>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <motion.div variants={prefersReducedMotion ? undefined : itemVariants}>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Adresse email
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
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
                  'border-border'
                )}
              />
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
                  Envoi en cours...
                </>
              ) : (
                'Envoyer le lien'
              )}
            </button>
          </motion.div>
        </form>

        {/* Back to login */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Vous vous souvenez de votre mot de passe ?{' '}
          <Link
            href="/connexion"
            className="font-semibold text-brand hover:text-brand-light transition-colors"
          >
            Se connecter
          </Link>
        </motion.p>
      </motion.div>
    </AuthLayout>
  )
}
