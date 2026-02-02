'use client'

import { motion } from 'motion/react'
import { Building2, Calculator, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = 'dirigeant' | 'comptable' | null

interface RoleSelectorProps {
  value: Role
  onChange: (role: Role) => void
  error?: string
}

const roles = [
  {
    id: 'dirigeant' as const,
    icon: Building2,
    title: 'Dirigeant',
    subtitle: 'd\'entreprise',
    description: 'Je veux comprendre la santé financière de mon entreprise',
    features: ['Score personnel', 'Alertes proactives', 'Inviter mon comptable'],
  },
  {
    id: 'comptable' as const,
    icon: Calculator,
    title: 'Expert-Comptable',
    subtitle: 'ou collaborateur',
    description: 'Je veux analyser les dossiers de mes clients',
    features: ['Multi-clients', 'Vue présentation', 'Alertes consolidées'],
  },
]

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">Je suis :</label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roles.map((role) => {
          const isSelected = value === role.id

          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => onChange(role.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative p-5 rounded-2xl border-2 text-left transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-brand/20',
                isSelected
                  ? 'border-brand bg-brand/5 shadow-lg shadow-brand/10'
                  : 'border-border hover:border-brand/30 hover:bg-muted/50'
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors',
                  isSelected ? 'bg-brand/10' : 'bg-muted'
                )}
              >
                <role.icon
                  className={cn('w-6 h-6', isSelected ? 'text-brand' : 'text-muted-foreground')}
                />
              </div>

              {/* Title */}
              <div className="mb-2">
                <p
                  className={cn(
                    'text-lg font-semibold',
                    isSelected ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {role.title}
                </p>
                <p className="text-sm text-muted-foreground">{role.subtitle}</p>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">{role.description}</p>

              {/* Features */}
              <ul className="space-y-1.5">
                {role.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div
                      className={cn(
                        'w-1 h-1 rounded-full',
                        isSelected ? 'bg-brand' : 'bg-muted-foreground/50'
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
