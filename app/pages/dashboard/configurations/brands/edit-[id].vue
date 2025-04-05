<script setup lang="ts">
definePageMeta({
    name: "Modification d'une marque",
    // roles: ['admin', 'superadmin'],
    layout: 'dashboard'
})

const brandStore = useBrandStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const brand = ref<Brand>({
    name: '',
    image: '',
    is_featured: false
})

await brandStore.show(route.params.id).then((data) => {
    brand.value = data.data
})

function VIEW() {
    return navigateTo('/dashboard/configurations/brands')
}

function edit() {
    submit({
        action: () => brandStore.update(brand.value.id, brand.value),
        redirect: () => VIEW(),
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Modification marque"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="brand"
                class="my-3 space-y-4"
                @submit="edit"
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
                            placeholder="Mettre le nom de la marque"
                        />
                    </UFormGroup>
                    <UFormGroup
                        class="w-full"
                        label="Is featured"
                        name="is_featured"
                    >
                        <UCheckbox v-model="brand.is_featured" name="is_featured" label="Is featured" />
                    </UFormGroup>
                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="brandStore.loading" />

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