'use client'

import { ArrowRight, CreditCard, Database, Shield } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const trustItems = [
  {
    icon: Shield,
    text: 'Données sécurisées',
  },
  {
    icon: Database,
    text: 'Sources officielles',
  },
  {
    icon: CreditCard,
    text: 'Aucune carte requise',
  },
]

export function CtaSection() {
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-80px' }

  return (
    <section className="relative bg-background overflow-hidden">
      {/* Transition gradient from previous dark section */}
      <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

      <div className="py-16 sm:py-20 lg:py-24">
        {/* Subtle background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Decorative glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.03) 0%, transparent 70%)',
            }}
          />
        </div>

      <motion.div
        className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
      >
        {/* Title */}
        <motion.h2
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight"
        >
          Prêt à voir clair dans vos finances ?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-4 text-lg sm:text-xl text-muted-foreground"
        >
          Commencez gratuitement. Sans engagement.{' '}
          <span className="text-brand font-medium">En 2 minutes.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Primary CTA */}
          <Link
            href="/inscription"
            className={cn(
              'group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white w-full sm:w-auto justify-center',
              'bg-brand hover:bg-brand-light',
              'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
              'transition-all duration-300',
              'hover:scale-[1.02] active:scale-[0.98]'
            )}
          >
            Analyser mon entreprise
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/tarifs"
            className={cn(
              'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold w-full sm:w-auto justify-center',
              'text-foreground border border-border',
              'hover:bg-muted hover:border-brand/30',
              'transition-all duration-300'
            )}
          >
            Découvrir les tarifs
          </Link>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={prefersReducedMotion ? undefined : itemVariants}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
        >
          {trustItems.map((item) => (
            <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
              <item.icon className="w-4 h-4 text-brand" />
              <span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
      </div>
    </section>
  )
}
