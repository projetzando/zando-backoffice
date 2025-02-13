<script setup lang="ts">
definePageMeta({
    name: "Nouvelle marque",
    layout: 'dashboard'
})

const brandStore = useBrandStore()

const { submit, error, errors, loading } = useFormSubmission()

const brand = ref<Brand>({
    name: '',
})

function VIEW() {
    return navigateTo('/dashboard/configurations/brands')
}

function store() {
    submit({
        action: () => brandStore.store(brand.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            brand.value = { name: '' }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Nouvelle marque"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="brand"
                :schema="brandSchema"
                class="my-3 space-y-4"
                @submit="store"
            >
                <div class="tablet:flex-row flex-col gap-2 flex">
                    <UFormGroup
                        class="w-full"
                        label="Nom"
                        name="name"
                    >
                        <UInput
                            required
                            v-model="brand.name"
                            placeholder="Nom de la marque"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Slug"
                        name="slug"
                    >
                        <UInput
                            required
                            v-model="brand.slug"
                            placeholder="Slug"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Niveau"
                        name="level"
                    >
                        <UInput
                            required
                            type="number"
                            v-model="brand.level"
                            placeholder="Niveau"
                        />
                    </UFormGroup>

                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="brandStore.loading" />

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