import { z } from 'zod'

export const citySchema = z.object({
  name: z
    .string({
      required_error: 'Le nom de la ville est requis',
      invalid_type_error: 'Le nom de la ville doit être en lettres',
    })
    .min(2, { message: 'Le nom de la ville doit au moins contenir deux lettres' }),
})

export type CityFormData = z.infer<typeof citySchema>
