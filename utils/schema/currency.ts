import { z } from 'zod'

export const currencySchema = z.object({
  code: z
    .string({
      required_error: 'Le code de la devise est requis',
      invalid_type_error: 'Le code de la devise doit être en lettres',
    })
    .min(3, { message: 'Le code de la devise doit au moins contenir trois lettres' }),

  symbol: z
    .string({
      required_error: 'Le symbole de la devise est requis',
      invalid_type_error: 'Le symbole de la devise doit être en lettres',
    })
    .min(3, { message: 'Le symbole de la devise doit au moins contenir trois lettres' }),
})
