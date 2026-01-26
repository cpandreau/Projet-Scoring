import { toast } from 'sonner'

/**
 * Affiche un toast de succès
 */
export function showSuccess(message: string, description?: string) {
  toast.success(message, {
    description,
  })
}

/**
 * Affiche un toast d'erreur
 */
export function showError(message: string, description?: string) {
  toast.error(message, {
    description,
  })
}

/**
 * Affiche un toast d'information
 */
export function showInfo(message: string, description?: string) {
  toast.info(message, {
    description,
  })
}

/**
 * Affiche un toast d'avertissement
 */
export function showWarning(message: string, description?: string) {
  toast.warning(message, {
    description,
  })
}

/**
 * Affiche un toast de chargement qui peut être mis à jour
 * @returns L'ID du toast pour pouvoir le mettre à jour
 */
export function showLoading(message: string) {
  return toast.loading(message)
}

/**
 * Met à jour un toast existant en succès
 */
export function updateToSuccess(toastId: string | number, message: string, description?: string) {
  toast.success(message, {
    id: toastId,
    description,
  })
}

/**
 * Met à jour un toast existant en erreur
 */
export function updateToError(toastId: string | number, message: string, description?: string) {
  toast.error(message, {
    id: toastId,
    description,
  })
}

/**
 * Ferme un toast spécifique
 */
export function dismissToast(toastId?: string | number) {
  toast.dismiss(toastId)
}

/**
 * Affiche un toast avec une action
 */
export function showWithAction(
  message: string,
  actionLabel: string,
  onAction: () => void,
  description?: string
) {
  toast(message, {
    description,
    action: {
      label: actionLabel,
      onClick: onAction,
    },
  })
}
