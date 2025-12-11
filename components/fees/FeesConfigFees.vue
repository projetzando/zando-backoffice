<script setup lang="ts">
const feeStore = useFeeStore()
const toast = useToast()

onMounted(() => {
  feeStore.getFees()
})

const { fees } = storeToRefs(feeStore)

const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const currentFee = ref<Fee>({
  name: '',
  label: '',
  description: '',
  is_percentage: false,
  base_amount: 0,
  is_active: true,
})

const filteredFees = computed(() => {
  if (!searchQuery.value) return fees.value
  return fees.value.filter(
    fee =>
      fee.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      || fee.label?.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

function openCreateModal() {
  isEditing.value = false
  currentFee.value = {
    name: '',
    label: '',
    description: '',
    is_percentage: false,
    base_amount: 0,
    is_active: true,
  }
  showModal.value = true
}

function openEditModal(fee: Fee) {
  isEditing.value = true
  currentFee.value = { ...fee }
  showModal.value = true
}

async function saveFee() {
  const result = isEditing.value
    ? await feeStore.updateFee(currentFee.value.id!, currentFee.value)
    : await feeStore.storeFee(currentFee.value)

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: `Frais ${isEditing.value ? 'modifié' : 'créé'} avec succès`,
      color: 'green',
    })
    showModal.value = false
    await feeStore.getFees()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Une erreur est survenue',
      color: 'red',
    })
  }
}

async function deleteFee(fee: Fee) {
  if (!confirm(`Êtes-vous sûr de vouloir supprimer ${fee.name} ?`)) return

  const result = await feeStore.destroyFee(fee.id!)

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'Frais supprimé avec succès',
      color: 'green',
    })
    await feeStore.getFees()
  }
  else {
    toast.add({
      title: 'Erreur',
      description: result.error?.message || 'Impossible de supprimer',
      color: 'red',
    })
  }
}

async function toggleStatus(fee: Fee) {
  const result = await feeStore.updateFee(fee.id!, { is_active: !fee.is_active })

  if (result.success) {
    toast.add({
      title: 'Statut mis à jour',
      description: `Frais ${!fee.is_active ? 'activé' : 'désactivé'}`,
      color: 'green',
    })
    await feeStore.getFees()
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Actions -->
    <div class="flex justify-between items-center">
      <UInput
        v-model="searchQuery"
        placeholder="Rechercher un frais..."
        icon="i-heroicons-magnifying-glass"
        class="w-64"
      />
      <UButton
        icon="i-heroicons-plus"
        label="Nouveau frais"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Liste des frais -->
    <UTable
      :rows="filteredFees"
      :columns="[
        { key: 'name', label: 'Nom' },
        { key: 'label', label: 'Libellé' },
        { key: 'type', label: 'Type' },
        { key: 'base_amount', label: 'Montant de base' },
        { key: 'is_active', label: 'Statut' },
        { key: 'actions', label: 'Actions' },
      ]"
    >
      <template #type-data="{ row }">
        <UBadge
          :color="row.is_percentage ? 'blue' : 'green'"
          variant="subtle"
        >
          {{ row.is_percentage ? 'Pourcentage' : 'Montant fixe' }}
        </UBadge>
      </template>

      <template #base_amount-data="{ row }">
        {{ row.is_percentage ? `${row.base_amount}%` : `${row.base_amount} XAF` }}
      </template>

      <template #is_active-data="{ row }">
        <UToggle
          :model-value="row.is_active"
          @update:model-value="toggleStatus(row)"
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
            @click="deleteFee(row)"
          />
        </div>
      </template>
    </UTable>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ isEditing ? 'Modifier' : 'Nouveau' }} frais
          </h3>
        </template>

        <UForm
          :state="currentFee"
          :schema="feeSchema"
          class="space-y-4"
          @submit="saveFee"
        >
          <UFormGroup
            label="Nom"
            name="name"
            required
          >
            <UInput
              v-model="currentFee.name"
              placeholder="Ex: Frais de service"
            />
          </UFormGroup>

          <UFormGroup
            label="Libellé"
            name="label"
          >
            <UInput
              v-model="currentFee.label"
              placeholder="Ex: Service fee"
            />
          </UFormGroup>

          <UFormGroup
            label="Description"
            name="description"
          >
            <UTextarea
              v-model="currentFee.description"
              placeholder="Description du frais"
              :rows="3"
            />
          </UFormGroup>

          <UFormGroup
            label="Type"
            name="is_percentage"
          >
            <URadioGroup
              v-model="currentFee.is_percentage"
              :options="[
                { label: 'Montant fixe', value: false },
                { label: 'Pourcentage', value: true },
              ]"
            />
          </UFormGroup>

          <UFormGroup
            :label="currentFee.is_percentage ? 'Pourcentage (%)' : 'Montant de base (XAF)'"
            name="base_amount"
            required
          >
            <UInput
              v-model.number="currentFee.base_amount"
              type="number"
              :placeholder="currentFee.is_percentage ? 'Ex: 5' : 'Ex: 1000'"
              min="0"
              step="0.01"
            />
          </UFormGroup>

          <UFormGroup
            label="Actif"
            name="is_active"
          >
            <UToggle v-model="currentFee.is_active" />
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
              :loading="feeStore.loading"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
