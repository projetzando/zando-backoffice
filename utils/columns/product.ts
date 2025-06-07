// config/columns.ts
export const productColumns = [
  {
    key: "product_images",
    label: "Image",
  },
  {
    key: "title",
    label: "Titre",
    sortable: true,
  },
  {
    key: "sku",
    label: "SKU",
    sortable: true,
  },
  {
    key: "price",
    label: "Prix",
    sortable: true,
  },
  {
    key: "stock",
    label: "Stock",
    sortable: true,
  },
  {
    key: "status",
    label: "Statut",
    sortable: true,
  },
  {
    key: "seller",
    label: "Vendeur",
    sortable: false,
  },
  {
    key: "category",
    label: "Catégorie",
    sortable: false,
  },
  {
    key: "created_at",
    label: "Date de création",
    sortable: true,
  },
  {
    key: "actions",
    label: "Actions",
  },
];

// Statuts disponibles
export const productStatuses = [
  { value: "draft", label: "Brouillon", color: "gray" },
  { value: "active", label: "Actif", color: "green" },
  { value: "inactive", label: "Inactif", color: "orange" },
  { value: "archived", label: "Archivé", color: "red" },
];

// Helper pour obtenir le statut formaté
export function getProductStatus(status: string) {
  return productStatuses.find((s) => s.value === status) || productStatuses[0];
}
