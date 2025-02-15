<script setup lang="ts">
const isOpen = defineModel<boolean>('status', { required: true, default: false });

const customer = defineModel<Customer | undefined>('customer', { required: true, default: () => ({}) });

const customerStore = useCustomerStore()

const { handleErrors, handleSuccess } = useHandleErrors();

const updateCustomer = ref<UpdateCustomer>({ name: '' })

const loading = ref<boolean>(false)

const closeModal = () => {
    isOpen.value = false

    updateCustomer.value = { name: '' }
}

function store() {
    loading.value = true

    customerStore.update(customer.value?.id,
        {
            name: updateCustomer.value.name,
            email: updateCustomer.value.email,
            sigle: updateCustomer.value.sigle,
            telephone: updateCustomer.value.telephone,
        }
    ).then(async (data) => {
        closeModal()

        updateCustomer.value = { name: '' }

        handleSuccess(data.message)
        customerStore.show(customer.value?.id)
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
                    <h1> Mise à jour du client</h1>

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
                    :state="updateCustomer"
                    :schema="updateCustomerSchema"
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
                                v-model="updateCustomer.name"
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
                                v-model="updateCustomer.siret"
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
                                v-model="updateCustomer.vat_number"
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
                                v-model="updateCustomer.commission_rate"
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