import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCache, useCacheKey } from '~/composables/useCache'

describe('useCache', () => {
  beforeEach(() => {
    // Réinitialiser avant chaque test
    vi.useFakeTimers()
  })

  describe('get', () => {
    it('devrait appeler le fetcher si pas de cache', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      const result = await cache.get('test-key', fetcher, 5000)

      expect(fetcher).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ data: 'test' })
    })

    it('devrait retourner les données en cache si valides', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      // Premier appel - met en cache
      await cache.get('test-key', fetcher, 5000)

      // Deuxième appel - devrait utiliser le cache
      const result = await cache.get('test-key', fetcher, 5000)

      expect(fetcher).toHaveBeenCalledTimes(1) // Appelé une seule fois
      expect(result).toEqual({ data: 'test' })
    })

    it('devrait re-fetcher si le cache est expiré', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      // Premier appel
      await cache.get('test-key', fetcher, 1000)

      // Avancer le temps au-delà du TTL
      vi.advanceTimersByTime(1001)

      // Deuxième appel - devrait re-fetcher
      await cache.get('test-key', fetcher, 1000)

      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('invalidate', () => {
    it('devrait supprimer une entrée du cache', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('test-key', fetcher, 5000)
      cache.invalidate('test-key')

      // Devrait re-fetcher après invalidation
      await cache.get('test-key', fetcher, 5000)

      expect(fetcher).toHaveBeenCalledTimes(2)
    })
  })

  describe('invalidatePattern', () => {
    it('devrait invalider toutes les clés correspondant au pattern', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('products-1', fetcher, 5000)
      await cache.get('products-2', fetcher, 5000)
      await cache.get('orders-1', fetcher, 5000)

      cache.invalidatePattern('products')

      // Les clés products devraient être invalidées
      await cache.get('products-1', fetcher, 5000)
      await cache.get('products-2', fetcher, 5000)

      // La clé orders ne devrait pas être invalidée
      await cache.get('orders-1', fetcher, 5000)

      // 3 premiers appels + 2 re-fetch pour products = 5 appels
      // orders n'est pas re-fetché car son cache est toujours valide
      expect(fetcher).toHaveBeenCalledTimes(5)
    })
  })

  describe('has', () => {
    it('devrait retourner true si la clé existe et est valide', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('test-key', fetcher, 5000)

      expect(cache.has('test-key')).toBe(true)
    })

    it('devrait retourner false si la clé n\'existe pas', () => {
      const cache = useCache()

      expect(cache.has('non-existent')).toBe(false)
    })

    it('devrait retourner false si la clé est expirée', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('test-key', fetcher, 1000)

      vi.advanceTimersByTime(1001)

      expect(cache.has('test-key')).toBe(false)
    })
  })

  describe('clear', () => {
    it('devrait vider tout le cache', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('key-1', fetcher, 5000)
      await cache.get('key-2', fetcher, 5000)

      cache.clear()

      expect(cache.has('key-1')).toBe(false)
      expect(cache.has('key-2')).toBe(false)
    })
  })

  describe('getStats', () => {
    it('devrait retourner les statistiques du cache', async () => {
      const cache = useCache()
      const fetcher = vi.fn().mockResolvedValue({ data: 'test' })

      await cache.get('key-1', fetcher, 5000)
      await cache.get('key-2', fetcher, 1000)

      vi.advanceTimersByTime(1001)

      const stats = cache.getStats()

      expect(stats.total).toBe(2)
      expect(stats.valid).toBe(1) // key-1 encore valide
      expect(stats.expired).toBe(1) // key-2 expiré
    })
  })
})

describe('useCacheKey', () => {
  describe('generate', () => {
    it('devrait générer une clé simple sans paramètres', () => {
      const { generate } = useCacheKey()

      const key = generate('products')

      expect(key).toBe('products')
    })

    it('devrait générer une clé avec paramètres', () => {
      const { generate } = useCacheKey()

      const key = generate('products', { page: 1, limit: 20 })

      expect(key).toContain('products:')
      expect(key).toContain('page:1')
      expect(key).toContain('limit:20')
    })

    it('devrait générer des clés cohérentes pour les mêmes paramètres', () => {
      const { generate } = useCacheKey()

      const key1 = generate('products', { page: 1, limit: 20 })
      const key2 = generate('products', { limit: 20, page: 1 }) // Ordre différent

      expect(key1).toBe(key2)
    })

    it('devrait générer des clés différentes pour des paramètres différents', () => {
      const { generate } = useCacheKey()

      const key1 = generate('products', { page: 1 })
      const key2 = generate('products', { page: 2 })

      expect(key1).not.toBe(key2)
    })
  })
})
