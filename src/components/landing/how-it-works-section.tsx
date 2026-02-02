'use client'

import { BarChart3, FileUp, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

const steps = [
  {
    number: 1,
    icon: FileUp,
    title: 'Importez',
    description: 'Glissez votre liasse fiscale ou entrez simplement votre SIREN',
  },
  {
    number: 2,
    icon: Sparkles,
    title: 'Analysez',
    description: 'Notre IA extrait et calcule plus de 30 ratios automatiquement',
  },
  {
    number: 3,
    icon: BarChart3,
    title: 'Comprenez',
    description: 'Score sur 10, alertes, comparaison sectorielle — tout est clair',
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const stepVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const verticalLineVariants = {
  hidden: { scaleY: 0 },
  visible: {
    scaleY: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

export function HowItWorksSection() {
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-80px' }

  return (
    <section id="how-it-works" className="relative bg-background overflow-hidden">
      {/* Transition gradient from previous dark section */}
      <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

      <div className="py-16 sm:py-20 lg:py-24">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            className="text-center max-w-2xl mx-auto mb-16 lg:mb-20"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight"
            >
              Comment ça marche
            </motion.h2>

            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-4 text-lg sm:text-xl text-muted-foreground"
            >
              Trois étapes. Deux minutes. Zéro complexité.
            </motion.p>
          </motion.div>

        {/* Steps - Desktop horizontal layout */}
        <div className="hidden lg:block">
          <motion.div
            className="relative"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {/* Connection lines */}
            <div className="absolute top-16 left-0 right-0 flex items-center justify-center pointer-events-none">
              <div className="flex items-center w-full max-w-3xl px-24">
                {/* Line 1→2 */}
                <motion.div
                  className="flex-1 h-0.5 bg-gradient-to-r from-brand/30 via-brand to-brand/30 origin-left"
                  variants={prefersReducedMotion ? undefined : lineVariants}
                />
                {/* Line 2→3 */}
                <div className="w-32" /> {/* Gap for middle step */}
                <motion.div
                  className="flex-1 h-0.5 bg-gradient-to-r from-brand/30 via-brand to-brand/30 origin-left"
                  variants={prefersReducedMotion ? undefined : lineVariants}
                />
              </div>
            </div>

            {/* Steps grid */}
            <div className="grid grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={prefersReducedMotion ? undefined : stepVariants}
                  className="relative text-center"
                >
                  {/* Number + Icon container */}
                  <div className="relative inline-flex mb-8">
                    {/* Hexagonal-inspired badge */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-2xl bg-bg-surface border border-border shadow-lg flex items-center justify-center">
                        <step.icon className="w-10 h-10 text-brand" />
                      </div>
                      {/* Number badge */}
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-brand/30">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-text mb-2">{step.title}</h3>
                  <p className="text-text-muted leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Steps - Mobile/Tablet vertical layout */}
        <div className="lg:hidden">
          <motion.div
            className="relative"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  variants={prefersReducedMotion ? undefined : stepVariants}
                  className="relative"
                >
                  {/* Vertical connector line (except for last item) */}
                  {index < steps.length - 1 && (
                    <motion.div
                      className="absolute left-8 top-24 w-0.5 h-16 bg-gradient-to-b from-brand to-brand/20 origin-top"
                      variants={prefersReducedMotion ? undefined : verticalLineVariants}
                    />
                  )}

                  {/* Step card */}
                  <div className="flex items-start gap-5">
                    {/* Number + Icon */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-bg-surface border border-border shadow-md flex items-center justify-center">
                        <step.icon className="w-7 h-7 text-brand" />
                      </div>
                      {/* Number badge */}
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand/30">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="pt-1">
                      <h3 className="text-lg font-semibold text-text mb-1">{step.title}</h3>
                      <p className="text-text-muted text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom accent */}
        <motion.div
          className="mt-16 lg:mt-20 flex justify-center"
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-brand/5 border border-brand/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-text-muted">
              Vos données restent{' '}
              <span className="text-text font-medium">100% confidentielles</span>
            </span>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Transition gradient to next dark section */}
      <div className="h-16 sm:h-24 bg-gradient-to-b from-background to-[#0A0E17]" />
    </section>
  )
}
