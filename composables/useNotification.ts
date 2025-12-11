import { ToastColor, ToastIcon, TOAST_TIMEOUT } from '~/utils/constants'

/**
 * Types de notifications
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

/**
 * Options de notification
 */
export interface NotificationOptions {
  title: string
  description?: string
  duration?: number
  closable?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Composable pour les notifications améliorées
 */
export function useNotification() {
  const toast = useToast()

  /**
   * Configuration par type
   */
  const typeConfig: Record<NotificationType, { color: string, icon: string }> = {
    success: {
      color: ToastColor.SUCCESS,
      icon: ToastIcon.SUCCESS,
    },
    error: {
      color: ToastColor.ERROR,
      icon: ToastIcon.ERROR,
    },
    warning: {
      color: ToastColor.WARNING,
      icon: ToastIcon.WARNING,
    },
    info: {
      color: ToastColor.INFO,
      icon: ToastIcon.INFO,
    },
  }

  /**
   * Affiche une notification
   */
  function notify(type: NotificationType, options: NotificationOptions) {
    const config = typeConfig[type]

    toast.add({
      title: options.title,
      description: options.description,
      color: config.color,
      icon: config.icon,
      timeout: options.duration ?? TOAST_TIMEOUT.NORMAL,
      actions: options.action
        ? [
            {
              label: options.action.label,
              click: options.action.onClick,
            },
          ]
        : undefined,
    })
  }

  /**
   * Notifications rapides
   */
  function success(title: string, description?: string, duration?: number) {
    notify('success', { title, description, duration })
  }

  function error(title: string, description?: string, duration?: number) {
    notify('error', { title, description, duration: duration ?? TOAST_TIMEOUT.LONG })
  }

  function warning(title: string, description?: string, duration?: number) {
    notify('warning', { title, description, duration })
  }

  function info(title: string, description?: string, duration?: number) {
    notify('info', { title, description, duration })
  }

  /**
   * Notifications prédéfinies
   */
  function savedSuccessfully(itemName: string = 'Élément') {
    success(`${itemName} enregistré avec succès`, undefined, TOAST_TIMEOUT.SHORT)
  }

  function deletedSuccessfully(itemName: string = 'Élément') {
    success(`${itemName} supprimé avec succès`, undefined, TOAST_TIMEOUT.SHORT)
  }

  function updatedSuccessfully(itemName: string = 'Élément') {
    success(`${itemName} mis à jour avec succès`, undefined, TOAST_TIMEOUT.SHORT)
  }

  function createdSuccessfully(itemName: string = 'Élément') {
    success(`${itemName} créé avec succès`, undefined, TOAST_TIMEOUT.SHORT)
  }

  function copiedToClipboard() {
    success('Copié dans le presse-papier', undefined, TOAST_TIMEOUT.SHORT)
  }

  function networkError() {
    error(
      'Erreur de connexion',
      'Vérifiez votre connexion internet et réessayez.',
      TOAST_TIMEOUT.LONG,
    )
  }

  function serverError() {
    error('Erreur serveur', 'Une erreur est survenue. Réessayez plus tard.', TOAST_TIMEOUT.LONG)
  }

  function validationError(message?: string) {
    error(
      'Erreur de validation',
      message || 'Veuillez vérifier les données saisies.',
      TOAST_TIMEOUT.NORMAL,
    )
  }

  function permissionDenied() {
    warning(
      'Permission refusée',
      'Vous n\'avez pas les droits pour effectuer cette action.',
      TOAST_TIMEOUT.NORMAL,
    )
  }

  function notFound(itemName: string = 'Élément') {
    warning(`${itemName} non trouvé`, 'La ressource demandée est introuvable.')
  }

  function confirm(
    title: string,
    description: string,
    onConfirm: () => void,
    confirmLabel: string = 'Confirmer',
  ) {
    notify('info', {
      title,
      description,
      duration: TOAST_TIMEOUT.LONG,
      action: {
        label: confirmLabel,
        onClick: onConfirm,
      },
    })
  }

  /**
   * Promise-based notifications
   */
  async function promiseNotify<T>(
    promise: Promise<T>,
    messages: {
      loading?: string
      success: string | ((data: T) => string)
      error?: string | ((error: any) => string)
    },
  ): Promise<T> {
    // Afficher le message de chargement
    if (messages.loading) {
      info(messages.loading)
    }

    try {
      const result = await promise

      // Afficher le succès
      const successMessage
        = typeof messages.success === 'function' ? messages.success(result) : messages.success

      success(successMessage)

      return result
    }
    catch (err) {
      // Afficher l'erreur
      const errorMessage = messages.error
        ? typeof messages.error === 'function'
          ? messages.error(err)
          : messages.error
        : 'Une erreur est survenue'

      error(errorMessage)

      throw err
    }
  }

  return {
    // Méthodes principales
    notify,
    success,
    error,
    warning,
    info,

    // Notifications prédéfinies - CRUD
    savedSuccessfully,
    deletedSuccessfully,
    updatedSuccessfully,
    createdSuccessfully,

    // Notifications prédéfinies - Utilitaires
    copiedToClipboard,

    // Notifications prédéfinies - Erreurs
    networkError,
    serverError,
    validationError,
    permissionDenied,
    notFound,

    // Autres
    confirm,
    promiseNotify,
  }
}
