import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EnterpriseStatus } from '@/types'

interface StatusIndicatorProps {
  status: EnterpriseStatus
  className?: string
}

const STATUS_CONFIG: Record<EnterpriseStatus, { label: string; className: string }> = {
  brouillon: {
    label: 'Brouillon',
    className: 'bg-gray-100 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300',
  },
  documents_uploades: {
    label: 'Documents uploadés',
    className: 'bg-blue-50 text-blue-600 hover:bg-blue-50 dark:bg-blue-950 dark:text-blue-300',
  },
  extrait: {
    label: 'Extrait',
    className:
      'bg-orange-50 text-orange-600 hover:bg-orange-50 dark:bg-orange-950 dark:text-orange-300',
  },
  valide: {
    label: 'Validé',
    className: 'bg-green-50 text-green-600 hover:bg-green-50 dark:bg-green-950 dark:text-green-300',
  },
  analyse: {
    label: 'Analysé',
    className:
      'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-200',
  },
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge variant="secondary" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
