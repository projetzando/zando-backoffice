import { API_CONFIG } from '~/utils/constants'

/**
 * Options de retry
 */
export interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: 'linear' | 'exponential'
  onRetry?: (attempt: number, error: any) => void
  shouldRetry?: (error: any) => boolean
}

/**
 * Résultat d'un retry
 */
export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: any
  attempts: number
}

/**
 * Composable pour gérer les retry automatiques
 */
export function useRetry() {
  /**
   * Exécute une fonction avec retry automatique
   */
  async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
  ): Promise<RetryResult<T>> {
    const {
      maxAttempts = API_CONFIG.RETRY_ATTEMPTS,
      delay = API_CONFIG.RETRY_DELAY,
      backoff = 'exponential',
      onRetry,
      shouldRetry = defaultShouldRetry,
    } = options

    let lastError: any
    let attempts = 0

    for (let i = 0; i < maxAttempts; i++) {
      attempts++

      try {
        const data = await fn()
        return {
          success: true,
          data,
          attempts,
        }
      }
      catch (error) {
        lastError = error

        // Vérifier si on doit retry
        if (!shouldRetry(error)) {
          return {
            success: false,
            error,
            attempts,
          }
        }

        // Si c'est la dernière tentative, ne pas attendre
        if (i === maxAttempts - 1) {
          break
        }

        // Callback de retry
        onRetry?.(i + 1, error)

        // Attendre avant le prochain essai
        const waitTime = calculateDelay(i, delay, backoff)
        await sleep(waitTime)
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
    }
  }

  /**
   * Détermine si une erreur doit être retried
   */
  function defaultShouldRetry(error: any): boolean {
    // Ne pas retry les erreurs 4xx (sauf 408 timeout et 429 rate limit)
    if (error?.status || error?.statusCode) {
      const status = error.status || error.statusCode
      if (status >= 400 && status < 500) {
        return status === 408 || status === 429
      }
    }

    // Retry les erreurs réseau
    if (error?.name === 'NetworkError' || !navigator.onLine) {
      return true
    }

    // Retry les erreurs 5xx
    if (error?.status >= 500) {
      return true
    }

    // Retry les timeouts
    if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT') {
      return true
    }

    return false
  }

  /**
   * Calcule le délai d'attente selon la stratégie
   */
  function calculateDelay(
    attempt: number,
    baseDelay: number,
    backoff: 'linear' | 'exponential',
  ): number {
    if (backoff === 'exponential') {
      return baseDelay * Math.pow(2, attempt)
    }
    return baseDelay * (attempt + 1)
  }

  /**
   * Attendre un certain temps
   */
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Wrapper pour requêtes Supabase avec retry
   */
  async function supabaseWithRetry<T>(
    queryFn: () => Promise<{ data: T | null, error: any }>,
    options?: RetryOptions,
  ): Promise<{ success: boolean, data?: T, error?: any }> {
    const result = await withRetry(async () => {
      const { data, error } = await queryFn()
      if (error) throw error
      return data
    }, options)

    return {
      success: result.success,
      data: result.data ?? undefined,
      error: result.error,
    }
  }

  return {
    withRetry,
    supabaseWithRetry,
    defaultShouldRetry,
  }
}

/**
 * Décorateur de fonction avec retry automatique
 */
export function withAutoRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions,
): T {
  return (async (...args: any[]) => {
    const { withRetry } = useRetry()
    const result = await withRetry(() => fn(...args), options)

    if (!result.success) {
      throw result.error
    }

    return result.data
  }) as T
}
