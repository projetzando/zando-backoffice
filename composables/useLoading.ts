import { ref, computed } from 'vue'

/**
 * État de chargement
 */
export interface LoadingState {
  [key: string]: boolean
}

/**
 * Singleton pour l'état de chargement global
 */
const globalLoadingState = ref<LoadingState>({})
const loadingStack = ref<string[]>([])

/**
 * Composable pour gérer les états de chargement
 */
export function useLoading(namespace: string = 'global') {
  const loading = computed(() => globalLoadingState.value[namespace] || false)
  const isAnyLoading = computed(() => loadingStack.value.length > 0)

  /**
   * Démarre le chargement
   */
  function start() {
    globalLoadingState.value[namespace] = true
    if (!loadingStack.value.includes(namespace)) {
      loadingStack.value.push(namespace)
    }
  }

  /**
   * Arrête le chargement
   */
  function stop() {
    globalLoadingState.value[namespace] = false
    const index = loadingStack.value.indexOf(namespace)
    if (index > -1) {
      loadingStack.value.splice(index, 1)
    }
  }

  /**
   * Toggle le chargement
   */
  function toggle() {
    if (loading.value) {
      stop()
    }
    else {
      start()
    }
  }

  /**
   * Exécute une fonction async avec état de chargement
   */
  async function withLoading<T>(fn: () => Promise<T>): Promise<T> {
    start()
    try {
      return await fn()
    }
    finally {
      stop()
    }
  }

  /**
   * Réinitialise tous les états de chargement
   */
  function reset() {
    globalLoadingState.value = {}
    loadingStack.value = []
  }

  return {
    loading: readonly(loading),
    isAnyLoading: readonly(isAnyLoading),
    start,
    stop,
    toggle,
    withLoading,
    reset,
  }
}

/**
 * Composable spécialisé pour les requêtes API
 */
export function useApiLoading() {
  const mainLoading = useLoading('api-main')
  const backgroundLoading = useLoading('api-background')

  return {
    ...mainLoading,
    background: backgroundLoading,
  }
}

/**
 * Composable pour les opérations de formulaire
 */
export function useFormLoading() {
  const submitting = ref(false)
  const validating = ref(false)

  async function submit<T>(fn: () => Promise<T>): Promise<T> {
    submitting.value = true
    try {
      return await fn()
    }
    finally {
      submitting.value = false
    }
  }

  async function validate<T>(fn: () => Promise<T>): Promise<T> {
    validating.value = true
    try {
      return await fn()
    }
    finally {
      validating.value = false
    }
  }

  const isLoading = computed(() => submitting.value || validating.value)

  return {
    submitting: readonly(submitting),
    validating: readonly(validating),
    isLoading: readonly(isLoading),
    submit,
    validate,
  }
}
