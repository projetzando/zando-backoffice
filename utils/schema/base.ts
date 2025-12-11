import { z } from 'zod'

export function commonIdSchema(fieldName: string) {
  return z.object(
    {
      id: z.number({
        required_error: `${fieldName} est obligatoire`,
        invalid_type_error: `${fieldName} doit être un nombre`,
      }),
    },
    {
      required_error: `${fieldName} est nécessaire`,
      invalid_type_error: `${fieldName} est nécessaire`,
    },
  )
}

export function commonNameSchema(fieldName: string) {
  return z
    .string({
      required_error: `${fieldName} est obligatoire`,
      invalid_type_error: `${fieldName} doit être en lettres`,
    })
    .min(3, { message: `${fieldName} doit au moins contenir 3 lettres` })
}
