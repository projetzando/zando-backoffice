import { z } from 'zod'

export const feeSchema = z.object({
  name: z
    .string({
      required_error: 'Le nom du frais est requis',
    })
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),
  label: z.string().optional(),
  description: z.string().optional(),
  is_percentage: z.boolean().default(false),
  base_amount: z.number().min(0).default(0),
  is_active: z.boolean().default(true),
})

export const feeRuleSchema = z.object({
  fee_id: z
    .string({
      required_error: 'Le frais est requis',
    })
    .uuid({ message: 'ID de frais invalide' }),
  applies_to_type: z.string({
    required_error: 'Le type d\'application est requis',
  }),
  applies_to_id: z.string().uuid().optional(),
  min_value: z.number().min(0).optional(),
  max_value: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  percentage: z.number().min(0).max(100).optional(),
  priority: z.number().default(10),
  is_active: z.boolean().default(true),
})

export const sellerDomainSchema = z.object({
  domain: z
    .string({
      required_error: 'Le domaine est requis',
    })
    .min(2, { message: 'Le domaine doit contenir au moins 2 caractères' }),
  description: z.string().optional(),
})

export type FeeFormData = z.infer<typeof feeSchema>
export type FeeRuleFormData = z.infer<typeof feeRuleSchema>
export type SellerDomainFormData = z.infer<typeof sellerDomainSchema>
