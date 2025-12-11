<script setup lang="ts">
const domainStore = useSellerDomainStore()
const toast = useToast()

onMounted(() => {
  domainStore.get()
})

const { domains } = storeToRefs(domainStore)

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentDomain = ref<SellerDomain>({
  domain: '',
  description: '',
})

const filteredDomains = computed(() => {
  if (!searchQuery.value) return domains.value
  return domains.value.filter(domain =>
    domain.domain.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function openCreateModal() {
  isEditing.value = false
  currentDomain.value = { domain: '', description: '' }
  showModal.value = true
}

function openEditModal(domain: SellerDomain) {
  isEditing.value = true
  currentDomain.value = { ...domain }
  showModal.value = true
}

async function saveDomain() {
  const result = isEditing.value
    ? await domainStore.update(currentDomain.value.id!, currentDomain.value)
    : await domainStore.store(currentDomain.value)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Domaine ${isEditing.value ? 'modifié' : 'créé'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await domainStore.get()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteDomain(domain: SellerDomain) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${domain.domain} ?`)) return

  const result = await domainStore.destroy(domain.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Domaine supprimé avec succès',
      color: 'green',
    })
    await domainStore.get()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
    })
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Actions -->
    <div class="flex justify-between items-center">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un domaine..."
        icon="i-heroicons-magnifying-glass"
        class="w-64"
      />
      <UButton
        icon="i-heroicons-plus"
        label="Nouveau domaine"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des domaines -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard
        v-for="domain in filteredDomains"
        :key="domain.id"
      >
        <div class="space-y-3">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">
                {{ domain.domain }}
              </h3>
              <p
                v-if="domain.description"
                class="text-sm text-gray-600 mt-1"
              >
                {{ domain.description }}
              </p>
            </div>
            <div class="flex gap-2">
              <UButton
                icon="i-heroicons-pencil"
                size="sm"
                color="primary"
                variant="ghost"
                @click="openEditModal(domain)"
              />
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                color="red"
                variant="ghost"
                @click="deleteDomain(domain)"
              />
            </div>
          </div>
          <p class="text-xs text-gray-500">
            Créé le {{ new Date(domain.created_at!).toLocaleDateString('fr-FR') }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouveau' }} domaine
          </h3>
        </template>

        <UForm
          :state="currentDomain"
          :schema="sellerDomainSchema"
          class="space-y-4"
          @submit="saveDomain"
        >
          <UFormGroup
            label="Domaine"
            name="domain"
            required
          >
            <UInput
              v-model="currentDomain.domain"
              placeholder="Ex: Électronique, Mode, Alimentation"
            />
          </UFormGroup>

          <UFormGroup
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="currentDomain.description"
              placeholder="Description du domaine d'activité"
              :rows="3"
            />
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
              :loading="domainStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
