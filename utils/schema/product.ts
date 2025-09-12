// schemas/product.ts
import { z } from "zod";

export const productSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(255, "Le titre ne peut pas dépasser 255 caractères"),

  description: z
    .string()
    .min(1, "La description est requise")
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(5000, "La description ne peut pas dépasser 5000 caractères"),

  price: z
    .number()
    .min(0, "Le prix doit être positif")
    .max(999999.99, "Le prix ne peut pas dépasser 999 999,99"),

  stock: z
    .number()
    .int("Le stock doit être un nombre entier")
    .min(0, "Le stock ne peut pas être négatif")
    .max(999999, "Le stock ne peut pas dépasser 999 999"),

  is_active: z.boolean().default(true),
  
  is_featured: z.boolean().default(false),
  
  product_type: z.enum(["simple", "variable"]).default("simple"),
  
  cover_image: z.string().url("URL invalide").optional(),
  
  images: z.array(z.string().url("URL invalide")).optional(),

  seller_id: z.string().uuid("ID vendeur invalide").optional(),
  category_id: z.string().uuid("ID catégorie invalide").optional(),
});

export const productImageSchema = z.object({
  url: z.string().url("URL invalide"),
  position: z.number().int().min(0),
  is_main: z.boolean().default(false),
});

// Nouveau schéma pour les variations de produits
export const productVariationSchema = z.object({
  variation_name: z.string().min(1, "Le nom de la variation est requis"),
  price: z.number().min(0, "Le prix doit être positif").optional(),
  sale_price: z.number().min(0, "Le prix de vente doit être positif").optional(),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif").default(0),
  attributes: z.record(z.any()),
  cover_image: z.string().url("URL invalide").optional(),
  is_active: z.boolean().default(true),
});

// Schéma pour les attributs de produits
export const productAttributeSchema = z.object({
  name: z.string().min(1, "Le nom de l'attribut est requis"),
  values: z.string().min(1, "Les valeurs sont requises"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductImageFormData = z.infer<typeof productImageSchema>;
export type ProductVariationFormData = z.infer<typeof productVariationSchema>;
export type ProductAttributeFormData = z.infer<typeof productAttributeSchema>;
