import { z } from 'zod'

export const alertSchema = z.object({
  conversation_id: z.string().uuid('ID de conversation invalide'),
  message_id: z.string().uuid('ID de message invalide').optional(),
  sender_id: z.string().uuid('ID d\'expéditeur invalide'),
  alert_type: z.string().min(1, 'Le type d\'alerte est requis'),
  detected_content: z.string().optional(),
  message_content: z.string().min(1, 'Le contenu du message est requis'),
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  reviewed_at: z.string().optional(),
  reviewed_by: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional(),
})

export type AlertInput = z.infer<typeof alertSchema>
