<script setup lang="ts">
definePageMeta({
    name: "Nouvelle catégorie",
    layout: 'dashboard'
})

const categoryStore = useCategoryStore()

const { submit, error, errors, loading } = useFormSubmission()

const category = ref<Category>({
    name: '',
})

function VIEW() {
    return navigateTo('/dashboard/configurations/categories')
}

function store() {
    submit({
        action: () => categoryStore.store(category.value),
        redirect: () => VIEW(),
        onSuccess: () => {
            category.value = { name: '' }
        }
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Nouvelle catégorie"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="category"
                :schema="categorySchema"
                class="my-3 space-y-4"
                @submit="store"
            >
                <div class="md:flex-row flex-col gap-2 flex">
                    <UFormGroup
                        class="w-full"
                        label="Nom"
                        name="name"
                    >
                        <UInput
                            required
                            v-model="category.name"
                            placeholder="Nom de la catégorie"
                        />
                    </UFormGroup>

                    <UFormGroup
                        class="w-full"
                        label="Slug"
                        name="slug"
                    >
                        <UInput
                            required
                            v-model="category.slug"
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
                            v-model="category.level"
                            placeholder="Niveau"
                        />
                    </UFormGroup>

                </div>

                <div class="flex space-x-2">
                    <ButtonSubmit v-model="categoryStore.loading" />

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