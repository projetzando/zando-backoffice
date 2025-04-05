<script setup lang="ts">
definePageMeta({
    name: "Modification d'une devise",
    // roles: ['admin', 'superadmin'],
    layout: 'dashboard'
})

const currencyStore = useCurrencyStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const currency = ref<Currency>({
    code: '',
})

await currencyStore.show(route.params.id).then((data) => {
    currency.value = data.data
})

function VIEW() {
    return navigateTo('/dashboard/configurations/currencies')
}

function edit() {
    submit({
        action: () => currencyStore.update(currency.value.id, currency.value),
        redirect: () => VIEW(),
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Modification devise"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="currency"
                class="my-3 space-y-4"
                @submit="edit"
            >
                <div class="tablet:flex-row flex-col gap-2 flex">
                    <UFormGroup
                        class="w-full"
                        label="Code"
                        name="code"
                    >
                        <UInput
                            required
                            v-model="currency.code"
                            placeholder="Code de la devise"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Symbôle"
                        name="symbol"
                    >
                        <UInput
                            required
                            v-model="currency.symbol"
                            placeholder="Symbôle de la devise"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Taux"
                        name="rate"
                    >
                        <UInput
                            required
                            type="number"
                            v-model="currency.rate"
                            placeholder="Taux de la devise"
                        />
                    </UFormGroup>
                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="currencyStore.loading" />

                    <UButton
                        type="reset"
                        color="error"
                        label="Annuler"
                    />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>