<script setup lang="ts">
const isOpen = defineModel<boolean>('status', { required: true, default: false })

const customer = defineModel<Customer | undefined>('customer', {
  required: true,
  default: () => null,
})

const customerStore = useCustomerStore()

const { handleErrors, handleSuccess } = useHandleErrors()

const loading = ref<boolean>(false)

const closeModal = () => {
  isOpen.value = false
}

function validate() {
  loading.value = true

  customerStore
    .activate(customer.value?.id)
    .then(async (data) => {
      closeModal()

      handleSuccess(data.message)

      customerStore.show(customer.value?.id)
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
              customer?.etat ? "Désactivation de l'établissement" : "Activation de l'établissement"
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
          Êtes-vous sûr de vouloir {{ customer?.etat ? 'désactiver' : 'activer' }} le client
          <span class="font-bold">{{ customer?.first_name + ' ' + customer?.last_name }}</span>?
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
