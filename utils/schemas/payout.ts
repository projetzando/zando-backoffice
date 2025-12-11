import { z } from 'zod'

export const payoutSchema = z.object({
  wallet_id: z.string().uuid('ID de portefeuille invalide'),
  amount: z.number().positive('Le montant doit être positif'),
  fee: z.number().min(0, 'Les frais ne peuvent être négatifs').optional(),
  payout_method: z.string().optional(),
  account_details: z.record(z.any()).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'done', 'failed']).optional(),
  reference: z.string().optional(),
  requested_at: z.string().optional(),
  processed_at: z.string().optional(),
})

export type PayoutInput = z.infer<typeof payoutSchema>
