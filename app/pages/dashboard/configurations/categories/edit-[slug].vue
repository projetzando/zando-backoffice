<script setup lang="ts">
definePageMeta({
    name: "Modification d'une catégorie",
    // roles: ['admin', 'superadmin'],
    layout: 'dashboard'
})

const categoryStore = useCategoryStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const category = ref<Category>({
    name: '',
})

await categoryStore.show(route.params.slug).then((data) => {
    category.value = data.data
})

function VIEW() {
    return navigateTo('/dashboard/configurations/categories')
}

function edit() {
    submit({
        action: () => categoryStore.update(category.value.id, category.value),
        redirect: () => VIEW(),
    })
}
</script>

<template>
    <div>
        <ButtonList @return="VIEW" />

        <FormWrapper
            title="Modification catégorie"
            :errors="errors"
            :error="error"
        >
            <UForm
                :state="category"
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
                            v-model="category.name"
                            placeholder="Mettre le nom de la catégorie"
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