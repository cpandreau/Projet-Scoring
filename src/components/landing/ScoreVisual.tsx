'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { FloatingHexagon } from '@/components/ui/hexagon'
import { useCountUp } from '@/hooks/use-count-up'
import { cn } from '@/lib/utils'

interface ScoreVisualProps {
  targetScore?: number
  maxScore?: number
  label?: string
  className?: string
}

export function ScoreVisual({
  targetScore = 8.4,
  maxScore = 10,
  label,
  className,
}: ScoreVisualProps) {
  const prefersReducedMotion = useReducedMotion()
  const [isVisible, setIsVisible] = useState(false)
  const [hasAnimated, setHasAnimated] = useState(false)

  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const { formattedCount, isComplete } = useCountUp(targetScore, isVisible, {
    duration: prefersReducedMotion ? 0 : 1500,
    decimals: 1,
    easing: 'easeOut',
  })

  useEffect(() => {
    if (isComplete) {
      setHasAnimated(true)
    }
  }, [isComplete])

  // Calculate circle progress
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const progress = parseFloat(formattedCount) / maxScore
  const strokeDashoffset = circumference - progress * circumference

  // Determine score status color
  const getScoreStatus = (score: number) => {
    if (score >= 8)
      return { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Santé solide' }
    if (score >= 6) return { color: 'text-lime-400', bg: 'bg-lime-500/20', label: 'Bonne santé' }
    if (score >= 4) return { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'À surveiller' }
    return { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Attention requise' }
  }

  const status = getScoreStatus(parseFloat(formattedCount))

  return (
    <div className={cn('relative', className)}>
      {/* Floating hexagons decoration - hidden on mobile */}
      <div className="hidden sm:block">
        <FloatingHexagon
          className="absolute -top-6 -right-2 text-brand/10"
          size={50}
          delay={0}
          duration={7}
          strokeWidth={1.5}
        />
        <FloatingHexagon
          className="absolute top-1/4 -left-8 text-brand/8"
          size={60}
          delay={2}
          duration={8}
          withBars
          strokeWidth={1}
        />
        <FloatingHexagon
          className="absolute -bottom-2 right-6 text-brand/10"
          size={40}
          delay={4}
          duration={6}
          strokeWidth={1.5}
        />
      </div>

      {/* Glow effect behind */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 1 }}
        style={{
          background: 'radial-gradient(circle, rgba(201, 162, 39, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Score circle */}
      <div className="relative flex items-center justify-center">
        <svg
          className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="5"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{
              duration: prefersReducedMotion ? 0 : 1.5,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
            className="origin-center -rotate-90"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(201, 162, 39, 0.4))',
            }}
          />
          {/* Gradient definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A227" />
              <stop offset="100%" stopColor="#E5C86D" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            aria-label={`Score: ${formattedCount} sur ${maxScore}`}
          >
            {formattedCount}
          </motion.span>
          <span className="text-slate-400 text-sm sm:text-base md:text-lg mt-0.5">
            / {maxScore}
          </span>
          <motion.span
            className={cn(
              'mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium',
              status.bg,
              status.color
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: hasAnimated ? 1 : 0,
              y: hasAnimated ? 0 : 10,
            }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {label || status.label}
          </motion.span>
        </div>
      </div>

      {/* Floating indicators - hidden on mobile */}
      <motion.div
        className="absolute -right-2 top-10 sm:top-14 bg-white/5 backdrop-blur-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 border border-white/10 hidden sm:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: hasAnimated ? 1 : 0,
          x: hasAnimated ? 0 : 20,
        }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
          <span className="text-white/70 text-[10px] sm:text-xs">Liquidité</span>
          <span className="text-emerald-400 text-[10px] sm:text-xs font-semibold">Bon</span>
        </div>
      </motion.div>

      <motion.div
        className="absolute -left-4 sm:-left-6 bottom-14 sm:bottom-16 bg-white/5 backdrop-blur-sm rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2 border border-white/10 hidden sm:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: hasAnimated ? 1 : 0,
          x: hasAnimated ? 0 : -20,
        }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-brand" />
          <span className="text-white/70 text-[10px] sm:text-xs">Rentabilité</span>
          <span className="text-brand text-[10px] sm:text-xs font-semibold">8.2%</span>
        </div>
      </motion.div>
    </div>
  )
}
