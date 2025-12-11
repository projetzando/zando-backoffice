import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { DEBOUNCE_DELAY } from '~/utils/constants'

/**
 * Composable pour créer une fonction debounced
 * @param fn Fonction à debouncer
 * @param delay Délai en ms (par défaut: 300ms)
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = DEBOUNCE_DELAY.SEARCH,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Composable pour créer une valeur réactive debouncée
 * @param value Valeur à observer
 * @param delay Délai en ms (par défaut: 300ms)
 */
export function useDebouncedRef<T>(value: Ref<T> | T, delay: number = DEBOUNCE_DELAY.SEARCH) {
  const input = ref(value) as Ref<T>
  const debounced = ref(value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(
    input,
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        debounced.value = newValue
      }, delay)
    },
    { immediate: true },
  )

  return {
    input,
    debounced,
  }
}

/**
 * Composable pour créer une fonction throttled (limite la fréquence d'exécution)
 * @param fn Fonction à throttler
 * @param limit Limite en ms
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 1000,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
