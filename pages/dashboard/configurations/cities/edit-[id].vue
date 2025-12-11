<script setup lang="ts">
definePageMeta({
  name: 'Modification d\'une ville',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'],
})

const cityStore = useCityStore()

const route = useRoute()

const { submit, error, errors, loading } = useFormSubmission()

const city = ref<City>({
  name: '',
})

await cityStore.show(route.params.id as string).then((data) => {
  city.value = data.data
})

function VIEW() {
  return navigateTo('/dashboard/configurations/cities')
}

function edit() {
  submit({
    action: () => cityStore.update(city.value.id!, city.value),
    redirect: () => VIEW(),
  })
}
</script>

<template>
  <div>
    <ButtonList @return="VIEW" />

    <FormWrapper
      title="Modification ville"
      :errors="errors"
      :error="error"
    >
      <UForm
        :state="city"
        :schema="citySchema"
        class="my-3 space-y-4"
        @submit="edit"
      >
        <UFormGroup
          class="w-full"
          label="Nom de la ville"
          name="name"
        >
          <UInput
            v-model="city.name"
            required
            placeholder="Nom de la ville"
          />
        </UFormGroup>

        <div class="flex space-x-2">
          <ButtonSubmit v-model="cityStore.loading" />

          <UButton
            type="reset"
            color="red"
            label="Annuler"
            @click="VIEW"
          />
        </div>
      </UForm>
    </FormWrapper>
  </div>
</template>
