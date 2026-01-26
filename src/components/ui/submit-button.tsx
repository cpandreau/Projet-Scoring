'use client'

import { Loader2 } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useFormStatus } from 'react-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ButtonProps = ComponentProps<typeof Button>

interface SubmitButtonProps extends Omit<ButtonProps, 'type'> {
  children: React.ReactNode
  pendingText?: string
}

/**
 * Bouton de soumission React 19 avec useFormStatus
 * Affiche automatiquement l'etat pending du formulaire parent
 */
export function SubmitButton({
  children,
  pendingText,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || disabled} className={cn(className)} {...props}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
