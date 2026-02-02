'use client'

import { useState, useTransition, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Rocket,
  Search,
  User,
  Users,
  UserCircle,
} from 'lucide-react'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { PasswordStrength, RoleSelector, StepIndicator } from '@/components/auth'
import { createClient } from '@/lib/supabase/client'
import { searchSirene } from '@/actions/sirene.actions'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3 | 4
type Role = 'dirigeant' | 'comptable' | null

interface FormData {
  email: string
  password: string
  confirmPassword: string
  role: Role
  // Dirigeant
  siren: string
  companyName: string
  companyAddress: string
  companyNaf: string
  // Comptable
  cabinetName: string
  cabinetSiren: string
  estimatedClients: string
}

const steps = [
  { number: 1, title: 'Profil', icon: UserCircle },
  { number: 2, title: 'Compte', icon: User },
  { number: 3, title: 'Activité', icon: Building2 },
  { number: 4, title: 'Bienvenue', icon: Rocket },
]

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
}

// Step 1: Role selection (NEW)
function Step1Profile({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
}) {
  const handleRoleSelect = (role: Role) => {
    setFormData({ ...formData, role })
    // Auto-advance to next step on selection
    setTimeout(onNext, 150)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-display font-semibold text-foreground">Créez votre compte</h2>
        <p className="mt-2 text-muted-foreground">Quel est votre profil ?</p>
      </div>

      {/* Role selection */}
      <RoleSelector value={formData.role} onChange={handleRoleSelect} />

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        En continuant, vous acceptez nos{' '}
        <Link href="/cgu" className="text-brand hover:underline">
          conditions d'utilisation
        </Link>{' '}
        et notre{' '}
        <Link href="/confidentialite" className="text-brand hover:underline">
          politique de confidentialité
        </Link>
      </p>
    </div>
  )
}

// Step 2: Account creation (email + password only)
function Step2Account({
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
  onBack: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide'
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une majuscule'
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins un chiffre'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">Créez votre compte</h2>
        <p className="mt-2 text-muted-foreground">Entrez vos informations de connexion</p>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
          Email professionnel
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vous@entreprise.fr"
            className={cn(
              'w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
              errors.email ? 'border-red-300' : 'border-border'
            )}
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="8 caractères, 1 majuscule, 1 chiffre"
            className={cn(
              'w-full pl-4 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
              errors.password ? 'border-red-300' : 'border-border'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <PasswordStrength password={formData.password} className="mt-2" />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1.5">
          Confirmer le mot de passe
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Confirmez votre mot de passe"
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            errors.confirmPassword ? 'border-red-300' : 'border-border'
          )}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-border text-foreground font-medium transition-all duration-200 hover:bg-muted flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="submit"
          className={cn(
            'flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300',
            'bg-brand hover:bg-brand-light',
            'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
            'hover:scale-[1.01] active:scale-[0.99]',
            'flex items-center justify-center gap-2'
          )}
        >
          Continuer
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// Step 3: Company/Cabinet info
function Step3Activity({
  formData,
  setFormData,
  onNext,
  onBack,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
  onBack: () => void
}) {
  const [isSearching, startSearching] = useTransition()
  const [error, setError] = useState('')
  const [isFound, setIsFound] = useState(false)

  const searchCompany = useCallback(async () => {
    const siren = formData.siren.replace(/\s/g, '')
    if (!siren || siren.length !== 9) {
      setError('Le SIREN doit contenir 9 chiffres')
      return
    }

    setError('')
    startSearching(async () => {
      const result = await searchSirene(siren)

      if (result.error) {
        setError(result.error)
        setIsFound(false)
      } else if (result.results && result.results.length > 0) {
        const company = result.results[0]
        setFormData((prev) => ({
          ...prev,
          companyName: company.raison_sociale,
          companyAddress: company.adresse || '',
          companyNaf: company.code_naf || '',
        }))
        setIsFound(true)
      } else {
        setError('Aucune entreprise trouvée avec ce SIREN')
        setIsFound(false)
      }
    })
  }, [formData.siren, setFormData])

  const handleSirenChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9)
    setFormData({
      ...formData,
      siren: cleaned,
      companyName: '',
      companyAddress: '',
      companyNaf: '',
    })
    setIsFound(false)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.role === 'dirigeant') {
      if (!isFound) {
        searchCompany()
        return
      }
    } else {
      // Comptable - validate cabinet name
      if (!formData.cabinetName.trim()) {
        setError('Le nom du cabinet est requis')
        return
      }
    }

    onNext()
  }

  if (formData.role === 'dirigeant') {
    return (
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-display font-semibold text-foreground">Votre entreprise</h2>
          <p className="mt-2 text-muted-foreground">
            Nous récupérons automatiquement les informations
          </p>
        </div>

        {/* SIREN */}
        <div>
          <label htmlFor="siren" className="block text-sm font-medium text-foreground mb-1.5">
            Numéro SIREN
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="siren"
              type="text"
              inputMode="numeric"
              value={formData.siren}
              onChange={(e) => handleSirenChange(e.target.value)}
              placeholder="123 456 789"
              className={cn(
                'w-full pl-11 pr-12 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground font-mono tracking-wider transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
                error ? 'border-red-300' : isFound ? 'border-emerald-400' : 'border-border'
              )}
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand animate-spin" />
            )}
            {isFound && !isSearching && (
              <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            )}
          </div>
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Identifiant unique à 9 chiffres de votre entreprise
          </p>
        </div>

        {/* Company found */}
        {isFound && formData.companyName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate">{formData.companyName}</p>
                <p className="text-sm text-muted-foreground">SIREN: {formData.siren}</p>
                {formData.companyAddress && (
                  <p className="text-sm text-muted-foreground truncate">{formData.companyAddress}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-border text-foreground font-medium transition-all duration-200 hover:bg-muted flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <button
            type="submit"
            disabled={isSearching}
            className={cn(
              'flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300',
              'bg-brand hover:bg-brand-light',
              'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-2'
            )}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Recherche...
              </>
            ) : isFound ? (
              <>
                Continuer
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Rechercher
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  // Comptable form
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-display font-semibold text-foreground">Votre cabinet</h2>
        <p className="mt-2 text-muted-foreground">Quelques informations sur votre activité</p>
      </div>

      {/* Cabinet name */}
      <div>
        <label htmlFor="cabinetName" className="block text-sm font-medium text-foreground mb-1.5">
          Nom du cabinet
        </label>
        <input
          id="cabinetName"
          type="text"
          value={formData.cabinetName}
          onChange={(e) => setFormData({ ...formData, cabinetName: e.target.value })}
          placeholder="Cabinet Dupont & Associés"
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            error && !formData.cabinetName ? 'border-red-300' : 'border-border'
          )}
        />
        {error && !formData.cabinetName && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>

      {/* Cabinet SIREN (optional) */}
      <div>
        <label htmlFor="cabinetSiren" className="block text-sm font-medium text-foreground mb-1.5">
          SIREN du cabinet <span className="text-muted-foreground">(optionnel)</span>
        </label>
        <input
          id="cabinetSiren"
          type="text"
          inputMode="numeric"
          value={formData.cabinetSiren}
          onChange={(e) =>
            setFormData({ ...formData, cabinetSiren: e.target.value.replace(/\D/g, '').slice(0, 9) })
          }
          placeholder="123 456 789"
          className={cn(
            'w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground font-mono tracking-wider transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            'border-border'
          )}
        />
      </div>

      {/* Estimated clients */}
      <div>
        <label htmlFor="estimatedClients" className="block text-sm font-medium text-foreground mb-1.5">
          Nombre de clients estimé
        </label>
        <div className="relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <select
            id="estimatedClients"
            value={formData.estimatedClients}
            onChange={(e) => setFormData({ ...formData, estimatedClients: e.target.value })}
            className={cn(
              'w-full pl-11 pr-4 py-3 rounded-xl border bg-background text-foreground transition-all duration-200 appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
              'border-border'
            )}
          >
            <option value="">Sélectionnez...</option>
            <option value="<15">Moins de 15 clients</option>
            <option value="15-50">15 à 50 clients</option>
            <option value="50-100">50 à 100 clients</option>
            <option value=">100">Plus de 100 clients</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-border text-foreground font-medium transition-all duration-200 hover:bg-muted flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="submit"
          className={cn(
            'flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300',
            'bg-brand hover:bg-brand-light',
            'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
            'flex items-center justify-center gap-2'
          )}
        >
          Continuer
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  )
}

// Step 4: Welcome
function Step4Welcome({
  formData,
  onComplete,
  isSubmitting,
  prefersReducedMotion,
}: {
  formData: FormData
  onComplete: () => void
  isSubmitting: boolean
  prefersReducedMotion: boolean | null
}) {
  const emailName = formData.email.split('@')[0]

  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <motion.div
        initial={prefersReducedMotion ? undefined : { scale: 0 }}
        animate={prefersReducedMotion ? undefined : { scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center"
      >
        <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </motion.div>

      {/* Welcome message */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-foreground">
          Bienvenue, {emailName} !
        </h2>
        <p className="mt-2 text-muted-foreground">
          Votre compte est prêt. Voici vos prochaines étapes :
        </p>
      </div>

      {/* Next steps */}
      <div className="text-left space-y-2.5">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
          <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-brand">1</span>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Importer votre liasse fiscale</p>
            <p className="text-xs text-muted-foreground">Obtenez votre score en quelques minutes</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
          <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-brand">2</span>
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">Découvrir votre tableau de bord</p>
            <p className="text-xs text-muted-foreground">Visualisez vos indicateurs clés</p>
          </div>
        </div>

        {formData.role === 'dirigeant' && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-muted/50 border border-border">
            <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-brand">3</span>
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Inviter votre comptable</p>
              <p className="text-xs text-muted-foreground">
                Partagez l'accès pour une meilleure collaboration
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={onComplete}
        disabled={isSubmitting}
        className={cn(
          'w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300',
          'bg-brand hover:bg-brand-light',
          'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
          'hover:scale-[1.01] active:scale-[0.99]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Création du compte...
          </>
        ) : (
          <>
            Accéder à mon tableau de bord
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  )
}

function InscriptionContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const prefersReducedMotion = useReducedMotion()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [direction, setDirection] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: null,
    siren: '',
    companyName: '',
    companyAddress: '',
    companyNaf: '',
    cabinetName: '',
    cabinetSiren: '',
    estimatedClients: '',
  })

  const goToStep = (step: Step) => {
    setDirection(step > currentStep ? 1 : -1)
    setCurrentStep(step)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            company_name: formData.role === 'dirigeant' ? formData.companyName : formData.cabinetName,
            siren: formData.role === 'dirigeant' ? formData.siren : formData.cabinetSiren,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('Un compte existe déjà avec cette adresse email')
        }
        throw signUpError
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay opacity-50" />

        {/* Hexagons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingHexagon
            className="absolute top-20 left-[15%] text-brand/[0.06]"
            size={120}
            delay={0}
            duration={10}
            strokeWidth={0.8}
          />
          <FloatingHexagon
            className="absolute top-1/3 right-[10%] text-brand/[0.08]"
            size={80}
            delay={2}
            duration={8}
            withBars
            strokeWidth={1}
          />
          <FloatingHexagon
            className="absolute bottom-1/4 left-[20%] text-brand/[0.05]"
            size={100}
            delay={4}
            duration={12}
            strokeWidth={0.6}
          />
        </div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          <Link href="/" className="inline-block">
            <Image
              src="/bilantia_logo.svg"
              alt="BILANTIA"
              width={160}
              height={45}
              className="h-10 w-auto brightness-0 invert"
              priority
            />
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={prefersReducedMotion ? undefined : { opacity: 0 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <>
                    <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
                      Créez votre compte en quelques minutes
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                      Rejoignez les dirigeants qui pilotent leur entreprise avec confiance.
                    </p>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
                      Vos identifiants de connexion
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                      Un mot de passe sécurisé pour protéger vos données financières.
                    </p>
                  </>
                )}
                {currentStep === 3 && formData.role === 'dirigeant' && (
                  <>
                    <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
                      Identifiez votre entreprise
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                      Un simple numéro SIREN suffit pour récupérer automatiquement vos informations.
                    </p>
                  </>
                )}
                {currentStep === 3 && formData.role === 'comptable' && (
                  <>
                    <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
                      Configurez votre cabinet
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                      Gérez tous vos clients depuis une interface unique et intuitive.
                    </p>
                  </>
                )}
                {currentStep === 4 && (
                  <>
                    <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
                      Tout est prêt !
                    </h1>
                    <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                      Votre espace BILANTIA vous attend. Importez votre première liasse fiscale et
                      découvrez votre score.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-8 border-t border-white/10">
            <p className="text-sm text-slate-500 italic">
              "Comprendre ses finances, c'est maîtriser son avenir."
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-border flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/bilantia_logo.svg"
              alt="BILANTIA"
              width={120}
              height={35}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link href="/connexion" className="text-sm text-brand font-medium">
            Se connecter
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Plan indicator */}
            {plan !== 'free' && (
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium">
                  Plan {plan === 'essential' ? 'Essentiel' : plan === 'pro' ? 'Pro' : plan} - Essai gratuit
                </span>
              </div>
            )}

            <StepIndicator steps={steps} currentStep={currentStep} className="mb-6" />

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

            {/* Step content with animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={prefersReducedMotion ? undefined : slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {currentStep === 1 && (
                  <Step1Profile
                    formData={formData}
                    setFormData={setFormData}
                    onNext={() => goToStep(2)}
                  />
                )}
                {currentStep === 2 && (
                  <Step2Account
                    formData={formData}
                    setFormData={setFormData}
                    onNext={() => goToStep(3)}
                    onBack={() => goToStep(1)}
                  />
                )}
                {currentStep === 3 && (
                  <Step3Activity
                    formData={formData}
                    setFormData={setFormData}
                    onNext={() => goToStep(4)}
                    onBack={() => goToStep(2)}
                  />
                )}
                {currentStep === 4 && (
                  <Step4Welcome
                    formData={formData}
                    onComplete={handleComplete}
                    isSubmitting={isSubmitting}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Login link (desktop only) */}
            <p className="hidden lg:block mt-6 text-center text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Link
                href="/connexion"
                className="font-semibold text-brand hover:text-brand-light transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function InscriptionFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )
}

export default function InscriptionPage() {
  return (
    <Suspense fallback={<InscriptionFallback />}>
      <InscriptionContent />
    </Suspense>
  )
}
