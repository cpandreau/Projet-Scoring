'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

interface Requirement {
  label: string
  test: (password: string) => boolean
}

const requirements: Requirement[] = [
  { label: '8 caractères minimum', test: (p) => p.length >= 8 },
  { label: 'Une majuscule', test: (p) => /[A-Z]/.test(p) },
  { label: 'Un chiffre', test: (p) => /[0-9]/.test(p) },
]

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const checks = useMemo(() => {
    return requirements.map((req) => ({
      ...req,
      passed: req.test(password),
    }))
  }, [password])

  const passedCount = checks.filter((c) => c.passed).length
  const strength = passedCount / requirements.length

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-muted'
    if (strength < 0.5) return 'bg-red-500'
    if (strength < 1) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getStrengthLabel = () => {
    if (strength === 0) return ''
    if (strength < 0.5) return 'Faible'
    if (strength < 1) return 'Moyen'
    return 'Fort'
  }

  if (!password) return null

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Force du mot de passe</span>
          <span
            className={cn(
              'text-xs font-medium',
              strength < 0.5 ? 'text-red-500' : strength < 1 ? 'text-amber-500' : 'text-emerald-500'
            )}
          >
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-300 rounded-full', getStrengthColor())}
            style={{ width: `${strength * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              'flex items-center gap-2 text-xs transition-colors duration-200',
              check.passed ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
            )}
          >
            {check.passed ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
            )}
            <span className={check.passed ? 'line-through opacity-70' : ''}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
