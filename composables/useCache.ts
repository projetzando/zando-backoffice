import { ref } from 'vue'
import { CACHE_CONFIG } from '~/utils/constants'

/**
 * Interface pour les données en cache
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Composable pour la gestion du cache avec TTL
 */
export function useCache() {
  const cache = ref<Map<string, CacheEntry<any>>>(new Map())

  /**
   * Récupère une donnée du cache ou exécute la fonction fetcher
   * @param key Clé unique du cache
   * @param fetcher Fonction pour récupérer les données
   * @param ttl Durée de vie du cache en ms (par défaut: 5 minutes)
   */
  async function get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL,
  ): Promise<T> {
    const now = Date.now()
    const cached = cache.value.get(key)

    // Si le cache existe et n'est pas expiré, retourner les données en cache
    if (cached && now < cached.expiresAt) {
      return cached.data as T
    }

    // Sinon, récupérer les nouvelles données
    const data = await fetcher()

    // Sauvegarder dans le cache
    cache.value.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    })

    return data
  }

  /**
   * Invalide une entrée spécifique du cache
   * @param key Clé à invalider
   */
  function invalidate(key: string): void {
    cache.value.delete(key)
  }

  /**
   * Invalide toutes les entrées qui correspondent au pattern
   * @param pattern Pattern de recherche (ex: 'products-')
   */
  function invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = []

    cache.value.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => invalidate(key))
  }

  /**
   * Vide complètement le cache
   */
  function clear(): void {
    cache.value.clear()
  }

  /**
   * Vérifie si une clé existe dans le cache et est valide
   * @param key Clé à vérifier
   */
  function has(key: string): boolean {
    const cached = cache.value.get(key)
    if (!cached) return false

    const now = Date.now()
    if (now >= cached.expiresAt) {
      cache.value.delete(key)
      return false
    }

    return true
  }

  /**
   * Récupère les statistiques du cache
   */
  function getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    cache.value.forEach((entry) => {
      if (now < entry.expiresAt) {
        validEntries++
      }
      else {
        expiredEntries++
      }
    })

    return {
      total: cache.value.size,
      valid: validEntries,
      expired: expiredEntries,
    }
  }

  /**
   * Nettoie les entrées expirées du cache
   */
  function cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    cache.value.forEach((entry, key) => {
      if (now >= entry.expiresAt) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => cache.value.delete(key))
  }

  // Nettoyer le cache toutes les 5 minutes
  if (import.meta.client) {
    setInterval(
      () => {
        cleanup()
      },
      5 * 60 * 1000,
    )
  }

  return {
    get,
    invalidate,
    invalidatePattern,
    clear,
    has,
    getStats,
    cleanup,
  }
}

/**
 * Composable pour générer des clés de cache cohérentes
 */
export function useCacheKey() {
  /**
   * Génère une clé de cache à partir des paramètres
   * @param prefix Préfixe (ex: 'products', 'orders')
   * @param params Paramètres à inclure dans la clé
   */
  function generate(prefix: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return prefix
    }

    // Trier les clés pour garantir la cohérence
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${JSON.stringify(params[key])}`)
      .join('|')

    return `${prefix}:${sortedParams}`
  }

  return { generate }
}
