/**
 * Configuration des APIs et requêtes
 */

export const API_CONFIG = {
  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
} as const

/**
 * Délais de debounce pour les inputs
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  FILTER: 500,
  INPUT: 200,
} as const

/**
 * Configuration de pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

/**
 * Configuration du cache
 */
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  SHORT_TTL: 1 * 60 * 1000, // 1 minute
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
} as const
