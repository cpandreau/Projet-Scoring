'use client'

import { useEffect, useRef, useState } from 'react'
import { Database, Calculator, Shield, Zap } from 'lucide-react'

const trustPoints = [
  {
    icon: Database,
    title: 'Données officielles',
    description: 'INPI, INSEE, Banque de France - Sources publiques vérifiables',
  },
  {
    icon: Calculator,
    title: 'Méthodologie éprouvée',
    description: 'Basée sur les standards comptables français (PCG)',
  },
  {
    icon: Shield,
    title: 'Confidentialité',
    description: 'Vos données restent privées et sécurisées',
  },
  {
    icon: Zap,
    title: 'Analyse instantanée',
    description: 'Résultats en moins de 2 minutes',
  },
]

const dataSources = [
  { name: 'INPI', description: 'Registre National des Entreprises' },
  { name: 'INSEE', description: 'Données économiques nationales' },
  { name: 'Banque de France', description: 'Indicateurs sectoriels' },
  { name: 'BODACC', description: 'Annonces légales officielles' },
]

export function TrustSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-white overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-1/3 h-1/2 bg-gradient-to-br from-slate-50 to-transparent" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-gradient-to-tl from-slate-50 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span
            className={`inline-block text-sm font-semibold text-[#B8860B] uppercase tracking-wider mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Fiabilité
          </span>
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-display text-[#0F172A] leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Pourquoi nous
            <br className="hidden sm:block" />
            <span className="text-gradient-accent">faire confiance</span>
          </h2>
        </div>

        {/* Trust points grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-20">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className={`text-center transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0F172A] text-white mb-4">
                <point.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{point.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{point.description}</p>
            </div>
          ))}
        </div>

        {/* Data sources */}
        <div
          className={`bg-slate-50 rounded-2xl p-8 lg:p-12 transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
              Nos sources de données
            </h3>
            <p className="text-slate-600">
              Toutes nos analyses sont basées sur des données publiques officielles
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dataSources.map((source, index) => (
              <div
                key={source.name}
                className={`bg-white rounded-xl p-5 border border-slate-100 hover:border-[#B8860B]/30 hover:shadow-lg transition-all duration-300 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#B8860B]" />
                  <span className="font-semibold text-[#0F172A]">{source.name}</span>
                </div>
                <p className="text-sm text-slate-500">{source.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
