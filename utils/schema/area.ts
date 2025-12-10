import { z } from "zod";

export const areaSchema = z.object({
    name: z.string({
        required_error: "Le nom du quartier est requis",
        invalid_type_error: "Le nom du quartier doit être en lettres",
    }).min(2, { message: "Le nom du quartier doit au moins contenir deux lettres" }),
    city_id: z.string({
        required_error: "La ville est requise",
    }).uuid({ message: "ID de ville invalide" }),
});

export type AreaFormData = z.infer<typeof areaSchema>;
