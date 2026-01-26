'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { updateEnterprise } from '@/actions/enterprise.actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Enterprise } from '@/types'

const editEnterpriseSchema = z.object({
  raison_sociale: z.string().min(1, 'La dénomination est requise'),
  siret: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{14}$/.test(val.replace(/\s/g, '')),
      'Le SIRET doit contenir 14 chiffres'
    ),
  code_naf: z.string().optional(),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  code_postal: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{5}$/.test(val), 'Le code postal doit contenir 5 chiffres'),
})

type EditEnterpriseFormData = z.infer<typeof editEnterpriseSchema>

interface EditEnterpriseDialogProps {
  enterprise: Enterprise
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditEnterpriseDialog({
  enterprise,
  open,
  onOpenChange,
}: EditEnterpriseDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditEnterpriseFormData>({
    resolver: zodResolver(editEnterpriseSchema),
    defaultValues: {
      raison_sociale: enterprise.raison_sociale || '',
      siret: enterprise.siret || '',
      code_naf: enterprise.code_naf || '',
      adresse: enterprise.adresse || '',
      ville: enterprise.ville || '',
      code_postal: enterprise.code_postal || '',
    },
  })

  const onSubmit = (data: EditEnterpriseFormData) => {
    startTransition(async () => {
      const result = await updateEnterprise(enterprise.id, {
        raison_sociale: data.raison_sociale,
        siret: data.siret || undefined,
        code_naf: data.code_naf || undefined,
        adresse: data.adresse || undefined,
        ville: data.ville || undefined,
        code_postal: data.code_postal || undefined,
      })

      if (result.success) {
        toast.success('Dossier mis à jour', {
          description: 'Les modifications ont été enregistrées.',
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error('Erreur', {
          description: result.error || 'Impossible de mettre à jour le dossier.',
        })
      }
    })
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Modifier le dossier</DialogTitle>
          <DialogDescription>
            Modifiez les informations du dossier. Le SIREN ne peut pas être modifié.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Dénomination */}
            <div className="space-y-2">
              <Label htmlFor="raison_sociale">Dénomination *</Label>
              <Input
                id="raison_sociale"
                {...register('raison_sociale')}
                placeholder="Nom de l'entreprise"
              />
              {errors.raison_sociale && (
                <p className="text-destructive text-sm">{errors.raison_sociale.message}</p>
              )}
            </div>

            {/* SIREN (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="siren">SIREN</Label>
              <Input id="siren" value={enterprise.siren || ''} disabled className="bg-muted" />
              <p className="text-muted-foreground text-xs">Le SIREN ne peut pas être modifié</p>
            </div>

            {/* SIRET */}
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" {...register('siret')} placeholder="14 chiffres" maxLength={14} />
              {errors.siret && <p className="text-destructive text-sm">{errors.siret.message}</p>}
            </div>

            {/* Code NAF */}
            <div className="space-y-2">
              <Label htmlFor="code_naf">Code NAF</Label>
              <Input id="code_naf" {...register('code_naf')} placeholder="Ex: 62.01Z" />
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" {...register('adresse')} placeholder="Numéro et rue" />
            </div>

            {/* Ville et Code postal */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code_postal">Code postal</Label>
                <Input
                  id="code_postal"
                  {...register('code_postal')}
                  placeholder="75001"
                  maxLength={5}
                />
                {errors.code_postal && (
                  <p className="text-destructive text-sm">{errors.code_postal.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville</Label>
                <Input id="ville" {...register('ville')} placeholder="Paris" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
