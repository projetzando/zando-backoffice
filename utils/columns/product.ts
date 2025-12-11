// config/columns.ts
export const productColumns = [
  {
    key: 'cover_image',
    label: 'Image',
  },
  {
    key: 'title',
    label: 'Titre',
    sortable: true,
  },
  {
    key: 'product_type',
    label: 'Type',
    sortable: true,
  },
  {
    key: 'price',
    label: 'Prix',
    sortable: true,
  },
  {
    key: 'stock',
    label: 'Stock',
    sortable: true,
  },
  {
    key: 'is_active',
    label: 'Statut',
    sortable: true,
  },
  {
    key: 'seller',
    label: 'Vendeur',
    sortable: false,
  },
  {
    key: 'category',
    label: 'Catégorie',
    sortable: false,
  },
  {
    key: 'created_at',
    label: 'Date de création',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
  },
]

// Statuts disponibles
export const productStatuses = [
  { value: true, label: 'Actif', color: 'green' },
  { value: false, label: 'Inactif', color: 'red' },
]

// Types de produits
export const productTypes = [
  { value: 'simple', label: 'Simple', color: 'blue' },
  { value: 'variable', label: 'Variable', color: 'purple' },
]

// Helper pour obtenir le statut formaté
export function getProductStatus(isActive: boolean) {
  return productStatuses.find(s => s.value === isActive) || productStatuses[1]
}

// Helper pour obtenir le type formaté
export function getProductType(type: string) {
  return productTypes.find(t => t.value === type) || productTypes[0]
}
