<script setup lang="ts">
definePageMeta({
  name: 'Modification d\'une catégorie',
  roles: ['admin', 'superadmin'],
  layout: 'dashboard',
})

const categoryStore = useCategoryStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const category = ref<Category>({
  name: '',
})

await categoryStore.show(route.params.id).then((data) => {
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
              v-model="category.name"
              required
              placeholder="Mettre le nom de la catégorie"
            />
          </UFormGroup>
          <UFormGroup
            class="w-full"
            label="Image URL"
            name="image"
          >
            <UInput
              v-model="category.image"
              placeholder="URL de l'image (optionnel)"
            />
          </UFormGroup>

          <UFormGroup
            class="w-full"
            label="Statut"
            name="is_active"
          >
            <UToggle
              v-model="category.is_active"
              label="Catégorie active"
            />
          </UFormGroup>
        </div>

        <div class="flex space-x-2">
          <ButtonSubmit v-model="categoryStore.loading" />

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
