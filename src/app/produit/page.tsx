'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Check,
  Compass,
  Lightbulb,
  Link2,
  Radar,
  Target,
  TrendingUp,
  Shield,
  BarChart3,
  Zap,
  Users,
} from 'lucide-react'
import { PublicLayout } from '@/components/public'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { cn } from '@/lib/utils'

// Pillar data
const pillars = [
  {
    id: 'predictif',
    icon: Compass,
    label: 'Prédictif',
    signature: 'Le GPS financier',
    title: 'Voyez où vous allez, pas juste où vous êtes',
    description:
      "BILANTIA ne se contente pas de photographier votre situation. Il projette votre trajectoire pour anticiper les risques avant qu'ils ne deviennent des problèmes.",
    color: 'brand',
    iconBg: 'bg-brand/10',
    iconColor: 'text-brand',
    features: [
      {
        title: 'Score projeté à 12 mois',
        description: 'Si rien ne change, voici votre score futur',
      },
      {
        title: 'Alertes de tendance',
        description: '"Votre trésorerie baisse depuis 3 mois"',
      },
      {
        title: 'Détection de saisonnalité',
        description: 'Identifiez vos mois historiquement tendus',
      },
      {
        title: 'Scénarios "What if"',
        description: '"Si je perds ce client, mon score passe à X"',
        badge: 'Pro',
      },
    ],
  },
  {
    id: 'ecosysteme',
    icon: Radar,
    label: 'Écosystème',
    signature: "Votre radar d'alerte",
    title: 'Surveillez votre réseau, pas juste votre entreprise',
    description:
      'Vos clients et fournisseurs peuvent fragiliser votre entreprise. BILANTIA surveille leur santé pour vous prévenir à temps.',
    color: 'blue',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    features: [
      {
        title: 'Réseau surveillé',
        description: 'Ajoutez vos 10 principaux clients et fournisseurs',
      },
      {
        title: 'Alertes BODACC',
        description: 'Soyez prévenu si un partenaire entre en procédure collective',
      },
      {
        title: 'Score de concentration',
        description: '"40% de votre CA dépend d\'un seul client"',
      },
      {
        title: 'Détection automatique',
        description: 'Extraction du réseau depuis votre FEC',
        badge: 'Bientôt',
      },
    ],
  },
  {
    id: 'simplicite',
    icon: Lightbulb,
    label: 'Simple',
    signature: 'Zéro jargon',
    title: 'Comprenez vos chiffres sans être expert',
    description:
      "Chaque ratio, chaque indicateur est traduit en langage humain. Vous savez immédiatement si c'est bien, normal ou inquiétant pour votre secteur.",
    color: 'emerald',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    features: [
      {
        title: 'Traduction humaine',
        description: 'Chaque ratio a une explication simple',
      },
      {
        title: 'Contextualisation',
        description: '"Normal", "Inquiétant", "Excellent" pour votre secteur',
      },
      {
        title: 'Vue dirigeant',
        description: '5 blocs clairs, pas 50 ratios incompréhensibles',
      },
      {
        title: 'Glossaire intégré',
        description: 'Survolez un terme pour comprendre',
      },
    ],
    examples: [
      {
        jargon: 'Ratio liquidité : 1.23',
        simple: 'Vous pouvez couvrir vos dettes court terme. C\'est bien.',
      },
      {
        jargon: 'BFR : 45 000 €',
        simple: 'Vous avez besoin de 45 000 € pour financer votre activité. C\'est normal pour votre taille.',
      },
    ],
  },
  {
    id: 'actionnable',
    icon: Target,
    label: 'Action',
    signature: 'Chaque problème, une piste',
    title: 'Savoir quoi faire, pas juste constater',
    description:
      "Un diagnostic sans suite ne sert à rien. BILANTIA vous donne des pistes d'action concrètes pour chaque problème identifié.",
    color: 'amber',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    features: [
      {
        title: 'Suggestions par ratio',
        description: "Au moins une piste d'action par problème détecté",
      },
      {
        title: 'Lien RDV comptable',
        description: 'Demandez un rendez-vous avec tout le contexte inclus',
      },
      {
        title: 'Objectifs & suivi',
        description: 'Définissez un objectif, suivez votre progression',
        badge: 'Bientôt',
      },
      {
        title: 'Mode banquier',
        description: 'Export adapté pour convaincre votre banque',
        badge: 'Bientôt',
      },
    ],
  },
  {
    id: 'collaboration',
    icon: Link2,
    label: 'Collab',
    signature: 'Le pont comptable-dirigeant',
    title: 'Améliorez la relation, ne la remplacez pas',
    description:
      "BILANTIA n'est pas là pour remplacer votre comptable. Il valorise son expertise en facilitant la communication et le conseil.",
    color: 'violet',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    features: [
      {
        title: "Partage d'accès",
        description: 'Invitez votre comptable à voir votre dossier',
      },
      {
        title: 'Vue présentation',
        description: 'Interface simplifiée que le comptable peut montrer au client',
      },
      {
        title: 'RDV contextualisé',
        description: 'Demande de rendez-vous avec score, alertes et questions',
      },
      {
        title: 'Historique partagé',
        description: 'Notes et échanges conservés',
        badge: 'Bientôt',
      },
    ],
  },
]

// Ratio families for methodology section
const ratioFamilies = [
  {
    name: 'Liquidité',
    weight: 30,
    description: 'Capacité à payer les dettes court terme',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    name: 'Rentabilité',
    weight: 20,
    description: 'Performance économique et commerciale',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    name: 'Solvabilité',
    weight: 20,
    description: 'Capacité à rembourser les dettes long terme',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    name: 'Activité',
    weight: 15,
    description: 'Efficacité opérationnelle',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
  },
  {
    name: 'Évolution',
    weight: 15,
    description: 'Dynamique de croissance',
    color: 'text-brand',
    bgColor: 'bg-brand/10',
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

export default function ProduitPage() {
  const [activeSection, setActiveSection] = useState('predictif')
  const [isNavSticky, setIsNavSticky] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      // Check if nav should be sticky
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top
        setIsNavSticky(navTop <= 72) // Header height
      }

      // Find active section
      const sections = pillars.map((p) => document.getElementById(p.id))
      const scrollPosition = window.scrollY + 200

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(pillars[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 140 // Header + nav height
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const viewportConfig = { once: true, margin: '-100px' }

  return (
    <PublicLayout headerVariant="solid">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 bg-background overflow-hidden">
        <motion.div
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight"
          >
            Tout ce dont vous avez besoin pour comprendre votre santé financière
          </motion.h1>
          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            BILANTIA combine analyse intelligente, alertes proactives et simplicité radicale pour
            vous donner une vision claire de votre entreprise.
          </motion.p>
        </motion.div>
      </section>

      {/* Sticky Navigation */}
      <div ref={navRef} className="relative z-30">
        <nav
          className={cn(
            'transition-all duration-300',
            isNavSticky
              ? 'fixed top-[72px] left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
              : 'bg-muted/30 border-y border-border'
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-1 sm:gap-2 py-3 overflow-x-auto scrollbar-hide">
              {pillars.map((pillar) => (
                <button
                  key={pillar.id}
                  onClick={() => scrollToSection(pillar.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
                    activeSection === pillar.id
                      ? 'bg-brand text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <pillar.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{pillar.label}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
        {/* Spacer when nav is sticky */}
        {isNavSticky && <div className="h-[60px]" />}
      </div>

      {/* Pillar Sections */}
      {pillars.map((pillar, index) => (
        <PillarSection
          key={pillar.id}
          pillar={pillar}
          index={index}
          prefersReducedMotion={prefersReducedMotion}
          viewportConfig={viewportConfig}
        />
      ))}

      {/* Methodology Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        {/* Dark background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />
        <div className="absolute inset-0 noise-overlay" />

        {/* Decorative hexagons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block">
          <FloatingHexagon
            className="absolute top-20 right-[10%] text-brand/[0.05]"
            size={100}
            delay={0}
            duration={10}
            strokeWidth={0.8}
          />
          <FloatingHexagon
            className="absolute bottom-20 left-[15%] text-brand/[0.04]"
            size={80}
            delay={3}
            duration={8}
            withBars
            strokeWidth={1}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-white"
            >
              Une méthodologie rigoureuse
            </motion.h2>
            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto"
            >
              BILANTIA s'appuie sur les mêmes standards que les analystes financiers professionnels.
            </motion.p>
          </motion.div>

          {/* 5 Families Grid */}
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-16"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {ratioFamilies.map((family) => (
              <motion.div
                key={family.name}
                variants={prefersReducedMotion ? undefined : itemVariants}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors"
              >
                <div className={cn('text-3xl font-bold font-mono', family.color)}>
                  {family.weight}%
                </div>
                <h3 className="mt-2 font-semibold text-white">{family.name}</h3>
                <p className="mt-1 text-sm text-slate-400">{family.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Data Sources */}
          <motion.div
            className="text-center"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h3
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-lg font-semibold text-white mb-6"
            >
              Sources de données officielles
            </motion.h3>
            <motion.div
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-10"
            >
              {[
                { name: 'INPI', desc: 'Registre national' },
                { name: 'INSEE', desc: 'Données SIRENE' },
                { name: 'Banque de France', desc: 'Seuils sectoriels' },
              ].map((source) => (
                <div key={source.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-brand" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{source.name}</p>
                    <p className="text-xs text-slate-500">{source.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
              Prêt à voir votre entreprise autrement ?
            </motion.h2>

            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="mt-4 text-lg text-muted-foreground"
            >
              Commencez gratuitement et découvrez votre score en quelques minutes.
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
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  )
}

// Pillar Section Component
interface PillarSectionProps {
  pillar: (typeof pillars)[number]
  index: number
  prefersReducedMotion: boolean | null
  viewportConfig: { once: boolean; margin: string }
}

function PillarSection({ pillar, index, prefersReducedMotion, viewportConfig }: PillarSectionProps) {
  const isDark = index % 2 === 1
  const isReversed = index % 2 === 1

  return (
    <section
      id={pillar.id}
      className={cn('relative py-20 lg:py-28 overflow-hidden', isDark ? '' : 'bg-background')}
    >
      {/* Dark background for odd sections */}
      {isDark && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
            }}
          />
          <div className="absolute inset-0 noise-overlay" />
        </>
      )}

      {/* Transition gradients */}
      {!isDark && index > 0 && (
        <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-[#0A0E17] to-background -mt-16 sm:-mt-24" />
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid lg:grid-cols-2 gap-12 lg:gap-16 items-center',
            isReversed && 'lg:grid-flow-dense'
          )}
        >
          {/* Text Content */}
          <motion.div
            className={isReversed ? 'lg:col-start-2' : ''}
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {/* Icon + Signature */}
            <motion.div
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="flex items-center gap-3 mb-4"
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  pillar.iconBg
                )}
              >
                <pillar.icon className={cn('w-6 h-6', pillar.iconColor)} />
              </div>
              <span className={cn('text-sm font-medium italic', isDark ? 'text-brand' : 'text-brand')}>
                "{pillar.signature}"
              </span>
            </motion.div>

            {/* Title */}
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className={cn(
                'text-2xl sm:text-3xl lg:text-4xl font-display font-semibold leading-tight',
                isDark ? 'text-white' : 'text-foreground'
              )}
            >
              {pillar.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              variants={prefersReducedMotion ? undefined : itemVariants}
              className={cn(
                'mt-4 text-lg leading-relaxed',
                isDark ? 'text-slate-300' : 'text-muted-foreground'
              )}
            >
              {pillar.description}
            </motion.p>

            {/* Features List */}
            <motion.ul
              variants={prefersReducedMotion ? undefined : containerVariants}
              className="mt-8 space-y-4"
            >
              {pillar.features.map((feature) => (
                <motion.li
                  key={feature.title}
                  variants={prefersReducedMotion ? undefined : itemVariants}
                  className="flex items-start gap-3"
                >
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      isDark ? 'bg-brand/20' : 'bg-brand/10'
                    )}
                  >
                    <Check className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <div>
                    <span
                      className={cn(
                        'font-medium',
                        isDark ? 'text-white' : 'text-foreground'
                      )}
                    >
                      {feature.title}
                    </span>
                    {'badge' in feature && feature.badge && (
                      <span
                        className={cn(
                          'ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                          feature.badge === 'Pro'
                            ? 'bg-brand/20 text-brand'
                            : 'bg-slate-500/20 text-slate-400'
                        )}
                      >
                        {feature.badge}
                      </span>
                    )}
                    <span className={cn('block text-sm', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
                      {feature.description}
                    </span>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            {/* Translation Examples (for Simplicité pillar) */}
            {pillar.examples && (
              <motion.div
                variants={prefersReducedMotion ? undefined : itemVariants}
                className="mt-8 p-5 rounded-xl bg-muted/50 border border-border"
              >
                <p className="text-sm font-medium text-foreground mb-4">Exemple de traduction :</p>
                <div className="space-y-4">
                  {pillar.examples.map((ex, i) => (
                    <div key={i} className="grid sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Ailleurs</p>
                        <p className="text-sm text-red-700 dark:text-red-300 font-mono">{ex.jargon}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">BILANTIA</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">{ex.simple}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Visual Placeholder */}
          <motion.div
            className={isReversed ? 'lg:col-start-1' : ''}
            initial={prefersReducedMotion ? undefined : { opacity: 0, x: isReversed ? -30 : 30 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <PillarVisual pillar={pillar} isDark={isDark} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Visual placeholder component
function PillarVisual({
  pillar,
  isDark,
}: {
  pillar: (typeof pillars)[number]
  isDark: boolean
}) {
  const bgClass = isDark ? 'bg-white/[0.03]' : 'bg-muted/50'
  const borderClass = isDark ? 'border-white/10' : 'border-border'

  // Different visual for each pillar
  if (pillar.id === 'predictif') {
    return (
      <div className={cn('rounded-2xl p-6 lg:p-8', bgClass, 'border', borderClass)}>
        {/* Score projection chart mockup */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
              Score projeté
            </span>
            <span className={cn('text-xs px-2 py-1 rounded', isDark ? 'bg-brand/20 text-brand' : 'bg-brand/10 text-brand')}>
              +12 mois
            </span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {[6.2, 6.5, 6.3, 6.8, 7.1, 7.0, 7.4, 7.2, null, null, null, null].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'w-full rounded-t',
                    val
                      ? 'bg-brand'
                      : 'bg-brand/30 border-2 border-dashed border-brand/50'
                  )}
                  style={{ height: val ? `${(val / 10) * 100}%` : '70%' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Aujourd'hui</span>
            <span>Dans 12 mois</span>
          </div>
        </div>
      </div>
    )
  }

  if (pillar.id === 'ecosysteme') {
    return (
      <div className={cn('rounded-2xl p-6 lg:p-8', bgClass, 'border', borderClass)}>
        {/* Network visualization mockup */}
        <div className="relative h-48">
          {/* Center node */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-brand/20 border-2 border-brand flex items-center justify-center">
            <span className="text-brand font-bold text-sm">Vous</span>
          </div>
          {/* Satellite nodes */}
          {[
            { x: '20%', y: '20%', label: 'Client A', status: 'green' },
            { x: '75%', y: '25%', label: 'Client B', status: 'green' },
            { x: '15%', y: '70%', label: 'Fournisseur', status: 'amber' },
            { x: '80%', y: '65%', label: 'Client C', status: 'green' },
            { x: '50%', y: '85%', label: 'Client D', status: 'red' },
          ].map((node, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium',
                  node.status === 'green' && 'bg-emerald-500/20 text-emerald-400',
                  node.status === 'amber' && 'bg-amber-500/20 text-amber-400',
                  node.status === 'red' && 'bg-red-500/20 text-red-400'
                )}
              >
                <Users className="w-4 h-4" />
              </div>
            </div>
          ))}
          {/* Connection lines (SVG would be better, simplified here) */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: -1 }}>
            <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="15%" y2="70%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="80%" y2="65%" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
            <line x1="50%" y1="50%" x2="50%" y2="85%" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="4" strokeWidth="1" />
          </svg>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className={isDark ? 'text-slate-400' : 'text-muted-foreground'}>Sain</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className={isDark ? 'text-slate-400' : 'text-muted-foreground'}>Attention</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <span className={isDark ? 'text-slate-400' : 'text-muted-foreground'}>Alerte</span>
          </div>
        </div>
      </div>
    )
  }

  if (pillar.id === 'simplicite') {
    return (
      <div className={cn('rounded-2xl p-6 lg:p-8', bgClass, 'border', borderClass)}>
        {/* Simple dashboard mockup */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-brand/20 flex items-center justify-center">
              <span className="text-lg font-bold text-brand">7.2</span>
            </div>
            <div>
              <p className={cn('font-medium', isDark ? 'text-white' : 'text-foreground')}>Score global</p>
              <p className={cn('text-sm', isDark ? 'text-emerald-400' : 'text-emerald-600')}>Bonne santé</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          {[
            { label: 'Liquidité', value: 'Excellente', color: 'emerald' },
            { label: 'Rentabilité', value: 'Normale', color: 'blue' },
            { label: 'Solvabilité', value: 'À surveiller', color: 'amber' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <span className={isDark ? 'text-slate-300' : 'text-foreground'}>{item.label}</span>
              <span
                className={cn(
                  'text-sm font-medium px-2 py-1 rounded',
                  item.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                  item.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                  item.color === 'amber' && 'bg-amber-500/20 text-amber-400'
                )}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (pillar.id === 'actionnable') {
    return (
      <div className={cn('rounded-2xl p-6 lg:p-8', bgClass, 'border', borderClass)}>
        {/* Action checklist mockup */}
        <div className="space-y-4">
          <p className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
            Actions recommandées
          </p>
          {[
            { text: 'Négocier délais fournisseurs', done: true },
            { text: 'Relancer facture #1234', done: true },
            { text: 'Prendre RDV comptable', done: false },
            { text: 'Constituer provision', done: false },
          ].map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                item.done
                  ? isDark
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-emerald-50 border-emerald-200'
                  : isDark
                    ? 'bg-white/[0.02] border-white/10'
                    : 'bg-background border-border'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                  item.done
                    ? 'bg-emerald-500 text-white'
                    : isDark
                      ? 'border border-white/20'
                      : 'border border-border'
                )}
              >
                {item.done && <Check className="w-3 h-3" />}
              </div>
              <span
                className={cn(
                  'text-sm',
                  item.done
                    ? isDark
                      ? 'text-emerald-300 line-through'
                      : 'text-emerald-700 line-through'
                    : isDark
                      ? 'text-white'
                      : 'text-foreground'
                )}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Collaboration visual
  return (
    <div className={cn('rounded-2xl p-6 lg:p-8', bgClass, 'border', borderClass)}>
      {/* Collaboration mockup */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-8">
          {/* Dirigeant */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center mx-auto mb-2">
              <Users className="w-7 h-7 text-brand" />
            </div>
            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-foreground')}>Vous</p>
            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-muted-foreground')}>Dirigeant</p>
          </div>

          {/* Connection */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-0.5 bg-brand/50" />
            <Link2 className="w-4 h-4 text-brand" />
            <div className="w-16 h-0.5 bg-brand/50" />
          </div>

          {/* Comptable */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="w-7 h-7 text-violet-400" />
            </div>
            <p className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-foreground')}>Expert</p>
            <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-muted-foreground')}>Comptable</p>
          </div>
        </div>

        <div className={cn('w-full p-4 rounded-lg text-center', isDark ? 'bg-white/[0.03]' : 'bg-muted')}>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-muted-foreground')}>
            Dossier partagé • Notes synchronisées • RDV planifié
          </p>
        </div>
      </div>
    </div>
  )
}
