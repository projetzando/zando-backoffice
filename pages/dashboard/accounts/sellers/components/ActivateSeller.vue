<script setup lang="ts">
const isOpen = defineModel<boolean>('status', { required: true, default: false })

const seller = defineModel<Seller | undefined>('seller', { required: true, default: () => null })

const sellerStore = useSellerStore()

const { handleErrors, handleSuccess } = useHandleErrors()

const loading = ref<boolean>(false)

const closeModal = () => {
  isOpen.value = false
}

function validate() {
  loading.value = true

  sellerStore
    .activate(seller.value?.id)
    .then(async (data) => {
      closeModal()

      handleSuccess(data.message)

      sellerStore.show(seller.value?.id)
    })
    .catch((error: SupabaseResponse) => {
      handleErrors(error)
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <UModal
    v-model="isOpen"
    prevent-close
  >
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1>
            {{
              seller?.etat ? "Désactivation de l'établissement" : "Activation de l'établissement"
            }}
          </h1>

          <UButton
            icon="i-heroicons-x-circle"
            color="primary"
            variant="ghost"
            :trailing="false"
            @click="closeModal"
          />
        </div>
      </template>

      <template #default>
        <p>
          Êtes-vous sûr de vouloir {{ seller?.etat ? 'désactiver' : 'activer' }} le vendeur
          <span class="font-bold">{{ seller?.company_name }}</span>?
        </p>
      </template>

      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton
            color="orange"
            label="Annuler"
            @click="isOpen = !isOpen"
          />

          <UButton
            label="Oui"
            color="primary"
            :loading="loading"
            @click="validate"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>
