<script setup lang="ts">
const isOpen = defineModel<boolean>('status', { required: true, default: false })

const seller = defineModel<Seller | undefined>('seller', { required: true, default: () => ({}) })

const sellerStore = useSellerStore()

const { handleErrors, handleSuccess } = useHandleErrors()

const updateSeller = ref<UpdateSeller>({ name: '' })

const loading = ref<boolean>(false)

const closeModal = () => {
  isOpen.value = false

  updateSeller.value = { name: '' }
}

function store() {
  loading.value = true

  sellerStore
    .update(seller.value?.id, {
      name: updateSeller.value.name,
      email: updateSeller.value.email,
      sigle: updateSeller.value.sigle,
      telephone: updateSeller.value.telephone,
    })
    .then(async (data) => {
      closeModal()

      updateSeller.value = { name: '' }

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
          <h1>Mise à jour du vendeur</h1>

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
        <UForm
          :state="updateSeller"
          :schema="updateSellerSchema"
          class="my-3 space-y-4"
          @submit="store"
        >
          <div class="flex-col gap-2 flex">
            <UFormGroup
              class="w-full"
              label="Nom"
              name="name"
            >
              <UInput
                v-model="updateSeller.company_name"
                required
                placeholder="Nouveau nom"
              />
            </UFormGroup>

            <UFormGroup
              class="w-full"
              label="Siret"
              name="siret"
            >
              <UInput
                v-model="updateSeller.siret"
                required
                placeholder="Nouveau numero de siret"
              />
            </UFormGroup>

            <UFormGroup
              class="w-full"
              label="Numéro de TVA"
              name="vat_number"
            >
              <UInput
                v-model="updateSeller.vat_number"
                required
              />
            </UFormGroup>

            <UFormGroup
              class="w-full"
              label="Taux de commission"
              name="commission_rate"
            >
              <UInput
                v-model="updateSeller.commission_rate"
                required
                type="number"
                placeholder="Taux de commission"
              />
            </UFormGroup>
          </div>

          <div class="flex space-x-2">
            <ButtonSubmit v-model="loading" />

            <UButton
              type="reset"
              color="red"
              label="Annuler"
            />
          </div>
        </UForm>
      </template>
    </UCard>
  </UModal>
</template>
