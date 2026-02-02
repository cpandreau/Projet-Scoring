'use client'

import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Building2,
  Calculator,
  CreditCard,
  Shield,
  Sparkles,
} from 'lucide-react'
import { PublicLayout } from '@/components/public'
import { cn } from '@/lib/utils'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

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

// Plans data
const dirigeantsPlans = [
  {
    name: 'Gratuit',
    description: 'Pour découvrir',
    price: 0,
    popular: false,
    features: [
      'Score global sur 10',
      '1 entreprise',
      'Traduction humaine des ratios',
    ],
    cta: 'Commencer gratuitement',
    ctaVariant: 'secondary' as const,
  },
  {
    name: 'Essentiel',
    description: 'Pour suivre',
    price: 29,
    popular: true,
    features: [
      'Tout du plan Gratuit',
      'Historique sur 2 ans',
      'Comparatif sectoriel',
      'Alertes email',
      'Export PDF',
    ],
    cta: 'Choisir Essentiel',
    ctaVariant: 'primary' as const,
  },
  {
    name: 'Pro',
    description: 'Pour anticiper',
    price: 59,
    popular: false,
    features: [
      'Tout du plan Essentiel',
      'Réseau (10 partenaires)',
      'Surveillance BODACC',
      'Score projeté à 12 mois',
      'Scénarios "What if"',
    ],
    cta: 'Choisir Pro',
    ctaVariant: 'secondary' as const,
  },
]

const comptablesPlans = [
  {
    name: 'Solo',
    description: "Jusqu'à 15 clients",
    price: 79,
    popular: false,
    features: [
      'Toutes fonctionnalités Pro par client',
      'Dashboard multi-clients',
      'Vue présentation client',
      'Export PDF rapports',
      'Support email',
    ],
    cta: 'Choisir Solo',
    ctaVariant: 'secondary' as const,
  },
  {
    name: 'Cabinet',
    description: 'Clients illimités',
    price: 199,
    popular: true,
    features: [
      'Tout du plan Solo',
      'Clients illimités',
      '5 utilisateurs cabinet',
      'Upload batch',
      'Support prioritaire',
    ],
    cta: 'Choisir Cabinet',
    ctaVariant: 'primary' as const,
  },
]

// FAQ data
const faqItems = [
  {
    question: 'Quels documents dois-je fournir ?',
    answer:
      "Votre liasse fiscale (formulaires CERFA 2050-2059) au format PDF. C'est le document que votre expert-comptable produit chaque année. Si vous ne l'avez pas, vous pouvez simplement entrer votre numéro SIREN et nous récupérons automatiquement les données publiques disponibles.",
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument. Vos documents sont chiffrés, stockés sur des serveurs européens, et ne sont jamais partagés avec des tiers. Vous restez propriétaire de vos données et pouvez les supprimer à tout moment.',
  },
  {
    question: 'Comment le score est-il calculé ?',
    answer:
      "BILANTIA analyse plus de 30 ratios financiers regroupés en 5 familles : Liquidité, Rentabilité, Solvabilité, Activité et Évolution. Chaque ratio est comparé aux seuils de référence de la Banque de France et aux moyennes de votre secteur d'activité.",
  },
  {
    question: 'Puis-je essayer gratuitement ?',
    answer:
      "Oui, le plan Gratuit vous donne accès au score global de votre entreprise, sans limite de temps. Vous pouvez upgrader quand vous le souhaitez pour accéder aux fonctionnalités avancées.",
  },
  {
    question: 'Puis-je annuler mon abonnement ?',
    answer:
      "Oui, à tout moment, en un clic depuis vos paramètres. Pas de période d'engagement, pas de frais cachés. Votre accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    question: 'Comment fonctionne le partage avec mon comptable ?',
    answer:
      "Vous pouvez inviter votre expert-comptable à accéder à votre dossier BILANTIA. Il verra les mêmes informations que vous et pourra vous accompagner dans l'interprétation des résultats.",
  },
  {
    question: 'Combien de clients puis-je gérer ? (Comptables)',
    answer:
      "Le plan Solo permet jusqu'à 15 clients. Le plan Cabinet est illimité. Vous pouvez changer de plan à tout moment selon l'évolution de votre portefeuille.",
  },
]

export default function TarifsPage() {
  const [activeTab, setActiveTab] = useState<'dirigeants' | 'comptables'>('dirigeants')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const viewportConfig = { once: true, margin: '-80px' }
  const currentPlans = activeTab === 'dirigeants' ? dirigeantsPlans : comptablesPlans

  return (
    <PublicLayout headerVariant="solid">
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20 bg-background">
        <motion.div
          className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
          variants={prefersReducedMotion ? undefined : containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground leading-tight"
          >
            Des tarifs simples et transparents
          </motion.h1>
          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-4 text-lg sm:text-xl text-muted-foreground"
          >
            Choisissez le plan adapté à vos besoins. Sans engagement, annulable à tout moment.
          </motion.p>
        </motion.div>
      </section>

      {/* Toggle + Pricing Grid Section */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Toggle */}
          <motion.div
            className="flex justify-center mb-12"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="inline-flex items-center p-1 rounded-xl bg-muted border border-border">
              <button
                onClick={() => setActiveTab('dirigeants')}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'dirigeants'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Building2 className="w-4 h-4" />
                Dirigeants
              </button>
              <button
                onClick={() => setActiveTab('comptables')}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  activeTab === 'comptables'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Calculator className="w-4 h-4" />
                Experts-Comptables
              </button>
            </div>
          </motion.div>

          {/* Pricing Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className={cn(
                'grid gap-6 lg:gap-8',
                activeTab === 'dirigeants'
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : 'sm:grid-cols-2 lg:max-w-3xl lg:mx-auto'
              )}
            >
              {currentPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 30 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: [0.25, 0.46, 0.45, 0.94] as const,
                  }}
                  className="relative"
                >
                  <PricingCard plan={plan} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 lg:py-24 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            <motion.h2
              variants={prefersReducedMotion ? undefined : itemVariants}
              className="text-2xl sm:text-3xl lg:text-4xl font-display font-semibold text-foreground"
            >
              Questions fréquentes
            </motion.h2>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={prefersReducedMotion ? undefined : containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                variants={prefersReducedMotion ? undefined : itemVariants}
              >
                <FaqItem
                  question={item.question}
                  answer={item.answer}
                  isOpen={openFaq === index}
                  onToggle={() => setOpenFaq(openFaq === index ? null : index)}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
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
            Prêt à commencer ?
          </motion.h2>

          <motion.p
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-4 text-lg text-muted-foreground"
          >
            Essayez gratuitement, sans carte bancaire.
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
              Créer mon compte
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={prefersReducedMotion ? undefined : itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-brand" />
              <span>Données sécurisées</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="w-4 h-4 text-brand" />
              <span>Aucune carte requise</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Accès immédiat</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </PublicLayout>
  )
}

// Pricing Card Component
interface PricingCardProps {
  plan: {
    name: string
    description: string
    price: number
    popular: boolean
    features: string[]
    cta: string
    ctaVariant: 'primary' | 'secondary'
  }
}

function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={cn(
        'relative h-full flex flex-col p-6 lg:p-8 rounded-2xl border bg-background',
        plan.popular
          ? 'border-brand shadow-lg shadow-brand/10'
          : 'border-border'
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand text-white">
            Populaire
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center pb-6 border-b border-border">
        <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

        <div className="mt-4 flex items-baseline justify-center gap-1">
          <span className="text-4xl lg:text-5xl font-bold font-mono text-foreground">
            {plan.price}€
          </span>
          <span className="text-muted-foreground">/mois</span>
        </div>
      </div>

      {/* Features */}
      <ul className="flex-1 py-6 space-y-3">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/inscription"
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300',
          plan.ctaVariant === 'primary'
            ? 'bg-brand text-white hover:bg-brand-light shadow-lg shadow-brand/25 hover:shadow-xl hover:shadow-brand/30 hover:scale-[1.02] active:scale-[0.98]'
            : 'text-foreground border border-border hover:bg-muted hover:border-brand/30'
        )}
      >
        {plan.cta}
      </Link>
    </div>
  )
}

// FAQ Item Component
interface FaqItemProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

function FaqItem({ question, answer, isOpen, onToggle }: FaqItemProps) {
  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
