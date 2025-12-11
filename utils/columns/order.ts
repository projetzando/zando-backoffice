// config/columns.ts - Colonnes pour les commandes
export const orderColumns = [
  {
    key: 'id',
    label: 'N° Commande',
    sortable: true,
  },
  {
    key: 'buyer',
    label: 'Acheteur',
    sortable: false,
  },
  {
    key: 'status',
    label: 'Statut',
    sortable: true,
  },
  {
    key: 'total_amount',
    label: 'Montant total',
    sortable: true,
  },
  {
    key: 'order_items',
    label: 'Articles',
    sortable: false,
  },
  {
    key: 'delivery_address',
    label: 'Adresse livraison',
    sortable: false,
  },
  {
    key: 'payment_method',
    label: 'Paiement',
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

// Statuts des commandes (selon nouveau schéma)
export const orderStatuses = [
  { value: 'pending', label: 'En attente', color: 'orange' },
  { value: 'confirmed', label: 'Confirmée', color: 'blue' },
  { value: 'shipped', label: 'Expédiée', color: 'purple' },
  { value: 'delivered', label: 'Livrée', color: 'green' },
  { value: 'cancelled', label: 'Annulée', color: 'red' },
]

// Helper pour obtenir le statut formaté
export function getOrderStatus(status: string) {
  return orderStatuses.find(s => s.value === status) || orderStatuses[0]
}

// Helper pour formater le prix
export function formatPrice(price: number) {
  // Formater avec séparateur de milliers et décimales si nécessaire
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // Permet jusqu'à 2 décimales si nécessaire
  }).format(price)

  return `${formatted} XAF`
}
