import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string({
        required_error: "Le nom d'utilisateur est requis",
        invalid_type_error: "Le nom d\'utilisateur doit être en lettres",
    }).min(3, { message: "Le nom d'utilisateur doit au moins contenir trois lettres" }),

    email: z.string(
        {
            required_error: "L'adresse email est requise",
            invalid_type_error: "L'adresse email doit être en lettres",
        }
    ).email("L'adresse email est invalide"),

    role: commonIdSchema("Le role")
})

export const updateUserSchema = z.object({
    name: z.string({
        required_error: "Le nom d'utilisateur est requis",
        invalid_type_error: "Le nom d\'utilisateur doit être en lettres",
    }).min(3, { message: "Le nom d'utilisateur doit au moins contenir trois lettres" }),

    email: z.string(
        {
            required_error: "L'adresse email est requise",
            invalid_type_error: "L'adresse email doit être en lettres",
        }
    ).email("L'adresse email est invalide")
});