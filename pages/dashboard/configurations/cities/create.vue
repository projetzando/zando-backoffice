<script setup lang="ts">
definePageMeta({
  name: 'Nouvelle ville',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'],
})

const cityStore = useCityStore()

const { submit, error, errors, loading } = useFormSubmission()

const city = ref<City>({
  name: '',
})

function VIEW() {
  return navigateTo('/dashboard/configurations/cities')
}

function store() {
  submit({
    action: () => cityStore.store(city.value),
    redirect: () => VIEW(),
    onSuccess: () => {
      city.value = { name: '' }
    },
  })
}
</script>

<template>
  <div>
    <ButtonList @return="VIEW" />

    <FormWrapper
      title="Nouvelle ville"
      :errors="errors"
      :error="error"
    >
      <UForm
        :state="city"
        :schema="citySchema"
        class="my-3 space-y-4"
        @submit="store"
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
