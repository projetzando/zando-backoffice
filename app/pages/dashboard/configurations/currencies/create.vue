<script setup lang="ts">
definePageMeta({
    name: "Nouvelle devise",
    layout: 'dashboard'
})

const currencyStore = useCurrencyStore()

const { submit, error, errors, loading } = useFormSubmission()

const currency = ref<Currency>({})

function VIEW() {
    return navigateTo('/dashboard/configurations/currencies')
}

function store() {
    submit({
        action: () => currencyStore.store(currency.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            currency.value = { name: '' }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Nouvelle devise"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="currency"
                class="my-3 space-y-4"
                @submit="store"
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
                        color="red"
                        label="Annuler"
                    />
                </div>
            </UForm>
        </FormWrapper>
    </div>
</template>