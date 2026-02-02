'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

interface DashboardPreviewProps {
  className?: string
}

export function DashboardPreview({ className }: DashboardPreviewProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div className={cn('relative', className)}>
      {/* Glow behind the dashboard */}
      <div
        className="absolute inset-0 blur-3xl opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(201, 162, 39, 0.2), transparent 70%)',
        }}
      />

      {/* Main dashboard container */}
      <motion.div
        className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden"
        initial={prefersReducedMotion ? undefined : { opacity: 0, x: 40 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      >
        {/* Header bar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="flex-1 h-2 bg-white/5 rounded-full max-w-32" />
        </div>

        {/* Dashboard content grid */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Score card - main feature */}
          <motion.div
            className="col-span-2 row-span-2 bg-gradient-to-br from-white/[0.08] to-white/[0.02] rounded-xl p-4 border border-white/5"
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            {/* Score circle placeholder */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                {/* Background ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#previewGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={264}
                    initial={
                      prefersReducedMotion
                        ? { strokeDashoffset: 264 * 0.16 }
                        : { strokeDashoffset: 264 }
                    }
                    whileInView={
                      prefersReducedMotion ? undefined : { strokeDashoffset: 264 * 0.16 }
                    }
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.2,
                      delay: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94] as const,
                    }}
                  />
                  <defs>
                    <linearGradient id="previewGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C9A227" />
                      <stop offset="100%" stopColor="#E5C86D" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Score number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white font-mono">8.4</span>
                  <span className="text-[10px] text-slate-400">/10</span>
                </div>
              </div>
            </div>
            {/* Status badge */}
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                Santé solide
              </span>
            </div>
          </motion.div>

          {/* Mini metric cards */}
          <motion.div
            className="bg-white/[0.05] rounded-lg p-3 border border-white/5"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="w-6 h-1 bg-brand/40 rounded mb-2" />
            <div className="w-full h-8 bg-gradient-to-t from-emerald-500/20 to-transparent rounded" />
          </motion.div>

          <motion.div
            className="bg-white/[0.05] rounded-lg p-3 border border-white/5"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="w-8 h-1 bg-white/20 rounded mb-2" />
            <div className="w-full h-8 bg-gradient-to-t from-brand/20 to-transparent rounded" />
          </motion.div>

          {/* Chart placeholder */}
          <motion.div
            className="col-span-3 bg-white/[0.05] rounded-lg p-4 border border-white/5"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="flex items-end justify-between h-16 gap-2">
              {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 70, 84].map((height, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t bg-gradient-to-t from-brand/60 to-brand/20"
                  style={{ height: `${height}%` }}
                  initial={prefersReducedMotion ? undefined : { scaleY: 0 }}
                  whileInView={prefersReducedMotion ? undefined : { scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + i * 0.03,
                    ease: [0.25, 0.46, 0.45, 0.94] as const,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Alert indicator */}
          <motion.div
            className="col-span-2 bg-white/[0.05] rounded-lg p-3 border border-white/5 flex items-center gap-3"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="w-20 h-2 bg-white/20 rounded mb-1.5" />
              <div className="w-32 h-1.5 bg-white/10 rounded" />
            </div>
          </motion.div>

          {/* Small stat */}
          <motion.div
            className="bg-white/[0.05] rounded-lg p-3 border border-white/5 flex flex-col items-center justify-center"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
          >
            <div className="text-lg font-bold text-brand">+12%</div>
            <div className="w-8 h-1 bg-white/10 rounded mt-1" />
          </motion.div>
        </div>

        {/* Label */}
        <p className="text-center text-xs text-slate-500 mt-4">Aperçu de votre tableau de bord</p>
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div
        className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-brand/5 border border-brand/10 hidden lg:block"
        initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: -10 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.9 }}
        style={{ transform: 'rotate(12deg)' }}
      />
      <motion.div
        className="absolute -bottom-6 -left-6 w-16 h-16 rounded-lg bg-white/[0.02] border border-white/5 hidden lg:block"
        initial={prefersReducedMotion ? undefined : { opacity: 0, rotate: 10 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1 }}
        style={{ transform: 'rotate(-8deg)' }}
      />
    </div>
  )
}
