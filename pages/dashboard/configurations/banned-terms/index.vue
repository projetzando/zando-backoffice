<script setup lang="ts">
definePageMeta({
  name: 'Termes bannis',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'], // Configuration réservée aux admins
})

const bannedTermStore = useBannedTermStore()
const authStore = useAuthStore()
const toast = useToast()

onMounted(() => {
  bannedTermStore.get()
})

const { bannedTerms } = storeToRefs(bannedTermStore)

const searchQuery = ref('')
const categoryFilter = ref<string | null>(null)
const severityFilter = ref<string | null>(null)
const activeFilter = ref<boolean | null>(null)
const showModal = ref(false)
const isEditing = ref(false)
const currentTerm = ref<BannedTerm>({
  category: 'custom',
  term: '',
  is_regex: false,
  is_active: true,
  severity: 'medium',
})

const filteredTerms = computed(() => {
  let filtered = bannedTerms.value

  if (categoryFilter.value) {
    filtered = filtered.filter(term => term.category === categoryFilter.value)
  }

  if (severityFilter.value) {
    filtered = filtered.filter(term => term.severity === severityFilter.value)
  }

  if (activeFilter.value !== null) {
    filtered = filtered.filter(term => term.is_active === activeFilter.value)
  }

  if (searchQuery.value) {
    filtered = filtered.filter(
      term =>
        term.term.toLowerCase().includes(searchQuery.value.toLowerCase())
        || term.description?.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  }

  return filtered
})

const categoryOptions = [
  { label: 'Toutes les catégories', value: null },
  { label: 'Numéro de téléphone', value: 'phone_number' },
  { label: 'Email', value: 'email' },
  { label: 'Contact externe', value: 'external_contact' },
  { label: 'Personnalisé', value: 'custom' },
]

const severityOptions = [
  { label: 'Toutes les sévérités', value: null },
  { label: 'Faible', value: 'low' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Élevé', value: 'high' },
]

const activeOptions = [
  { label: 'Tous', value: null },
  { label: 'Actifs', value: true },
  { label: 'Inactifs', value: false },
]

const categoryFormOptions = [
  { label: 'Numéro de téléphone', value: 'phone_number' },
  { label: 'Email', value: 'email' },
  { label: 'Contact externe', value: 'external_contact' },
  { label: 'Personnalisé', value: 'custom' },
]

const severityFormOptions = [
  { label: 'Faible', value: 'low' },
  { label: 'Moyen', value: 'medium' },
  { label: 'Élevé', value: 'high' },
]

function openCreateModal() {
  isEditing.value = false
  currentTerm.value = {
    category: 'custom',
    term: '',
    is_regex: false,
    is_active: true,
    severity: 'medium',
  }
  showModal.value = true
}

function openEditModal(term: BannedTerm) {
  isEditing.value = true
  currentTerm.value = { ...term }
  showModal.value = true
}

async function saveTerm() {
  const termData = {
    ...currentTerm.value,
    [isEditing.value ? 'updated_by' : 'created_by']: authStore.connected_user?.id,
  }

  const result = isEditing.value
    ? await bannedTermStore.update(currentTerm.value.id!, termData)
    : await bannedTermStore.store(termData)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Terme ${isEditing.value ? 'modifié' : 'créé'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await bannedTermStore.get()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteTerm(term: BannedTerm) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le terme "${term.term}" ?`)) return

  const result = await bannedTermStore.destroy(term.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Terme supprimé avec succès',
      color: 'green',
    })
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
    })
  }
}

async function toggleActive(term: BannedTerm) {
  const result = await bannedTermStore.toggleActive(term.id!, !term.is_active)

  if (result.success) {
    toast.add({
      title: 'Statut mis à jour',
      description: `Terme ${!term.is_active ? 'activé' : 'désactivé'}`,
      color: 'green',
    })
    await bannedTermStore.get()
  }
}

function getCategoryLabel(category: string) {
  const found = categoryFormOptions.find(c => c.value === category)
  return found?.label || category
}

function getSeverityColor(severity?: string) {
  switch (severity) {
    case 'low':
      return 'blue'
    case 'medium':
      return 'yellow'
    case 'high':
      return 'red'
    default:
      return 'gray'
  }
}

function getSeverityLabel(severity?: string) {
  switch (severity) {
    case 'low':
      return 'Faible'
    case 'medium':
      return 'Moyen'
    case 'high':
      return 'Élevé'
    default:
      return severity
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Termes bannis
      </h1>
      <p class="text-gray-600 mt-1">
        Gérez les termes et patterns interdits dans les conversations
      </p>
    </div>

    <!-- Filtres et actions -->
    <div class="flex gap-4">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher..."
        icon="i-heroicons-magnifying-glass"
        class="flex-1"
      />
      <USelectMenu
        v-model="categoryFilter"
        :options="categoryOptions"
        placeholder="Catégorie"
        class="w-48"
      />
      <USelectMenu
        v-model="severityFilter"
        :options="severityOptions"
        placeholder="Sévérité"
        class="w-40"
      />
      <USelectMenu
        v-model="activeFilter"
        :options="activeOptions"
        placeholder="Statut"
        class="w-32"
      />
      <UButton
        icon="i-heroicons-plus"
        label="Nouveau terme"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des termes -->
    <UTable
      :rows="filteredTerms"
      :columns="[
        { key: 'term', label: 'Terme' },
        { key: 'category', label: 'Catégorie' },
        { key: 'is_regex', label: 'Type' },
        { key: 'severity', label: 'Sévérité' },
        { key: 'description', label: 'Description' },
        { key: 'is_active', label: 'Actif' },
        { key: 'actions', label: 'Actions' },
      ]"
      :loading="bannedTermStore.loading"
    >
      <template #term-data="{ row }">
        <div>
          <p class="font-medium font-mono">
            {{ row.term }}
          </p>
          <p
            v-if="row.custom_alert_message"
            class="text-xs text-gray-500"
          >
            Alert: {{ row.custom_alert_message }}
          </p>
        </div>
      </template>

      <template #category-data="{ row }">
        <UBadge
          color="blue"
          variant="subtle"
        >
          {{ getCategoryLabel(row.category) }}
        </UBadge>
      </template>

      <template #is_regex-data="{ row }">
        <UBadge
          :color="row.is_regex ? 'purple' : 'gray'"
          variant="subtle"
        >
          {{ row.is_regex ? 'Regex' : 'Texte' }}
        </UBadge>
      </template>

      <template #severity-data="{ row }">
        <UBadge
          :color="getSeverityColor(row.severity)"
          variant="subtle"
        >
          {{ getSeverityLabel(row.severity) }}
        </UBadge>
      </template>

      <template #description-data="{ row }">
        <span
          v-if="row.description"
          class="text-sm"
        >{{ row.description }}</span>
        <span
          v-else
          class="text-gray-400"
        >-</span>
      </template>

      <template #is_active-data="{ row }">
        <UToggle
          :model-value="row.is_active"
          @update:model-value="toggleActive(row)"
        />
      </template>

      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil"
            size="sm"
            color="primary"
            variant="ghost"
            @click="openEditModal(row)"
          />
          <UButton
            icon="i-heroicons-trash"
            size="sm"
            color="red"
            variant="ghost"
            @click="deleteTerm(row)"
          />
        </div>
      </template>
    </UTable>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouveau' }} terme banni
          </h3>
        </template>

        <UForm
          :state="currentTerm"
          :schema="bannedTermSchema"
          class="space-y-4"
          @submit="saveTerm"
        >
          <UFormGroup
            label="Catégorie"
            name="category"
            required
          >
            <USelectMenu
              v-model="currentTerm.category"
              :options="categoryFormOptions"
              placeholder="Sélectionner une catégorie"
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup
            label="Terme ou pattern"
            name="term"
            required
          >
            <UInput
              v-model="currentTerm.term"
              placeholder="Ex: @gmail.com ou \\d{10}"
            />
          </UFormGroup>

          <UFormGroup
            label="Type"
            name="is_regex"
          >
            <URadioGroup
              v-model="currentTerm.is_regex"
              :options="[
                { label: 'Texte simple', value: false },
                { label: 'Expression régulière (Regex)', value: true },
              ]"
            />
          </UFormGroup>

          <UFormGroup
            label="Sévérité"
            name="severity"
            required
          >
            <USelectMenu
              v-model="currentTerm.severity"
              :options="severityFormOptions"
              placeholder="Sélectionner la sévérité"
              value-attribute="value"
            />
          </UFormGroup>

          <UFormGroup
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="currentTerm.description"
              placeholder="Description du terme banni"
              :rows="2"
            />
          </UFormGroup>

          <UFormGroup
            label="Message d'alerte personnalisé"
            name="custom_alert_message"
          >
            <UInput
              v-model="currentTerm.custom_alert_message"
              placeholder="Message affiché lors de la détection"
            />
          </UFormGroup>

          <UFormGroup
            label="Actif"
            name="is_active"
          >
            <UToggle v-model="currentTerm.is_active" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              color="gray"
              variant="outline"
              @click="showModal = false"
            >
              Annuler
            </UButton>
            <UButton
              type="submit"
              :loading="bannedTermStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
