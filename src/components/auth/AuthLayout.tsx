'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { FloatingHexagon } from '@/components/ui/hexagon'

interface AuthLayoutProps {
  children: React.ReactNode
  visualMessage?: string
  visualSubtitle?: string
}

export function AuthLayout({
  children,
  visualMessage = "L'équilibre financier révélé",
  visualSubtitle = 'Plateforme d\'intelligence financière pour dirigeants PME/TPE',
}: AuthLayoutProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual/Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Dark gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 noise-overlay opacity-50" />

        {/* Decorative hexagons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingHexagon
            className="absolute top-20 left-[15%] text-brand/[0.06]"
            size={120}
            delay={0}
            duration={10}
            strokeWidth={0.8}
          />
          <FloatingHexagon
            className="absolute top-1/3 right-[10%] text-brand/[0.08]"
            size={80}
            delay={2}
            duration={8}
            withBars
            strokeWidth={1}
          />
          <FloatingHexagon
            className="absolute bottom-1/4 left-[20%] text-brand/[0.05]"
            size={100}
            delay={4}
            duration={12}
            strokeWidth={0.6}
          />
          <FloatingHexagon
            className="absolute bottom-20 right-[25%] text-brand/[0.07]"
            size={60}
            delay={1}
            duration={9}
            withBars
            strokeWidth={1}
          />
        </div>

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.08) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Logo */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: -20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link href="/" className="inline-block">
              <Image
                src="/bilantia_logo.svg"
                alt="BILANTIA"
                width={160}
                height={45}
                className="h-10 w-auto brightness-0 invert"
                priority
              />
            </Link>
          </motion.div>

          {/* Center message */}
          <motion.div
            className="flex-1 flex flex-col justify-center max-w-md"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-display text-3xl xl:text-4xl font-semibold text-white leading-tight">
              {visualMessage}
            </h1>
            <p className="mt-4 text-lg text-slate-400 leading-relaxed">
              {visualSubtitle}
            </p>
          </motion.div>

          {/* Bottom quote */}
          <motion.div
            className="pt-8 border-t border-white/10"
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="text-sm text-slate-500 italic">
              "Piloter son entreprise avec confiance, c'est comprendre ses finances."
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Mobile header */}
        <div className="lg:hidden p-4 border-b border-border">
          <Link href="/" className="inline-block">
            <Image
              src="/bilantia_logo.svg"
              alt="BILANTIA"
              width={120}
              height={35}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>

        {/* Form container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <motion.div
            className="w-full max-w-md"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
