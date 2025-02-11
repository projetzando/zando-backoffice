import { z } from "zod";

export const categorySchema = z.object({
    name: z.string({
        required_error: "Le nom de la categorie est requis",
        invalid_type_error: "Le nom de la categorie doit être en lettres",
    }).min(3, { message: "Le nom de la categorie doit au moins contenir trois lettres" }),

    slug: z.string(
        {
            required_error: "Le slug de la categorie est requis",
            invalid_type_error: "Le slug de la categorie doit être en lettres",
        }
    ).min(3, { message: "Le slug de la categorie doit au moins contenir trois lettres" }),

    description: z.string({
        invalid_type_error: "La description de la categorie doit être en lettres",
    }).optional(),

    level: z.number({
        invalid_type_error: "Le niveau de la categorie doit être un nombre",
    }),
});