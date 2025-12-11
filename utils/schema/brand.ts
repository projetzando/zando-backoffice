import { z } from 'zod'

export const brandSchema = z.object({
  name: z
    .string({
      required_error: 'Le nom de la marque est requis',
      invalid_type_error: 'Le nom de la marque doit être en lettres',
    })
    .min(3, { message: 'Le nom de la marque doit au moins contenir trois lettres' }),
})
