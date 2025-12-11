# 📚 Exemples d'Utilisation - Composables Avancés

Ce document contient des exemples pratiques d'utilisation des nouveaux composables.

---

## 🎯 Table des matières

1. [useErrorHandler](#useerrorhandler)
2. [useRetry](#useretry)
3. [useNotification](#usenotification)
4. [useLoading](#useloading)
5. [Combinaison de composables](#combinaison-de-composables)

---

## 🚨 useErrorHandler

Gestion centralisée et structurée des erreurs.

### Usage basique

```vue
<script setup lang="ts">
const { handleError, showSuccess, lastError } = useErrorHandler()
const productStore = useProductStore()

async function deleteProduct(id: string) {
  try {
    await productStore.remove(id)
    showSuccess('Produit supprimé avec succès')
  } catch (error) {
    handleError(error, {
      context: 'Suppression produit',
      silent: false, // Afficher le toast
    })
  }
}
</script>

<template>
  <div>
    <UButton @click="deleteProduct('123')">Supprimer</UButton>

    <!-- Afficher la dernière erreur -->
    <UAlert v-if="lastError" color="red" :title="lastError.message" />
  </div>
</template>
```

### Vérifier les erreurs récentes

```typescript
const { hasRecentError, getErrorsByType } = useErrorHandler()

// Vérifier si une erreur réseau est survenue récemment
if (hasRecentError(ErrorType.NETWORK, 10000)) {
  console.log('Problème de connexion détecté il y a moins de 10s')
}

// Récupérer toutes les erreurs d'authentification
const authErrors = getErrorsByType(ErrorType.AUTHENTICATION)
console.log(`${authErrors.length} erreurs d'auth`)
```

### Gestion avancée

```typescript
import { ErrorType } from '~/composables/useErrorHandler'

const { handleError, errors, clearErrors } = useErrorHandler()

// Gérer une erreur avec contexte
async function saveData() {
  try {
    await api.save(data)
  } catch (error) {
    const structuredError = handleError(error, {
      context: 'Sauvegarde des données',
      silent: false,
    })

    // Rediriger si erreur d'auth
    if (structuredError.type === ErrorType.AUTHENTICATION) {
      navigateTo('/login')
    }
  }
}

// Nettoyer l'historique des erreurs
onUnmounted(() => {
  clearErrors()
})
```

---

## 🔄 useRetry

Retry automatique des requêtes qui échouent.

### Usage basique

```typescript
const { withRetry } = useRetry()

async function fetchProducts() {
  const result = await withRetry(
    async () => {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed')
      return response.json()
    },
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential',
    }
  )

  if (result.success) {
    console.log('Données récupérées:', result.data)
    console.log('Tentatives:', result.attempts)
  } else {
    console.error('Échec après', result.attempts, 'tentatives')
  }
}
```

### Avec Supabase

```typescript
const { supabaseWithRetry } = useRetry()
const supabase = useSupabaseClient()

async function loadProducts() {
  const result = await supabaseWithRetry(
    () => supabase.from('products').select('*').order('created_at', { ascending: false }),
    {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        console.log(`Tentative ${attempt} après erreur:`, error)
      },
    }
  )

  if (result.success) {
    products.value = result.data
  } else {
    handleError(result.error)
  }
}
```

### Retry conditionnel

```typescript
const { withRetry } = useRetry()

await withRetry(fetchData, {
  maxAttempts: 5,
  delay: 2000,
  backoff: 'linear',
  shouldRetry: (error) => {
    // Retry uniquement les erreurs 503 et network
    return error.status === 503 || error.name === 'NetworkError'
  },
  onRetry: (attempt, error) => {
    console.log(`Retry ${attempt}/5:`, error.message)
  },
})
```

### Décorateur de fonction

```typescript
import { withAutoRetry } from '~/composables/useRetry'

// Créer une fonction avec retry automatique
const fetchUserWithRetry = withAutoRetry(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  },
  { maxAttempts: 3, delay: 1000 }
)

// Utiliser la fonction
const user = await fetchUserWithRetry('123')
```

---

## 🔔 useNotification

Notifications améliorées et prédéfinies.

### Notifications rapides

```vue
<script setup lang="ts">
const { success, error, warning, info } = useNotification()

function handleSave() {
  success('Sauvegarde réussie', 'Vos modifications ont été enregistrées')
}

function handleError() {
  error('Erreur', "Impossible d'enregistrer les modifications", 5000)
}

function handleWarning() {
  warning('Attention', 'Cette action ne peut pas être annulée')
}
</script>
```

### Notifications prédéfinies (CRUD)

```typescript
const {
  savedSuccessfully,
  deletedSuccessfully,
  updatedSuccessfully,
  createdSuccessfully,
  copiedToClipboard,
} = useNotification()

// Après création
await productStore.create(data)
createdSuccessfully('Produit')

// Après mise à jour
await productStore.update(id, data)
updatedSuccessfully('Produit')

// Après suppression
await productStore.remove(id)
deletedSuccessfully('Produit')

// Après copie
navigator.clipboard.writeText(text)
copiedToClipboard()
```

### Notifications d'erreur prédéfinies

```typescript
const { networkError, serverError, validationError, permissionDenied, notFound } = useNotification()

async function loadData() {
  try {
    await api.fetch()
  } catch (error) {
    if (!navigator.onLine) {
      networkError()
    } else if (error.status === 500) {
      serverError()
    } else if (error.status === 403) {
      permissionDenied()
    } else if (error.status === 404) {
      notFound('Produit')
    } else {
      validationError(error.message)
    }
  }
}
```

### Confirmation avec action

```typescript
const { confirm } = useNotification()

function handleDelete() {
  confirm(
    'Supprimer le produit ?',
    'Cette action est irréversible',
    async () => {
      await productStore.remove(productId)
      deletedSuccessfully('Produit')
    },
    'Confirmer'
  )
}
```

### Promise-based notifications

```typescript
const { promiseNotify } = useNotification()

async function saveProduct() {
  await promiseNotify(productStore.create(data), {
    loading: 'Création en cours...',
    success: (product) => `Produit "${product.title}" créé avec succès`,
    error: (err) => `Erreur: ${err.message}`,
  })
}
```

---

## ⏳ useLoading

Gestion des états de chargement.

### Usage basique

```vue
<script setup lang="ts">
const { loading, withLoading } = useLoading('products')

async function loadProducts() {
  await withLoading(async () => {
    const response = await fetch('/api/products')
    products.value = await response.json()
  })
}

onMounted(loadProducts)
</script>

<template>
  <div>
    <UButton :loading="loading" @click="loadProducts"> Charger les produits </UButton>

    <div v-if="loading">Chargement...</div>
    <div v-else>
      <!-- Liste des produits -->
    </div>
  </div>
</template>
```

### Chargement de formulaire

```vue
<script setup lang="ts">
const { submitting, validating, isLoading, submit, validate } = useFormLoading()

const formData = ref({ name: '', email: '' })

async function handleSubmit() {
  // Valider d'abord
  const isValid = await validate(async () => {
    // Logique de validation
    return true
  })

  if (!isValid) return

  // Soumettre
  await submit(async () => {
    await api.post('/users', formData.value)
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <UInput v-model="formData.name" :disabled="isLoading" />
    <UInput v-model="formData.email" :disabled="isLoading" />

    <UButton type="submit" :loading="submitting"> Enregistrer </UButton>

    <UBadge v-if="validating" color="blue">Validation...</UBadge>
  </form>
</template>
```

### Chargement API avec background

```typescript
const { loading, background } = useApiLoading()

// Chargement principal (bloque l'UI)
async function loadMainData() {
  await loading.withLoading(async () => {
    mainData.value = await api.fetchMain()
  })
}

// Chargement en arrière-plan (n'bloque pas l'UI)
async function refreshStats() {
  await background.withLoading(async () => {
    stats.value = await api.fetchStats()
  })
}
```

### Vérifier si quelque chose charge

```typescript
const { isAnyLoading } = useLoading()

watch(isAnyLoading, (loading) => {
  if (loading) {
    console.log('Au moins une opération est en cours')
  } else {
    console.log('Aucune opération en cours')
  }
})
```

---

## 🎨 Combinaison de composables

Utiliser plusieurs composables ensemble pour un code robuste.

### Exemple complet: CRUD de produits

```vue
<script setup lang="ts">
import { ErrorType } from '~/composables/useErrorHandler'

// Composables
const { handleError, showSuccess } = useErrorHandler()
const { withRetry } = useRetry()
const { loading, withLoading } = useLoading('products')
const { createdSuccessfully, updatedSuccessfully, deletedSuccessfully, confirm } = useNotification()

// Store
const productStore = useProductStore()
const products = computed(() => productStore.products)

// État local
const page = ref(1)
const pageSize = ref(20)

// Charger les produits avec retry et loading
async function loadProducts() {
  await withLoading(async () => {
    const result = await withRetry(
      () =>
        productStore.getAll({ page: page.value, pageSize: pageSize.value }, { is_active: true }),
      {
        maxAttempts: 3,
        onRetry: (attempt) => {
          console.log(`Tentative ${attempt} de chargement`)
        },
      }
    )

    if (!result.success) {
      handleError(result.error, { context: 'Chargement des produits' })
    }
  })
}

// Créer un produit
async function createProduct(data: ProductInput) {
  try {
    await withLoading(async () => {
      const response = await productStore.create(data)

      if (response.success) {
        createdSuccessfully('Produit')
        await loadProducts() // Recharger la liste
      } else {
        throw response.error
      }
    })
  } catch (error) {
    handleError(error, { context: 'Création du produit' })
  }
}

// Supprimer avec confirmation
function deleteProduct(id: string, name: string) {
  confirm(`Supprimer "${name}" ?`, 'Cette action est irréversible', async () => {
    try {
      await withLoading(async () => {
        await productStore.remove(id)
        deletedSuccessfully('Produit')
        await loadProducts()
      })
    } catch (error) {
      handleError(error, { context: 'Suppression du produit' })
    }
  })
}

// Charger au montage
onMounted(loadProducts)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <h1>Produits</h1>
      <UButton @click="openCreateModal" :loading="loading"> Nouveau produit </UButton>
    </div>

    <!-- Liste des produits -->
    <div v-if="loading && products.length === 0" class="text-center py-8">
      <USpinner size="xl" />
      <p class="mt-2">Chargement des produits...</p>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-8">
      <p>Aucun produit trouvé</p>
    </div>

    <div v-else class="grid gap-4">
      <div v-for="product in products" :key="product.id" class="border p-4 rounded">
        <h3>{{ product.title }}</h3>
        <p>{{ product.description }}</p>

        <div class="flex gap-2 mt-2">
          <UButton size="sm" @click="editProduct(product)"> Modifier </UButton>
          <UButton size="sm" color="red" @click="deleteProduct(product.id, product.title)">
            Supprimer
          </UButton>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="productStore.paginationInfo" class="flex justify-center gap-2 mt-4">
      <UButton
        :disabled="!productStore.paginationInfo.hasPreviousPage || loading"
        @click="
          page--
          loadProducts()
        "
      >
        Précédent
      </UButton>

      <span class="px-4 py-2">
        Page {{ page }} / {{ productStore.paginationInfo.totalPages }}
      </span>

      <UButton
        :disabled="!productStore.paginationInfo.hasNextPage || loading"
        @click="
          page++
          loadProducts()
        "
      >
        Suivant
      </UButton>
    </div>
  </div>
</template>
```

### Exemple: Recherche avec debounce + cache

```vue
<script setup lang="ts">
const { debounced } = useDebouncedRef('', 300)
const { loading, withLoading } = useLoading('search')
const { handleError } = useErrorHandler()
const { get: getFromCache } = useCache()
const { generate: generateCacheKey } = useCacheKey()

const searchQuery = ref('')
const searchResults = ref([])

// Watcher avec debounce
watch(debounced, async (query) => {
  if (!query) {
    searchResults.value = []
    return
  }

  await withLoading(async () => {
    try {
      const cacheKey = generateCacheKey('search', { query })

      const results = await getFromCache(
        cacheKey,
        async () => {
          const response = await fetch(`/api/search?q=${query}`)
          return response.json()
        },
        60000 // Cache 1 minute
      )

      searchResults.value = results
    } catch (error) {
      handleError(error, { context: 'Recherche' })
    }
  })
})
</script>

<template>
  <div>
    <UInput v-model="searchQuery" placeholder="Rechercher..." :loading="loading" />

    <div v-if="loading" class="mt-2"><USpinner /> Recherche en cours...</div>

    <div v-else-if="searchResults.length > 0" class="mt-2">
      <div v-for="result in searchResults" :key="result.id">
        {{ result.name }}
      </div>
    </div>

    <div v-else-if="searchQuery" class="mt-2 text-gray-500">Aucun résultat trouvé</div>
  </div>
</template>
```

---

## 🎯 Bonnes Pratiques

### 1. Toujours gérer les erreurs

```typescript
// ❌ Mauvais
async function loadData() {
  await api.fetch()
}

// ✅ Bon
async function loadData() {
  try {
    await api.fetch()
  } catch (error) {
    handleError(error, { context: 'Chargement des données' })
  }
}
```

### 2. Utiliser withLoading pour l'UX

```typescript
// ❌ Mauvais
loading.value = true
await api.fetch()
loading.value = false

// ✅ Bon
await withLoading(async () => {
  await api.fetch()
})
```

### 3. Combiner retry + error handling

```typescript
const result = await withRetry(() => api.fetch(), { maxAttempts: 3 })

if (!result.success) {
  handleError(result.error, {
    context: 'Chargement après 3 tentatives',
  })
}
```

### 4. Utiliser les notifications prédéfinies

```typescript
// ❌ Mauvais
toast.add({ title: 'Produit créé', color: 'green' })

// ✅ Bon
createdSuccessfully('Produit')
```

---

## 📖 Résumé

Les nouveaux composables permettent de:

- ✅ Gérer les erreurs de manière structurée
- ✅ Retry automatique des requêtes
- ✅ Notifications cohérentes et prédéfinies
- ✅ États de chargement centralisés
- ✅ Code plus propre et maintenable

Consultez les fichiers de composables pour plus de détails !
