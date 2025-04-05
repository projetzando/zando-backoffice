import { z } from 'zod'

export const authSchema = z.object({
    email: z.string(
        {
            required_error: "L'adresse email est requise",
            invalid_type_error: "L'adresse email doit être en lettres",
        }
    ).email('L\'adresse email est invalide'),

    password: z.string(
        {
            required_error: "Le mot de passe est requis",
            invalid_type_error: "Le mot de passe doit être en lettres",
        }
    ).min(3, { message: 'le mot de passe doit au moins contenir trois lettres' })
})

export const changePasswordSchema = z.object({
    ol_password: commonNameSchema("L'ancient mot de passe"),

    password: z.string()
        .min(8, 'Le mot de passe doit au moins contenir 8 caractères')
        .regex(new RegExp('.*[A-Z].*'), 'Le mot de passe doit contenir au moins une lettre majuscule')
        .regex(new RegExp('.*[a-z].*'), 'Le mot de passe doit contenir au moins une lettre majuscule')
        .regex(new RegExp('.*[0-9].*'), 'Le mot de passe doit contenir au moins un chiffre')
        .regex(new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'), 'Le mot de passe doit contenir au moins un caractère special')
        .refine(value => !value.toLowerCase().includes('password'), { message: 'Le mot de passe ne peut pas contenir le mot "password"' }),

    password_confirmation: z.string()
        .min(8, 'Le mot de passe de confirmation doit au moins contenir 8 caractères')
        .regex(new RegExp('.*[A-Z].*'), 'Le mot de passe de confirmation doit contenir au moins une lettre majuscule')
        .regex(new RegExp('.*[a-z].*'), 'Le mot de passe de confirmation doit contenir au moins une lettre majuscule')
        .regex(new RegExp('.*[0-9].*'), 'Le mot de passe de confirmation doit contenir au moins un chiffre')
        .regex(new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'), 'Le mot de passe de confirmation doit contenir au moins un caractère special')
        .refine(value => !value.toLowerCase().includes('password'), { message: 'Le mot de passe de confirmation ne peut pas contenir le mot "password"' })
}).superRefine((values, ctx) => {
    if (values.password_confirmation !== values.password) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Le nom de passe de confirmation ne correspond pas au mot de passe',
            path: ['password_confirmation'],
        })
    }
})