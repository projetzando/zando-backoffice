import { z } from "zod";

export const deliveryZoneSchema = z.object({
    name: z.string({
        required_error: "Le nom de la zone est requis",
        invalid_type_error: "Le nom de la zone doit être en lettres",
    }).min(2, { message: "Le nom de la zone doit au moins contenir deux lettres" }),
    city_id: z.string({
        required_error: "La ville est requise",
    }).uuid({ message: "ID de ville invalide" }),
    description: z.string().optional(),
});

export const deliveryPricingSchema = z.object({
    city_id: z.string({
        required_error: "La ville est requise",
    }).uuid({ message: "ID de ville invalide" }),
    from_zone_id: z.string({
        required_error: "La zone de départ est requise",
    }).uuid({ message: "ID de zone invalide" }),
    to_zone_id: z.string({
        required_error: "La zone d'arrivée est requise",
    }).uuid({ message: "ID de zone invalide" }),
    price: z.number({
        required_error: "Le prix est requis",
        invalid_type_error: "Le prix doit être un nombre",
    }).min(0, { message: "Le prix doit être positif" }),
});

export type DeliveryZoneFormData = z.infer<typeof deliveryZoneSchema>;
export type DeliveryPricingFormData = z.infer<typeof deliveryPricingSchema>;
