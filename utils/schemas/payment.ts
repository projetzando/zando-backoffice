import { z } from 'zod'

export const paymentSchema = z.object({
  order_id: z.string().uuid('ID de commande invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  method: z.string().min(1, 'La méthode de paiement est requise'),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional(),
  transaction_ref: z.string().optional(),
  safe_reference: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
