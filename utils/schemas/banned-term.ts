import { z } from 'zod'

export const bannedTermSchema = z.object({
  category: z.enum(['phone_number', 'email', 'external_contact', 'custom'], {
    required_error: 'La catégorie est requise',
  }),
  term: z.string().min(1, 'Le terme est requis'),
  is_regex: z.boolean().optional(),
  custom_alert_message: z.string().optional(),
  is_active: z.boolean().optional(),
  description: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
})

export type BannedTermInput = z.infer<typeof bannedTermSchema>
