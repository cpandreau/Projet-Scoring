'use client'

import { ArrowRight, Bell, TrendingUp, Users } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'
import { DashboardPreview } from './DashboardPreview'

// Animation variants
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

const featureVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const keyFeatures = [
  {
    icon: Bell,
    title: 'Vous êtes alerté',
    description: 'quand un indicateur passe en zone de risque, avant que ça devienne un problème',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
  },
  {
    icon: Users,
    title: 'Vous êtes informé',
    description: 'quand un client ou fournisseur montre des signes de fragilité',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Vous êtes projeté',
    description: 'à 12 mois : si rien ne change, voici où vous serez',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
  },
]

export function SolutionSection() {
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-80px' }

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark background with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Decorative hexagons - hidden on mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <FloatingHexagon
          className="absolute top-20 right-[15%] text-brand/[0.04]"
          size={120}
          delay={0}
          duration={9}
          strokeWidth={0.8}
        />
        <FloatingHexagon
          className="absolute bottom-32 left-[8%] text-brand/[0.05]"
          size={80}
          delay={2}
          duration={7}
          withBars
          strokeWidth={1}
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.03) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[55%_45%] gap-12 lg:gap-8 items-center">
          {/* Left - Text content */}
          <motion.div
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {/* Title */}
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              BILANTIA, c'est votre tableau de bord de{' '}
              <span className="text-gradient-brand">santé financière.</span>
            </motion.h2>

            {/* Subtitle */}
            <motion.div
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-6 space-y-4"
            >
              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
                En quelques minutes, vous importez vos documents comptables. BILANTIA analyse,
                calcule et vous donne un score clair sur 10.
              </p>
              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
                Pas de jargon. Pas de tableaux à déchiffrer.{' '}
                <span className="text-white font-medium">Une réponse.</span>
              </p>
            </motion.div>

            {/* Key features */}
            <motion.div
              variants={prefersReducedMotion ? undefined : containerVariants}
              className="mt-10 space-y-4"
            >
              {keyFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={prefersReducedMotion ? undefined : featureVariants}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors duration-300"
                >
                  <div
                    className={cn(
                      'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                      feature.bgColor
                    )}
                  >
                    <feature.icon className={cn('w-5 h-5', feature.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-slate-400 text-sm mt-0.5 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-10"
            >
              <Link
                href="/inscription"
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white',
                  'bg-brand hover:bg-brand-light',
                  'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
                  'transition-all duration-300',
                  'hover:scale-[1.02] active:scale-[0.98]',
                  'group'
                )}
              >
                Analyser mon entreprise
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <div className="lg:pl-8 order-first lg:order-last">
            <DashboardPreview className="max-w-md mx-auto lg:max-w-none" />
          </div>
        </div>
      </div>

      {/* Connecting line decoration - hidden on mobile */}
      <div className="absolute left-8 top-1/3 bottom-1/3 w-px bg-gradient-to-b from-transparent via-brand/20 to-transparent hidden xl:block" />
    </section>
  )
}
