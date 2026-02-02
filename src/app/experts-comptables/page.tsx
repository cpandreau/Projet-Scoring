'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Clock,
  Presentation,
  Eye,
  Folders,
  Flame,
  Tag,
  LayoutDashboard,
  MonitorPlay,
  Upload,
  Link2,
} from 'lucide-react'
import { PublicLayout } from '@/components/public'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'

// Pain points data for accountants
const painPoints = [
  {
    icon: Clock,
    title: "Le temps d'analyse",
    description: 'Des heures passées à préparer chaque rendez-vous client',
  },
  {
    icon: Presentation,
    title: 'La présentation',
    description: 'Difficile de vulgariser pour que le client comprenne vraiment',
  },
  {
    icon: Eye,
    title: 'La valeur invisible',
    description: "Vos clients ne voient pas le travail d'analyse derrière les chiffres",
  },
  {
    icon: Folders,
    title: 'Le jonglage',
    description: "Passer d'un dossier à l'autre sans vue d'ensemble",
  },
  {
    icon: Flame,
    title: 'Les urgences',
    description: "Découvrir qu'un client est en difficulté quand c'est déjà critique",
  },
  {
    icon: Tag,
    title: 'La différenciation',
    description: 'Tous les cabinets proposent les mêmes services',
  },
]

// Transformation data (before/after)
const transformations = [
  {
    before: 'Analyse manuelle longue',
    after: 'Scoring automatisé en quelques secondes',
  },
  {
    before: 'Vulgarisation difficile',
    after: 'Vue client prête à présenter',
  },
  {
    before: 'Expertise invisible',
    after: 'Rapports visuels qui valorisent votre travail',
  },
  {
    before: 'Dossiers éparpillés',
    after: 'Dashboard consolidé de tous vos clients',
  },
  {
    before: 'Découverte tardive des problèmes',
    after: 'Alertes proactives sur votre portefeuille',
  },
]

// Features for accountants
const features = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard multi-clients',
    description: "Tous vos dossiers en un coup d'œil, triés par niveau de risque",
    color: 'text-brand',
    bgColor: 'bg-brand/10',
  },
  {
    icon: MonitorPlay,
    title: 'Vue présentation',
    description: 'Interface simplifiée à projeter pendant vos rendez-vous',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Upload,
    title: 'Upload batch',
    description: 'Importez plusieurs liasses en une seule opération',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Link2,
    title: 'Partage client',
    description: "Donnez accès à vos clients pour qu'ils voient leur score",
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
]

// Pricing summary
const pricingPlans = [
  {
    name: 'Solo',
    price: '79€',
    description: "Jusqu'à 15 clients",
  },
  {
    name: 'Cabinet',
    price: '199€',
    description: 'Clients illimités, 5 utilisateurs',
    popular: true,
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

export default function ExpertsComptablesPage() {
  const prefersReducedMotion = useReducedMotion()
  const viewportConfig = { once: true, margin: '-80px' }

  return (
    <PublicLayout headerVariant="transparent">
      {/* Hero Section - Dark */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
        {/* Dark background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay" />

        {/* Decorative hexagons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <FloatingHexagon
            className="absolute top-20 left-[10%] text-brand/[0.06]"
            size={100}
            delay={0}
            duration={9}
            strokeWidth={0.8}
          />
          <FloatingHexagon
            className="absolute bottom-24 right-[15%] text-brand/[0.05]"
            size={90}
            delay={2}
            duration={11}
            withBars
            strokeWidth={1}
          />
        </div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-semibold text-white leading-tight"
            >
              Experts-comptables,{' '}
              <span className="text-brand">valorisez votre expertise</span>
            </motion.h1>

            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Analysez en 2 minutes, présentez en 2 clics. Passez moins de temps sur les chiffres,
              plus sur le conseil.
            </motion.p>

            <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mt-10">
              <Link
                href="/inscription"
                className={cn(
                  'group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white',
                  'bg-brand hover:bg-brand-light',
                  'shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30',
                  'transition-all duration-300',
                  'hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                Découvrir BILANTIA pour les cabinets
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pain Points Section - Light */}
      <section className="relative bg-background overflow-hidden">
        <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

        <div className="py-16 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12 lg:mb-16"
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              <motion.h2
                variants={prefersReducedMotion ? undefined : itemVariants}
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground"
              >
                Le quotidien d'un cabinet...
              </motion.h2>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              {painPoints.map((point) => (
                <motion.div
                  key={point.title}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                  className="p-5 rounded-xl bg-muted/50 border border-border hover:border-brand/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <point.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="h-16 sm:h-24 bg-gradient-to-b from-background to-[#0A0E17]" />
      </section>

      {/* Transformation Section - Dark */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 lg:mb-16"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-white"
            >
              Transformez votre pratique
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-4"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {transformations.map((item, index) => (
              <motion.div
                key={index}
                variants={prefersReducedMotion ? undefined : itemVariants}
                className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-center"
              >
                {/* Before */}
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center md:text-right">
                  <p className="text-red-300 line-through opacity-75">{item.before}</p>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-brand" />
                </div>

                {/* After */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center md:text-left">
                  <p className="text-emerald-300 font-medium">{item.after}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section - Light */}
      <section className="relative bg-background overflow-hidden">
        <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

        <div className="py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12 lg:mb-16"
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              <motion.h2
                variants={prefersReducedMotion ? undefined : itemVariants}
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground"
              >
                Conçu pour les professionnels
              </motion.h2>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 gap-6 lg:gap-8"
              variants={prefersReducedMotion ? undefined : containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewportConfig}
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                  className="p-6 rounded-2xl bg-muted/30 border border-border hover:border-brand/20 transition-colors"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                      feature.bgColor
                    )}
                  >
                    <feature.icon className={cn('w-6 h-6', feature.color)} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        <div className="h-16 sm:h-24 bg-gradient-to-b from-background to-[#0A0E17]" />
      </section>

      {/* Pricing Summary Section - Dark */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-10"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-2xl sm:text-3xl font-display font-semibold text-white"
            >
              Des offres adaptées à votre cabinet
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-4 lg:gap-6"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={prefersReducedMotion ? undefined : itemVariants}
                className={cn(
                  'p-6 rounded-2xl text-center',
                  plan.popular
                    ? 'bg-brand/10 border-2 border-brand'
                    : 'bg-white/[0.03] border border-white/10'
                )}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand text-white mb-4">
                    Populaire
                  </span>
                )}
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold font-mono text-white">{plan.price}</span>
                  <span className="text-slate-400">/mois</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-8 text-center"
            variants={prefersReducedMotion ? undefined : itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <Link
              href="/tarifs"
              className="text-brand hover:text-brand-light font-medium transition-colors"
            >
              Voir tous les détails →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Final Section - Light */}
      <section className="relative bg-background overflow-hidden">
        <div className="h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background" />

        <div className="py-16 lg:py-24">
          <motion.div
            className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground"
            >
              Prêt à transformer votre cabinet ?
            </motion.h2>

            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Rejoignez les experts-comptables qui ont choisi d'augmenter leur valeur.
            </motion.p>

            <motion.div
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
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
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="mailto:contact@bilantia.fr"
                className={cn(
                  'inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold w-full sm:w-auto justify-center',
                  'text-foreground border border-border',
                  'hover:bg-muted hover:border-brand/30',
                  'transition-all duration-300'
                )}
              >
                Demander une démo
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}
