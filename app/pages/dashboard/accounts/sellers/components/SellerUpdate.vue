<script setup lang="ts">
const isOpen = defineModel<boolean>('status', { required: true, default: false });

const seller = defineModel<Seller | undefined>('seller', { required: true, default: () => ({}) });

const sellerStore = useSellerStore()

const { handleErrors, handleSuccess } = useHandleErrors();

const updateSeller = ref<UpdateSeller>({ name: '' })

const loading = ref<boolean>(false)

const closeModal = () => {
    isOpen.value = false

    updateSeller.value = { name: '' }
}

function store() {
    loading.value = true

    sellerStore.update(seller.value?.id,
        {
            name: updateSeller.value.name,
            email: updateSeller.value.email,
            sigle: updateSeller.value.sigle,
            telephone: updateSeller.value.telephone,
        }
    ).then(async (data) => {
        closeModal()

        updateSeller.value = { name: '' }

        handleSuccess(data.message)
        sellerStore.show(seller.value?.id)
    }).catch((error: SupabaseResponse) => {
        handleErrors(error)
    }).finally(() => {
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
                    <h1> Mise à jour du vendeur</h1>

                    <UButton
                        @click="closeModal"
                        icon="i-heroicons-x-circle"
                        color="primary"
                        variant="ghost"
                        :trailing="false"
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
                                required
                                v-model="updateSeller.company_name"
                                placeholder="Nouveau nom"
                            />
                        </UFormGroup>

                        <UFormGroup
                            class="w-full"
                            label="Siret"
                            name="siret"
                        >
                            <UInput
                                required
                                v-model="updateSeller.siret"
                                placeholder="Nouveau numero de siret"
                            />
                        </UFormGroup>

                        <UFormGroup
                            class="w-full"
                            label="Numéro de TVA"
                            name="vat_number"
                        >
                            <UInput
                                required
                                v-model="updateSeller.vat_number"
                            />
                        </UFormGroup>

                        <UFormGroup
                            class="w-full"
                            label="Taux de commission"
                            name="commission_rate"
                        >
                            <UInput
                                required
                                type="number"
                                v-model="updateSeller.commission_rate"
                                placeholder="Taux de commission"
                            />
                        </UFormGroup>
                    </div>

                    <div class="flex space-x-2">
                        <ButtonSubmit v-model="loading" />

                        <UButton
                            type="reset"
                            color="error"
                            label="Annuler"
                        />
                    </div>
                </UForm>
            </template>
        </UCard>
    </UModal>
</template>