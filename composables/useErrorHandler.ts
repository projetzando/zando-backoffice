import { ToastColor, ToastIcon, TOAST_TIMEOUT } from '~/utils/constants'

/**
 * Types d'erreurs
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * Interface pour une erreur structurée
 */
export interface StructuredError {
  type: ErrorType
  message: string
  code?: string | number
  details?: any
  timestamp: number
}

/**
 * Composable pour la gestion centralisée des erreurs
 */
export function useErrorHandler() {
  const toast = useToast()
  const errors = ref<StructuredError[]>([])
  const lastError = ref<StructuredError | null>(null)

  /**
   * Parse une erreur et retourne un objet structuré
   */
  function parseError(error: any): StructuredError {
    const timestamp = Date.now()

    // Erreur Supabase
    if (error?.code) {
      return {
        type: getErrorTypeFromCode(error.code),
        message: error.message || 'Une erreur est survenue',
        code: error.code,
        details: error.details || error.hint,
        timestamp,
      }
    }

    // Erreur réseau
    if (error?.name === 'NetworkError' || !navigator.onLine) {
      return {
        type: ErrorType.NETWORK,
        message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        timestamp,
      }
    }

    // Erreur HTTP
    if (error?.status || error?.statusCode) {
      const status = error.status || error.statusCode
      return {
        type: getErrorTypeFromStatus(status),
        message: error.message || getDefaultMessageForStatus(status),
        code: status,
        timestamp,
      }
    }

    // Erreur de validation Zod
    if (error?.issues) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Erreur de validation des données',
        details: error.issues,
        timestamp,
      }
    }

    // Erreur générique
    return {
      type: ErrorType.UNKNOWN,
      message: error?.message || 'Une erreur inattendue est survenue',
      details: error,
      timestamp,
    }
  }

  /**
   * Détermine le type d'erreur depuis le code Supabase
   */
  function getErrorTypeFromCode(code: string): ErrorType {
    const codeMap: Record<string, ErrorType> = {
      'PGRST116': ErrorType.NOT_FOUND,
      '23505': ErrorType.VALIDATION, // Duplicate key
      '23503': ErrorType.VALIDATION, // Foreign key violation
      '42501': ErrorType.AUTHORIZATION, // Insufficient privilege
      '42P01': ErrorType.SERVER, // Table doesn't exist
    }

    return codeMap[code] || ErrorType.SERVER
  }

  /**
   * Détermine le type d'erreur depuis le code HTTP
   */
  function getErrorTypeFromStatus(status: number): ErrorType {
    if (status === 401) return ErrorType.AUTHENTICATION
    if (status === 403) return ErrorType.AUTHORIZATION
    if (status === 404) return ErrorType.NOT_FOUND
    if (status >= 400 && status < 500) return ErrorType.VALIDATION
    if (status >= 500) return ErrorType.SERVER
    return ErrorType.UNKNOWN
  }

  /**
   * Message par défaut selon le code HTTP
   */
  function getDefaultMessageForStatus(status: number): string {
    const messages: Record<number, string> = {
      400: 'Requête invalide',
      401: 'Non authentifié. Veuillez vous reconnecter.',
      403: 'Vous n\'avez pas les permissions nécessaires',
      404: 'Ressource non trouvée',
      408: 'Délai dépassé. Réessayez.',
      409: 'Conflit de données',
      422: 'Données invalides',
      429: 'Trop de requêtes. Réessayez plus tard.',
      500: 'Erreur serveur. Réessayez plus tard.',
      502: 'Serveur indisponible',
      503: 'Service temporairement indisponible',
    }

    return messages[status] || `Erreur ${status}`
  }

  /**
   * Gère une erreur et l'affiche à l'utilisateur
   */
  function handleError(error: any, options?: { silent?: boolean, context?: string }) {
    const structuredError = parseError(error)

    // Stocker dans l'historique
    errors.value.push(structuredError)
    lastError.value = structuredError

    // Logger en console (dev)
    if (import.meta.dev) {
      console.error('[ErrorHandler]', {
        type: structuredError.type,
        message: structuredError.message,
        context: options?.context,
        details: structuredError.details,
        originalError: error,
      })
    }

    // Afficher toast si pas silent
    if (!options?.silent) {
      showErrorToast(structuredError, options?.context)
    }

    return structuredError
  }

  /**
   * Affiche un toast d'erreur
   */
  function showErrorToast(error: StructuredError, context?: string) {
    const title = context ? `${context}: ${error.message}` : error.message

    toast.add({
      title,
      description: error.details ? String(error.details) : undefined,
      color: ToastColor.ERROR,
      icon: ToastIcon.ERROR,
      timeout: TOAST_TIMEOUT.LONG,
    })
  }

  /**
   * Affiche un toast de succès
   */
  function showSuccess(message: string, description?: string) {
    toast.add({
      title: message,
      description,
      color: ToastColor.SUCCESS,
      icon: ToastIcon.SUCCESS,
      timeout: TOAST_TIMEOUT.NORMAL,
    })
  }

  /**
   * Affiche un toast d'avertissement
   */
  function showWarning(message: string, description?: string) {
    toast.add({
      title: message,
      description,
      color: ToastColor.WARNING,
      icon: ToastIcon.WARNING,
      timeout: TOAST_TIMEOUT.NORMAL,
    })
  }

  /**
   * Affiche un toast d'information
   */
  function showInfo(message: string, description?: string) {
    toast.add({
      title: message,
      description,
      color: ToastColor.INFO,
      icon: ToastIcon.INFO,
      timeout: TOAST_TIMEOUT.NORMAL,
    })
  }

  /**
   * Efface l'historique des erreurs
   */
  function clearErrors() {
    errors.value = []
    lastError.value = null
  }

  /**
   * Récupère les erreurs par type
   */
  function getErrorsByType(type: ErrorType) {
    return errors.value.filter(e => e.type === type)
  }

  /**
   * Vérifie si une erreur récente existe
   */
  function hasRecentError(type?: ErrorType, withinMs: number = 5000): boolean {
    const now = Date.now()
    return errors.value.some(e => now - e.timestamp < withinMs && (!type || e.type === type))
  }

  return {
    errors: readonly(errors),
    lastError: readonly(lastError),
    handleError,
    showSuccess,
    showWarning,
    showInfo,
    clearErrors,
    getErrorsByType,
    hasRecentError,
  }
}
