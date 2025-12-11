import { z } from 'zod'

export const createAdminSchema = z
  .object({
    first_name: z
      .string({
        required_error: 'Le prénom est requis',
        invalid_type_error: 'Le prénom doit être en lettres',
      })
      .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),

    last_name: z
      .string({
        required_error: 'Le nom est requis',
        invalid_type_error: 'Le nom doit être en lettres',
      })
      .min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),

    email: z
      .string({
        required_error: 'L\'adresse email est requise',
        invalid_type_error: 'L\'adresse email doit être valide',
      })
      .email('L\'adresse email est invalide'),

    phone: z.string().optional(),

    role: z.enum(['admin', 'superadmin'], {
      required_error: 'Le rôle est requis',
      invalid_type_error: 'Le rôle doit être \'admin\' ou \'superadmin\'',
    }),

    password: z
      .string({
        required_error: 'Le mot de passe est requis',
      })
      .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' }),

    password_confirmation: z.string({
      required_error: 'La confirmation du mot de passe est requise',
    }),
  })
  .refine(data => data.password === data.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  })

export const updateAdminSchema = z.object({
  first_name: z
    .string({
      required_error: 'Le prénom est requis',
      invalid_type_error: 'Le prénom doit être en lettres',
    })
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères' }),

  last_name: z
    .string({
      required_error: 'Le nom est requis',
      invalid_type_error: 'Le nom doit être en lettres',
    })
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' }),

  phone: z.string().optional(),

  avatar_url: z.string().url('L\'URL de l\'avatar doit être valide').optional().or(z.literal('')),
})

export type CreateAdminInput = z.infer<typeof createAdminSchema>
export type UpdateAdminInput = z.infer<typeof updateAdminSchema>
