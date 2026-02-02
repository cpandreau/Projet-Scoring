'use client'

import { motion } from 'motion/react'
import { Check, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  title: string
  icon: LucideIcon
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  return (
    <div className={cn('space-y-4', className)}>
      {/* Step circles with connector */}
      <div className="relative flex items-center justify-between">
        {/* Background line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -translate-y-1/2 mx-6" />

        {/* Progress line */}
        <motion.div
          className="absolute left-0 top-1/2 h-0.5 bg-brand -translate-y-1/2 mx-6"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isPending = currentStep < step.number

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              {/* Circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? 'rgb(16 185 129)' // emerald-500
                    : isCurrent
                      ? 'rgb(201 162 39)' // brand
                      : 'rgb(241 245 249)', // slate-100
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  isCurrent && 'shadow-lg shadow-brand/30 ring-4 ring-brand/20'
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.4 }}
                  >
                    <Check className="w-6 h-6 text-white" />
                  </motion.div>
                ) : (
                  <step.icon
                    className={cn('w-5 h-5', isCurrent ? 'text-white' : 'text-muted-foreground')}
                  />
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                initial={false}
                animate={{
                  color: isCompleted || isCurrent ? 'var(--foreground)' : 'var(--muted-foreground)',
                  fontWeight: isCurrent ? 600 : 400,
                }}
                className="hidden sm:block mt-2 text-sm whitespace-nowrap"
              >
                {step.title}
              </motion.span>
            </div>
          )
        })}
      </div>

      {/* Step counter (mobile) */}
      <div className="sm:hidden text-center">
        <span className="text-sm text-muted-foreground">
          Étape <span className="font-semibold text-foreground">{currentStep}</span> sur{' '}
          {steps.length}
        </span>
      </div>

      {/* Progress text (desktop) */}
      <div className="hidden sm:block text-center">
        <span className="text-xs text-muted-foreground">
          Étape {currentStep} sur {steps.length}
          {currentStep === steps.length && ' - Dernière étape !'}
        </span>
      </div>
    </div>
  )
}
