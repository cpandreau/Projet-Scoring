'use client'

import { Compass, Lightbulb, Link2, Radar, Target } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'

const pillars = [
  {
    icon: Compass,
    signature: 'Le GPS financier',
    title: 'Intelligence Prédictive',
    description:
      'Voir où vous allez, pas juste où vous êtes. Score projeté à 12 mois, alertes de tendance.',
    color: 'brand',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    hoverBorder: 'hover:border-brand/50',
  },
  {
    icon: Radar,
    signature: "Votre radar d'alerte",
    title: 'Écosystème de Risque',
    description:
      "Surveillez vos clients et fournisseurs. Soyez prévenu si l'un d'eux montre des signes de fragilité.",
    color: 'blue',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    icon: Lightbulb,
    signature: 'Zéro jargon',
    title: 'Simplicité Radicale',
    description: 'Chaque ratio est traduit en langage humain. Vous comprenez sans être expert.',
    color: 'emerald',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    icon: Target,
    signature: 'Chaque problème, une piste',
    title: 'Actionnable',
    description: 'Pas juste un diagnostic : des suggestions concrètes pour agir.',
    color: 'amber',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    hoverBorder: 'hover:border-amber-500/50',
  },
  {
    icon: Link2,
    signature: 'Le pont comptable-dirigeant',
    title: 'Collaboration',
    description:
      "Partagez l'accès avec votre comptable. Améliorez la relation, ne la remplacez pas.",
    color: 'violet',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/50',
  },
]

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

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

export function FeaturesSection() {
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-80px' }

  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Dark background with gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Decorative hexagons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
        <FloatingHexagon
          className="absolute top-16 left-[8%] text-brand/[0.04]"
          size={100}
          delay={0}
          duration={8}
          strokeWidth={0.8}
        />
        <FloatingHexagon
          className="absolute bottom-24 right-[12%] text-brand/[0.05]"
          size={80}
          delay={2}
          duration={9}
          withBars
          strokeWidth={1}
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[60%] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          <motion.h2
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white leading-tight"
          >
            Ce qui fait la différence
          </motion.h2>

          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto"
          >
            BILANTIA n'est pas juste un tableau de chiffres.
            C'est votre copilote financier.
          </motion.p>
        </motion.div>

        {/* Pillars grid - 3 columns top, 2 centered bottom */}
        <motion.div
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
        >
          {/* Top row - 3 pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {pillars.slice(0, 3).map((pillar) => (
              <PillarCard
                key={pillar.title}
                pillar={pillar}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* Bottom row - 2 pillars centered */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8 lg:max-w-2xl lg:mx-auto">
            {pillars.slice(3).map((pillar) => (
              <PillarCard
                key={pillar.title}
                pillar={pillar}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

interface PillarCardProps {
  pillar: (typeof pillars)[number]
  prefersReducedMotion: boolean | null
}

function PillarCard({ pillar, prefersReducedMotion }: PillarCardProps) {
  return (
    <motion.div
      variants={prefersReducedMotion ? undefined : cardVariants}
      className="group relative"
    >
      <div
        className={cn(
          'relative h-full p-6 lg:p-8 rounded-2xl',
          'bg-white/[0.03] backdrop-blur-sm',
          'border border-white/10',
          pillar.hoverBorder,
          'transition-all duration-300',
          'hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-black/20',
          'hover:-translate-y-1'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-xl',
            pillar.iconBg,
            'mb-5 transition-transform duration-300 group-hover:scale-110'
          )}
        >
          <pillar.icon className={cn('w-6 h-6', pillar.iconColor)} />
        </div>

        {/* Signature/Catchphrase */}
        <p className="text-sm text-brand italic mb-2">"{pillar.signature}"</p>

        {/* Title */}
        <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">{pillar.title}</h3>

        {/* Description */}
        <p className="text-slate-400 text-sm lg:text-base leading-relaxed">{pillar.description}</p>

        {/* Subtle glow on hover */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10',
            pillar.color === 'brand' && 'bg-brand/5',
            pillar.color === 'blue' && 'bg-blue-500/5',
            pillar.color === 'emerald' && 'bg-emerald-500/5',
            pillar.color === 'amber' && 'bg-amber-500/5',
            pillar.color === 'violet' && 'bg-violet-500/5'
          )}
        />
      </div>
    </motion.div>
  )
}
