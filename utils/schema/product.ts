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

  status: z.enum(["draft", "active", "inactive", "archived"]).default("draft"),

  sku: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Z0-9-_]+$/i.test(val), {
      message:
        "Le SKU ne peut contenir que des lettres, chiffres, tirets et underscores",
    }),

  weight: z.number().min(0, "Le poids doit être positif").optional(),

  dimensions: z
    .object({
      length: z.number().min(0).optional(),
      width: z.number().min(0).optional(),
      height: z.number().min(0).optional(),
      unit: z.enum(["cm", "m", "mm"]).default("cm"),
    })
    .optional(),

  seller_id: z.string().uuid("ID vendeur invalide").optional(),
  category_id: z.string().uuid("ID catégorie invalide").optional(),
});

export const productImageSchema = z.object({
  url: z.string().url("URL invalide"),
  position: z.number().int().min(0),
  is_main: z.boolean().default(false),
});

export const productVariantSchema = z.object({
  sku: z.string().optional(),
  price: z.number().min(0, "Le prix doit être positif"),
  stock: z.number().int().min(0, "Le stock ne peut pas être négatif"),
  attributes: z.object({}).passthrough().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type ProductImageFormData = z.infer<typeof productImageSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
