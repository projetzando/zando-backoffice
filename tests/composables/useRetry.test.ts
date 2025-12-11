import { describe, it, expect, vi } from 'vitest'
import { useRetry } from '~/composables/useRetry'

describe('useRetry', () => {
  describe('withRetry', () => {
    it('devrait réussir du premier coup', async () => {
      const { withRetry } = useRetry()
      const fn = vi.fn().mockResolvedValue('success')

      const result = await withRetry(fn, { maxAttempts: 3, delay: 1 })

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('devrait retry après un échec avec shouldRetry personnalisé', async () => {
      const { withRetry } = useRetry()
      const fn = vi.fn().mockRejectedValueOnce(new Error('fail')).mockResolvedValue('success')

      const result = await withRetry(fn, {
        maxAttempts: 3,
        delay: 1,
        shouldRetry: () => true, // Toujours retry
      })

      expect(result.success).toBe(true)
      expect(result.data).toBe('success')
      expect(result.attempts).toBe(2)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('devrait échouer après max attempts', async () => {
      const { withRetry } = useRetry()
      const error = new Error('persistent fail')
      const fn = vi.fn().mockRejectedValue(error)

      const result = await withRetry(fn, {
        maxAttempts: 3,
        delay: 1,
        shouldRetry: () => true, // Toujours retry
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
      expect(result.attempts).toBe(3)
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('devrait appeler onRetry callback', async () => {
      const { withRetry } = useRetry()
      const fn = vi.fn().mockRejectedValue(new Error('fail'))
      const onRetry = vi.fn()

      await withRetry(fn, {
        maxAttempts: 2,
        delay: 1,
        onRetry,
        shouldRetry: () => true, // Toujours retry
      })

      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error))
    })

    it('ne devrait pas retry si shouldRetry retourne false', async () => {
      const { withRetry } = useRetry()
      const error = { status: 404 }
      const fn = vi.fn().mockRejectedValue(error)

      const result = await withRetry(fn, {
        maxAttempts: 3,
        shouldRetry: err => err.status !== 404,
      })

      expect(result.success).toBe(false)
      expect(result.attempts).toBe(1)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('defaultShouldRetry', () => {
    it('devrait retry les erreurs 5xx', () => {
      const { defaultShouldRetry } = useRetry()

      expect(defaultShouldRetry({ status: 500 })).toBe(true)
      expect(defaultShouldRetry({ status: 502 })).toBe(true)
      expect(defaultShouldRetry({ status: 503 })).toBe(true)
    })

    it('ne devrait pas retry les erreurs 4xx (sauf 408 et 429)', () => {
      const { defaultShouldRetry } = useRetry()

      expect(defaultShouldRetry({ status: 400 })).toBe(false)
      expect(defaultShouldRetry({ status: 404 })).toBe(false)
      expect(defaultShouldRetry({ status: 403 })).toBe(false)

      // Exceptions
      expect(defaultShouldRetry({ status: 408 })).toBe(true) // Timeout
      expect(defaultShouldRetry({ status: 429 })).toBe(true) // Rate limit
    })

    it('devrait retry les erreurs réseau', () => {
      const { defaultShouldRetry } = useRetry()

      expect(defaultShouldRetry({ name: 'NetworkError' })).toBe(true)
    })

    it('devrait retry les timeouts', () => {
      const { defaultShouldRetry } = useRetry()

      expect(defaultShouldRetry({ name: 'TimeoutError' })).toBe(true)
      expect(defaultShouldRetry({ code: 'ETIMEDOUT' })).toBe(true)
    })
  })

  describe('supabaseWithRetry', () => {
    it('devrait gérer les réponses Supabase avec succès', async () => {
      const { supabaseWithRetry } = useRetry()
      const mockQuery = vi.fn().mockResolvedValue({
        data: [{ id: 1 }],
        error: null,
      })

      const result = await supabaseWithRetry(mockQuery)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([{ id: 1 }])
      expect(mockQuery).toHaveBeenCalledTimes(1)
    })

    it('devrait gérer les erreurs Supabase', async () => {
      const { supabaseWithRetry } = useRetry()
      const error = { message: 'Database error' }
      const mockQuery = vi.fn().mockResolvedValue({
        data: null,
        error,
      })

      const result = await supabaseWithRetry(mockQuery, { maxAttempts: 1 })

      expect(result.success).toBe(false)
      expect(result.error).toBe(error)
    })
  })
})
