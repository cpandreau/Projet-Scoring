'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Calendar,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  TrendingUp,
  Building2,
  Gauge,
  Bell,
  MessageSquare,
  Users,
} from 'lucide-react'
import { PublicLayout } from '@/components/public'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'

// Pain points data
const painPoints = [
  {
    icon: Calendar,
    title: 'Le RDV annuel',
    description: 'Vous attendez votre rendez-vous comptable pour savoir où vous en êtes vraiment',
  },
  {
    icon: HelpCircle,
    title: 'Le flou permanent',
    description: 'Vous savez que "ça tourne" mais vous ignorez si vous êtes fragile ou solide',
  },
  {
    icon: FileSpreadsheet,
    title: 'Les tableaux illisibles',
    description: 'Vous recevez des chiffres que vous ne comprenez pas',
  },
  {
    icon: AlertTriangle,
    title: 'Les mauvaises surprises',
    description: "Vous découvrez les problèmes quand c'est déjà trop tard",
  },
  {
    icon: TrendingUp,
    title: "L'absence de projection",
    description: 'Impossible de savoir ce qui vous attend dans 6 mois',
  },
  {
    icon: Building2,
    title: 'Le stress bancaire',
    description: 'Vous ne savez pas comment présenter votre situation à votre banque',
  },
]

// Transformation data (before/after)
const transformations = [
  {
    before: 'Attendre le RDV annuel',
    after: 'Un tableau de bord toujours à jour',
  },
  {
    before: 'Chiffres incompréhensibles',
    after: 'Un score clair sur 10, en langage humain',
  },
  {
    before: 'Découvrir les problèmes trop tard',
    after: 'Des alertes proactives avant la crise',
  },
  {
    before: 'Naviguer à vue',
    after: 'Une projection à 12 mois de votre santé financière',
  },
  {
    before: 'Stresser avant le banquier',
    after: 'Un export professionnel pour convaincre',
  },
]

// Features for dirigeants
const features = [
  {
    icon: Gauge,
    title: 'Score instantané',
    description: 'Importez votre liasse fiscale, obtenez votre score en 2 minutes',
    color: 'text-brand',
    bgColor: 'bg-brand/10',
  },
  {
    icon: Bell,
    title: 'Alertes personnalisées',
    description: 'Soyez prévenu quand un indicateur passe en zone de risque',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Langage humain',
    description: 'Chaque ratio est expliqué simplement, sans jargon',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Users,
    title: 'Partagez avec votre comptable',
    description: 'Invitez-le à voir votre dossier pour des conseils contextualisés',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
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

export default function DirigeantsPage() {
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
            className="absolute top-20 right-[15%] text-brand/[0.06]"
            size={120}
            delay={0}
            duration={10}
            strokeWidth={0.8}
          />
          <FloatingHexagon
            className="absolute bottom-20 left-[10%] text-brand/[0.05]"
            size={80}
            delay={2}
            duration={8}
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
              Dirigeant de TPE/PME,{' '}
              <span className="text-brand">reprenez le contrôle</span> de vos finances
            </motion.h1>

            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto"
            >
              Comprenez la santé de votre entreprise sans attendre votre comptable. Anticipez les
              problèmes avant qu'ils n'arrivent.
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
                Analyser mon entreprise gratuitement
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
                Ces situations vous parlent ?
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
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                    <point.icon className="w-5 h-5 text-red-400" />
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
              Imaginez plutôt...
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
                Ce que BILANTIA vous apporte
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
      </section>

      {/* CTA Final Section */}
      <section className="py-16 lg:py-24 bg-background">
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
            Prêt à y voir clair ?
          </motion.h2>

          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-4 text-lg text-muted-foreground"
          >
            Rejoignez les dirigeants qui ont choisi de comprendre leurs finances.
          </motion.p>

          <motion.div variants={prefersReducedMotion ? undefined : itemVariants} className="mt-8">
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
              Commencer gratuitement
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </PublicLayout>
  )
}
