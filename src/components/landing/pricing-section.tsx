'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Gratuit',
    description: 'Pour découvrir la plateforme',
    price: '0',
    period: '',
    features: [
      '1 entreprise',
      '1 analyse par mois',
      'Score global de santé',
      'Accès aux ratios de base',
    ],
    cta: 'Commencer gratuitement',
    href: '/signup?plan=free',
    popular: false,
  },
  {
    name: 'Essentiel',
    description: 'Pour les dirigeants actifs',
    price: '29',
    period: '/mois',
    features: [
      '3 entreprises',
      'Analyses illimitées',
      'Tous les ratios (50+)',
      'Benchmark sectoriel',
      'Export PDF des rapports',
      'Historique sur 3 ans',
    ],
    cta: 'Essai gratuit 14 jours',
    href: '/signup?plan=essential',
    popular: true,
  },
  {
    name: 'Pro',
    description: 'Pour les professionnels',
    price: '49',
    period: '/mois',
    features: [
      'Entreprises illimitées',
      'Analyses illimitées',
      'Tous les ratios (50+)',
      'Benchmark sectoriel avancé',
      'Alertes personnalisées',
      'API d\'intégration',
      'Support prioritaire',
    ],
    cta: 'Essai gratuit 14 jours',
    href: '/signup?plan=pro',
    popular: false,
  },
]

export function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const getPrice = (basePrice: string) => {
    if (basePrice === '0') return '0'
    const price = parseInt(basePrice)
    return isAnnual ? Math.round(price * 0.8).toString() : basePrice
  }

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#B8860B]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-slate-100 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span
            className={`inline-block text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Tarifs
          </span>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-display text-[#0F172A] leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Des offres adaptées
            <br className="hidden sm:block" />
            <span className="text-gradient-accent">à vos besoins</span>
          </h2>
        </div>

        {/* Toggle */}
        <div
          className={`flex items-center justify-center gap-4 mb-12 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className={cn('text-sm font-medium', !isAnnual ? 'text-[#0F172A]' : 'text-slate-400')}>
            Mensuel
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn(
              'relative w-14 h-7 rounded-full transition-colors duration-300',
              isAnnual ? 'bg-[#B8860B]' : 'bg-slate-200'
            )}
            aria-label="Basculer entre mensuel et annuel"
          >
            <span
              className={cn(
                'absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300',
                isAnnual ? 'translate-x-8' : 'translate-x-1'
              )}
            />
          </button>
          <span className={cn('text-sm font-medium', isAnnual ? 'text-[#0F172A]' : 'text-slate-400')}>
            Annuel
            <span className="ml-1.5 text-xs text-[#B8860B] font-semibold">-20%</span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div
                className={cn(
                  'relative h-full rounded-2xl p-8 transition-all duration-300',
                  plan.popular
                    ? 'bg-[#0F172A] text-white shadow-2xl shadow-slate-300 scale-[1.02] lg:scale-105'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl'
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4A574] text-white text-sm font-semibold shadow-lg shadow-[#B8860B]/30">
                      <Star className="w-4 h-4 fill-current" />
                      Populaire
                    </div>
                  </div>
                )}

                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3
                    className={cn(
                      'text-xl font-semibold mb-2',
                      plan.popular ? 'text-white' : 'text-[#0F172A]'
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={cn(
                      'text-sm',
                      plan.popular ? 'text-white/70' : 'text-slate-500'
                    )}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={cn(
                        'text-5xl font-bold font-display',
                        plan.popular ? 'text-white' : 'text-[#0F172A]'
                      )}
                    >
                      {getPrice(plan.price)}€
                    </span>
                    {plan.period && (
                      <span
                        className={cn(
                          'text-lg',
                          plan.popular ? 'text-white/70' : 'text-slate-500'
                        )}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                  {isAnnual && plan.price !== '0' && (
                    <p
                      className={cn(
                        'text-sm mt-1',
                        plan.popular ? 'text-white/50' : 'text-slate-400'
                      )}
                    >
                      Facturé {parseInt(getPrice(plan.price)) * 12}€/an
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5',
                          plan.popular ? 'bg-[#B8860B]' : 'bg-emerald-100'
                        )}
                      >
                        <Check
                          className={cn(
                            'w-3 h-3',
                            plan.popular ? 'text-white' : 'text-emerald-600'
                          )}
                        />
                      </div>
                      <span
                        className={cn(
                          'text-sm',
                          plan.popular ? 'text-white/80' : 'text-slate-600'
                        )}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={plan.href}
                  className={cn(
                    'block w-full py-3.5 rounded-xl text-center font-semibold transition-all duration-300',
                    plan.popular
                      ? 'bg-[#B8860B] text-white hover:bg-[#D4A574] shadow-lg shadow-[#B8860B]/30'
                      : 'bg-slate-100 text-[#0F172A] hover:bg-slate-200'
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
