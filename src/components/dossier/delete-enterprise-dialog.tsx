'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { type ActionState, deleteEnterpriseAction } from '@/actions/enterprise.actions'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SubmitButton } from '@/components/ui/submit-button'
import type { Enterprise } from '@/types'

interface DeleteEnterpriseDialogProps {
  enterprise: Enterprise
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteEnterpriseDialog({
  enterprise,
  open,
  onOpenChange,
}: DeleteEnterpriseDialogProps) {
  const router = useRouter()
  const cancelRef = useRef<HTMLButtonElement>(null)

  // useActionState pour la suppression (React 19)
  const [state, formAction] = useActionState<ActionState, FormData>(deleteEnterpriseAction, null)

  // Gerer le succes ou l'erreur
  useEffect(() => {
    if (state?.success) {
      toast.success('Dossier archive', {
        description: 'Le dossier a ete archive avec succes.',
      })
      onOpenChange(false)
      router.push('/enterprise')
      router.refresh()
    } else if (state?.error) {
      toast.error('Erreur', {
        description: state.error,
      })
    }
  }, [state, onOpenChange, router])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archiver ce dossier ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le dossier <strong>{enterprise.raison_sociale || 'Sans nom'}</strong> sera archive. Vous
            pourrez le restaurer ulterieurement depuis les archives.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef}>Annuler</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="enterpriseId" value={enterprise.id} />
            <SubmitButton variant="destructive" pendingText="Archivage...">
              Archiver
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
