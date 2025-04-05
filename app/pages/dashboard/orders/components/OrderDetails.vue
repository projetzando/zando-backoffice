<template>
  <div class="max-w-7xl bg-white rounded-lg shadow-sm">
    <div v-if="!loading">
      <!-- Header avec ID et statuts -->
      <div class="flex flex-wrap items-center justify-between mb-4">
        <div>
          <h1 class="text-xl font-semibold">Commande ID : {{ order.id }}</h1>
          <p class="text-sm text-gray-600">
            {{ formatDate(order.created_at) }} depuis les Commandes
          </p>
        </div>
        <div class="flex items-center space-x-3">
          <button class="px-3 py-1 border border-gray-300 rounded-md text-sm">Réapprovisionner</button>
          <button class="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center">
            <span class="mr-1">Éditer</span>
          </button>
          <button class="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center">
            <span class="mr-1">Plus d'actions</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
  
      <!-- Status Pills -->
      <div class="flex flex-wrap gap-2 mb-6">
        <span class="px-3 py-1 bg-amber-50 text-amber-600 text-xs rounded-full">
          {{ order.status === 'pending' ? 'Paiement en attente' : order.status }}
        </span>
        <!-- <span class="px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full">Unfulfilled</span> -->
      </div>
  
      <div class="flex flex-col md:flex-row space-x-4">
        <div class="w-full md:w-2/3">
          <!-- Order Item Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Élements de la commande</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
  
            <div class="p-4">
              <p class="text-red-500 text-sm mb-4">Non remis</p>
              <p class="text-sm text-gray-600 mb-6">Articles en attente de remise dans cette commande.</p>
  
              <!-- Product Items -->
              <div v-for="item in order.order_items" :key="item.id"
                class="flex items-center justify-between border-b border-gray-100 py-4">
                <div class="flex items-center gap-4">
                  <div class="bg-gray-100 p-2 rounded-md">
                    <img src="~/assets/images/placeholder.png" alt="Élement de commande image" class="w-20 h-16 object-contain" />
                  </div>
                  <div>
                    <p class="text-gray-500 text-sm">{{ item.products.categories?.name || 'Pas de catégorie' }}</p>
                    <p class="font-medium">{{ item.products.title }}</p>
                    <div class="flex items-center mt-2 text-sm">
                      <span v-if="item.products.brands" class="flex items-center">
                        {{ item.products.brands.name }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-6">
                  <p>{{ item.quantity }} x {{ formatCurrency(item.unit_price) }}</p>
                  <p class="font-medium">{{ formatCurrency(item.quantity * item.unit_price) }}</p>
                  <button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
  
              <p class="text-sm text-gray-600 my-6">Gérez vos commandes sans effort grâce à notre page intuitive Liste de commandes.
              </p>
  
              <div class="flex gap-3">
                <button class="px-4 py-2 border border-gray-300 rounded-md text-sm">Remettre en stock</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Créer une étiquette de livraison</button>
              </div>
            </div>
          </div>
  
          <!-- Order Summary Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">État de la commande</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <p class="text-amber-600 text-sm bg-amber-50 inline-block px-3 py-1 rounded-full mb-4">Paiement {{
                order.status }}</p>
              <p class="text-sm text-gray-600 mb-6">État de la commande</p>
  
              <!-- Cost Summary -->
              <div class="space-y-2 mb-6">
                <div class="flex justify-between">
                  <span>Sous-total</span>
                  <span>{{ order.order_items.length }} articles</span>
                  <span class="font-medium">{{ formatCurrency(calculateSubtotal()) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Frais de livraison</span>
                  <span>{{ order.shipping_method }}</span>
                  <span class="font-medium">{{ formatCurrency(order.shipping_cost) }}</span>
                </div>
                <div class="flex justify-between border-t border-gray-200 pt-2">
                  <span class="font-medium">Total</span>
                  <span></span>
                  <span class="font-medium">{{ formatCurrency(calculateTotal()) }}</span>
                </div>
              </div>
  
              <div class="space-y-2 mb-6 text-sm">
                <div class="flex justify-between">
                  <span>Payé par l'acheteur</span>
                  <span></span>
                  <span>0.00 FCFA</span>
                </div>
                <div class="flex justify-between">
                  <span>Paiement dû à l'envoi de la facture</span>
                  <span></span>
                  <button class="text-indigo-600">Modifier</button>
                </div>
              </div>
  
              <p class="text-sm text-gray-600 mb-6">Revisez les détails de la commande et effectuez le paiement.</p>
  
              <div class="flex gap-3">
                <button class="px-4 py-2 border border-gray-300 rounded-md text-sm">Envoyer la facture</button>
                <button class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Collecter le paiement</button>
              </div>
            </div>
          </div>
  
          <!-- Timeline Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Chronologie</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <p class="text-sm text-gray-600 mb-6">Chronologie des activités de commande.</p>
  
              <div class="flex items-start mb-4">
                <div class="bg-indigo-500 rounded-full p-1 text-white mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clip-rule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium">Commande créée</p>
                  <p class="text-xs text-gray-500">{{ formatDate(order.created_at) }}</p>
                </div>
              </div>
  
              <div class="ml-8 mb-4">
                <input type="text" placeholder="Laissez un commentaire..."
                  class="w-full border border-gray-300 rounded-md p-2 text-sm" />
              </div>
            </div>
          </div>
        </div>
  
        <div class="w-full md:w-1/3">
          <!-- Notes Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Notes</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <p class="text-sm">Aucune note pour cette commande</p>
            </div>
          </div>
  
          <!-- Customer Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Acheteur</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <p>{{ order.buyer?.first_name }} {{ order.buyer?.last_name }}</p>
              </div>
              <div class="flex items-center mb-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0z" />
                  <path fill-rule="evenodd" d="M12 3a1 1 0 0  12 0v7a1 1 0 11-2 0V3z" clip-rule="evenodd" />
                </svg>
                <p>Acheteur depuis {{ formatDate(order.buyer.created_at, true) }}</p>
              </div>
              <div class="flex items-center mb-2 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd"
                    d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg>
                <p>Langue préférée: {{ order.buyer.language }}</p>
              </div>
              <div v-if="order.buyer.status === 'active'" class="text-sm text-green-600">Client actif</div>
            </div>
          </div>
  
          <!-- Contact Information Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Information de contact</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <p class="text-sm">+{{ order.buyer.phone }}</p>
              </div>
            </div>
          </div>
  
          <!-- Shipping Address Section -->
          <div class="border border-gray-200 rounded-lg mb-6">
            <div class="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 class="font-medium">Adresse de livraison</h2>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
            <div class="p-4">
              <div class="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                  fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
                <p>{{ order.shipping_address.name }}</p>
              </div>
              <p class="text-sm ml-7 mb-1">{{ order.shipping_address.street }}</p>
              <p class="text-sm ml-7 mb-1">{{ order.shipping_address.city }} {{ order.shipping_address.state }} {{
                order.shipping_address.postal_code }}</p>
              <p class="text-sm ml-7 mb-1">{{ order.shipping_address.country }}</p>
              <p class="text-sm ml-7 mb-3">+{{ order.shipping_address.phone_number }}</p>
              <div class="flex ml-7">
                <button class="text-indigo-600 text-sm flex items-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
                      clip-rule="evenodd" />
                  </svg>
                  Voir sur la carte
                </button>
              </div>
            </div>
          </div>
  
  
  
  
  
          <!-- Billing & Payment Sections -->
          <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div class="border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 class="font-medium">Adresse de facturation</h2>
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="p-4">
                <div v-if="order.billing_address.id === order.shipping_address.id">
                  <p class="text-sm">Même adresse que celle de livraison</p>
                </div>
                <div v-else>
                  <div class="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clip-rule="evenodd" />
                    </svg>
                    <p>{{ order.billing_address.name }}</p>
                  </div>
                  <p class="text-sm ml-7 mb-1">{{ order.billing_address.street }}</p>
                  <p class="text-sm ml-7 mb-1">{{ order.billing_address.city }} {{ order.billing_address.state }} {{
                    order.billing_address.postal_code }}</p>
                  <p class="text-sm ml-7 mb-1">{{ order.billing_address.country }}</p>
                  <p class="text-sm ml-7 mb-3">+{{ order.billing_address.phone_number }}</p>
                </div>
              </div>
            </div>
  
            <div class="border border-gray-200 rounded-lg">
              <div class="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 class="font-medium">Détails du paiement</h2>
                <button>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              <div class="p-4">
                <p class="text-sm text-gray-600 mb-3">Statut du paiement : <span class="font-medium">{{ order.status }}</span>
                </p>
                <button class="text-indigo-600 text-sm">Procéder au paiement</button>
              </div>
            </div>
          </div>
  
        </div>
      </div>
    </div>
    <USkeleton
        v-else
        class="h-52 mt-5 w-full"
    />
  </div>
</template>

<script setup>
// Définir la prop pour recevoir les données de la commande
const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    required: true
  }
});

// Fonction pour formater la date
const formatDate = (dateString, shortFormat = false) => {
  const date = new Date(dateString);

  if (shortFormat) {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

// Fonction pour formater la devise
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF'
  }).format(amount);
};

// Fonction pour calculer le sous-total
const calculateSubtotal = () => {
  return props.order.order_items.reduce((total, item) => {
    return total + (item.unit_price * item.quantity);
  }, 0);
};

// Fonction pour calculer le total
const calculateTotal = () => {
  return calculateSubtotal() + props.order.shipping_cost;
};
</script>