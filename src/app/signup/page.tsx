'use client'

import { Suspense, useState, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  FileUp,
  Loader2,
  Mail,
  Search,
  Upload,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3

interface FormData {
  email: string
  password: string
  fullName: string
  siren: string
  companyName: string
  document: File | null
}

const steps = [
  { number: 1, title: 'Votre compte', icon: User },
  { number: 2, title: 'Votre entreprise', icon: Building2 },
  { number: 3, title: 'Première analyse', icon: FileUp },
]

function ProgressBar({ currentStep }: { currentStep: Step }) {
  return (
    <div className="mb-8">
      {/* Steps */}
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  currentStep > step.number
                    ? 'bg-emerald-500 text-white'
                    : currentStep === step.number
                      ? 'bg-[#B8860B] text-white shadow-lg shadow-[#B8860B]/30'
                      : 'bg-slate-100 text-slate-400'
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={cn(
                  'hidden sm:block text-sm font-medium transition-colors',
                  currentStep >= step.number ? 'text-[#0F172A]' : 'text-slate-400'
                )}
              >
                {step.title}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-12 sm:w-16 h-0.5 mx-2 transition-colors duration-500',
                  currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Step1Account({
  formData,
  setFormData,
  onNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onNext: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Le nom est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[var(--font-dm-serif)] text-[#0F172A]">
          Créez votre compte
        </h2>
        <p className="mt-2 text-slate-500">
          Commencez à analyser la santé de votre entreprise
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
          Nom complet
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Jean Dupont"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-[#0F172A] placeholder:text-slate-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]',
              errors.fullName ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
          Email professionnel
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jean.dupont@entreprise.fr"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-[#0F172A] placeholder:text-slate-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]',
              errors.email ? 'border-red-300' : 'border-slate-200'
            )}
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="8 caractères minimum"
            className={cn(
              'w-full pl-4 pr-12 py-3 rounded-xl border bg-white text-[#0F172A] placeholder:text-slate-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]',
              errors.password ? 'border-red-300' : 'border-slate-200'
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-3.5 rounded-xl bg-[#B8860B] text-white font-semibold transition-all duration-300 hover:bg-[#8B6914] hover:shadow-lg hover:shadow-[#B8860B]/20 flex items-center justify-center gap-2"
      >
        Continuer
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Terms */}
      <p className="text-center text-xs text-slate-500">
        En continuant, vous acceptez nos{' '}
        <Link href="/terms" className="text-[#B8860B] hover:underline">
          conditions d&apos;utilisation
        </Link>{' '}
        et notre{' '}
        <Link href="/privacy" className="text-[#B8860B] hover:underline">
          politique de confidentialité
        </Link>
      </p>
    </form>
  )
}

function Step2Company({
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

  const searchCompany = useCallback(() => {
    if (!formData.siren.trim() || formData.siren.length !== 9) {
      setError('Le SIREN doit contenir 9 chiffres')
      return
    }

    setError('')
    startSearching(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock response
      if (formData.siren === '123456789') {
        setError('Entreprise non trouvée')
        setIsFound(false)
      } else {
        setFormData((prev) => ({
          ...prev,
          companyName: 'Entreprise Demo SARL',
        }))
        setIsFound(true)
      }
    })
  }, [formData.siren, setFormData])

  const handleSirenChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9)
    setFormData({ ...formData, siren: cleaned, companyName: '' })
    setIsFound(false)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFound) {
      onNext()
    } else {
      searchCompany()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[var(--font-dm-serif)] text-[#0F172A]">
          Identifiez votre entreprise
        </h2>
        <p className="mt-2 text-slate-500">
          Nous récupérons automatiquement les informations
        </p>
      </div>

      {/* SIREN */}
      <div>
        <label htmlFor="siren" className="block text-sm font-medium text-slate-700 mb-2">
          Numéro SIREN
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="siren"
            type="text"
            inputMode="numeric"
            value={formData.siren}
            onChange={(e) => handleSirenChange(e.target.value)}
            placeholder="123 456 789"
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-[#0F172A] placeholder:text-slate-400 transition-all duration-200 font-mono tracking-wider',
              'focus:outline-none focus:ring-2 focus:ring-[#B8860B]/20 focus:border-[#B8860B]',
              error ? 'border-red-300' : isFound ? 'border-emerald-300' : 'border-slate-200'
            )}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B8860B] animate-spin" />
          )}
          {isFound && !isSearching && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        <p className="mt-1 text-xs text-slate-400">
          Le SIREN est un identifiant unique à 9 chiffres
        </p>
      </div>

      {/* Company found */}
      {isFound && formData.companyName && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">{formData.companyName}</p>
              <p className="text-sm text-slate-500">SIREN: {formData.siren}</p>
            </div>
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-medium transition-all duration-300 hover:bg-slate-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="submit"
          disabled={isSearching}
          className="flex-1 py-3.5 rounded-xl bg-[#B8860B] text-white font-semibold transition-all duration-300 hover:bg-[#8B6914] hover:shadow-lg hover:shadow-[#B8860B]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

function Step3Document({
  formData,
  setFormData,
  onBack,
  onSubmit,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  onBack: () => void
  onSubmit: () => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, startSubmitting] = useTransition()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, document: file })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, document: file })
    }
  }

  const handleSubmit = () => {
    startSubmitting(async () => {
      // Simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000))
      onSubmit()
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-[var(--font-dm-serif)] text-[#0F172A]">
          Première analyse
        </h2>
        <p className="mt-2 text-slate-500">
          Importez votre liasse fiscale pour obtenir votre diagnostic
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8 transition-all duration-300 text-center',
          isDragging
            ? 'border-[#B8860B] bg-[#B8860B]/5'
            : formData.document
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
        )}
      >
        {formData.document ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-[#0F172A]">{formData.document.name}</p>
              <p className="text-sm text-slate-500">
                {(formData.document.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, document: null })}
              className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-medium text-[#0F172A]">
                Glissez votre liasse fiscale ici
              </p>
              <p className="text-sm text-slate-500">ou</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4" />
              Parcourir les fichiers
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-slate-400">Format PDF uniquement</p>
          </div>
        )}
      </div>

      {/* Skip option */}
      <p className="text-center text-sm text-slate-500">
        Vous pourrez aussi importer votre liasse fiscale plus tard depuis votre tableau de bord.
      </p>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3.5 rounded-xl border border-slate-200 text-slate-700 font-medium transition-all duration-300 hover:bg-slate-50 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 py-3.5 rounded-xl bg-[#B8860B] text-white font-semibold transition-all duration-300 hover:bg-[#8B6914] hover:shadow-lg hover:shadow-[#B8860B]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Création du compte...
            </>
          ) : formData.document ? (
            <>
              Lancer l&apos;analyse
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Terminer l&apos;inscription
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    fullName: '',
    siren: '',
    companyName: '',
    document: null,
  })

  const handleComplete = () => {
    // In production, this would create the account and redirect
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-[var(--font-dm-sans)]">
      {/* Header */}
      <header className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="transition-transform duration-300 group-hover:scale-105"
              >
                <circle cx="16" cy="16" r="15" stroke="#0F172A" strokeWidth="1.5" fill="none" />
                <path
                  d="M8 20L16 12L24 20"
                  stroke="#B8860B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="12" r="2" fill="#B8860B" />
              </svg>
              <span className="font-[var(--font-dm-serif)] text-xl text-[#0F172A] tracking-tight">
                BILANTIA
              </span>
            </Link>

            <Link
              href="/login"
              className="text-sm text-slate-600 hover:text-[#0F172A] transition-colors"
            >
              Déjà un compte ? <span className="font-semibold text-[#B8860B]">Se connecter</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="py-8 sm:py-12">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          {/* Plan indicator */}
          {plan !== 'free' && (
            <div className="mb-6 text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B8860B]/10 text-[#B8860B] text-sm font-medium">
                Plan {plan === 'essential' ? 'Essentiel' : 'Pro'} - Essai gratuit 14 jours
              </span>
            </div>
          )}

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <ProgressBar currentStep={currentStep} />

            {/* Step content */}
            <div className="min-h-[400px]">
              {currentStep === 1 && (
                <Step1Account
                  formData={formData}
                  setFormData={setFormData}
                  onNext={() => setCurrentStep(2)}
                />
              )}
              {currentStep === 2 && (
                <Step2Company
                  formData={formData}
                  setFormData={setFormData}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                />
              )}
              {currentStep === 3 && (
                <Step3Document
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setCurrentStep(2)}
                  onSubmit={handleComplete}
                />
              )}
            </div>
          </div>

          {/* Help text */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Besoin d&apos;aide ?{' '}
            <Link href="/contact" className="text-[#B8860B] hover:underline">
              Contactez-nous
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function SignupFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#B8860B] animate-spin" />
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupContent />
    </Suspense>
  )
}
