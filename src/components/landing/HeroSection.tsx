'use client'

import { ArrowRight, Check, ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'
import { ScoreVisual } from './ScoreVisual'

// Animation variants for staggered reveal
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
      delay: 0.3,
    },
  },
}

export function HeroSection() {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const [siren, setSiren] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSirenChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 9)
    setSiren(cleaned)
    setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (siren.length !== 9) {
      setError('Le SIREN doit contenir 9 chiffres')
      return
    }
    setIsSubmitting(true)
    router.push(`/inscription?siren=${siren}`)
  }

  // If reduced motion is preferred, use simpler variants
  const motionProps = prefersReducedMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : {}

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0A0E17 0%, #1E293B 50%, #0F172A 100%)',
        }}
      />

      {/* Grain texture overlay */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Decorative hexagons - hidden on small screens for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <FloatingHexagon
          className="absolute top-[15%] right-[10%] text-brand/[0.06]"
          size={180}
          delay={0}
          duration={8}
          strokeWidth={1}
        />
        <FloatingHexagon
          className="absolute top-[55%] right-[5%] text-brand/[0.04]"
          size={140}
          delay={3}
          duration={10}
          withBars
          strokeWidth={0.8}
        />
        <FloatingHexagon
          className="absolute top-[35%] right-[22%] text-brand/[0.05]"
          size={90}
          delay={1.5}
          duration={7}
          strokeWidth={1}
        />
      </div>

      {/* Radial glow - simplified for mobile */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full sm:w-[150%] sm:h-[150%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.04) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32 w-full">
        <div className="grid lg:grid-cols-[55%_45%] gap-10 lg:gap-8 items-center">
          {/* Left - Text content */}
          <motion.div
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            {...motionProps}
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full',
                'bg-white/5 border border-white/10 backdrop-blur-sm'
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              <span className="text-white/70 text-xs sm:text-sm font-medium">
                Intelligence financière PME/TPE
              </span>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 sm:mt-8 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]"
            >
              <span className="text-white">Arrêtez de deviner.</span>
              <br />
              <span className="text-gradient-brand">Commencez à voir.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              BILANTIA révèle la santé financière de votre entreprise en quelques minutes. Un score
              clair sur 10. Des alertes proactives. Zéro jargon.
            </motion.p>

            {/* SIREN Form */}
            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="mt-8 sm:mt-10">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto lg:mx-0">
                <div className="flex-1 relative">
                  <label htmlFor="siren-input" className="sr-only">
                    Numéro SIREN
                  </label>
                  <input
                    id="siren-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={siren}
                    onChange={(e) => handleSirenChange(e.target.value)}
                    placeholder="SIREN (9 chiffres)"
                    maxLength={9}
                    aria-describedby={error ? 'siren-error' : undefined}
                    aria-invalid={error ? 'true' : 'false'}
                    className={cn(
                      'w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl font-mono tracking-wider text-sm sm:text-base',
                      'bg-white/10 backdrop-blur-sm border text-white',
                      'placeholder:text-slate-400',
                      'focus:ring-2 focus:ring-brand/30 focus:border-brand',
                      'transition-all duration-200 outline-none',
                      error ? 'border-red-400/50' : 'border-white/20'
                    )}
                  />
                  {siren.length > 0 && (
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-slate-400">
                      {siren.length}/9
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-white whitespace-nowrap text-sm sm:text-base',
                    'bg-brand hover:bg-brand-light',
                    'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
                    'transition-all duration-300',
                    'hover:scale-[1.02] active:scale-[0.98]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'flex items-center justify-center gap-2'
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="hidden sm:inline">Analyse...</span>
                    </>
                  ) : (
                    <>
                      Analyser
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
              {error && (
                <p
                  id="siren-error"
                  role="alert"
                  className="mt-2 text-sm text-red-400 text-center lg:text-left"
                >
                  {error}
                </p>
              )}
            </motion.form>

            {/* Reassurance points - real facts only */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-6 gap-y-2"
            >
              {['Gratuit', 'Sans engagement', '2 minutes'].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400"
                >
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 flex-shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Score Visual */}
          <motion.div
            className="flex justify-center lg:justify-end order-first lg:order-last"
            variants={scaleVariants}
            initial="hidden"
            animate="visible"
            {...motionProps}
          >
            <ScoreVisual targetScore={8.4} maxScore={10} />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator - hidden on very small screens */}
      <motion.div
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="text-slate-400 text-sm">Découvrir</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-slate-400" />
        </motion.div>
      </motion.div>
    </section>
  )
}
