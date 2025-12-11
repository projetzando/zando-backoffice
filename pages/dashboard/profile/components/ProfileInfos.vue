<script setup lang="ts">
const authStore = useAuthStore()

const { submit, error, errors, loading } = useFormSubmission()

// Initialiser le formulaire avec les données du profil
const form = ref<Partial<Profile>>({
  first_name: authStore.profile?.first_name || '',
  last_name: authStore.profile?.last_name || '',
  phone: authStore.profile?.phone || '',
  avatar_url: authStore.profile?.avatar_url || '',
})

// Synchroniser avec le profil quand il change
watch(
  () => authStore.profile,
  (newProfile) => {
    if (newProfile) {
      form.value = {
        first_name: newProfile.first_name || '',
        last_name: newProfile.last_name || '',
        phone: newProfile.phone || '',
        avatar_url: newProfile.avatar_url || '',
      }
    }
  },
  { immediate: true },
)

async function updateProfile() {
  submit({
    action: () => authStore.updateProfile(form.value),
  })
}
</script>

<template>
  <FormWrapper
    title="Mes informations personnelles"
    :errors="errors"
    :error="error"
  >
    <UForm
      :state="form"
      class="my-3 space-y-4"
      @submit="updateProfile"
    >
      <div class="tablet:flex-row flex-col gap-2 flex">
        <UFormGroup
          class="w-full"
          label="Prénom"
          name="first_name"
        >
          <UInput
            v-model="form.first_name"
            required
            placeholder="Prénom"
          />
        </UFormGroup>

        <UFormGroup
          class="w-full"
          label="Nom"
          name="last_name"
        >
          <UInput
            v-model="form.last_name"
            required
            placeholder="Nom de famille"
          />
        </UFormGroup>
      </div>

      <div class="tablet:flex-row flex-col gap-2 flex">
        <UFormGroup
          class="w-full"
          label="Téléphone"
          name="phone"
        >
          <UInput
            v-model="form.phone"
            placeholder="Numéro de téléphone"
            type="tel"
          />
        </UFormGroup>

        <UFormGroup
          class="w-full"
          label="Email"
          name="email"
        >
          <UInput
            disabled
            :model-value="authStore.connected_user.email"
            placeholder="Adresse email"
            type="email"
          />
        </UFormGroup>
      </div>

      <UFormGroup
        label="Rôle"
        name="role"
      >
        <UInput
          disabled
          :model-value="authStore.profile?.role || 'buyer'"
          placeholder="Rôle"
        />
      </UFormGroup>

      <div class="flex space-x-2">
        <ButtonSubmit v-model="authStore.loading" />

        <UButton
          type="reset"
          color="red"
          label="Annuler"
          @click="
            form = {
              first_name: authStore.profile?.first_name || '',
              last_name: authStore.profile?.last_name || '',
              phone: authStore.profile?.phone || '',
              avatar_url: authStore.profile?.avatar_url || '',
            }
          "
        />
      </div>
    </UForm>
  </FormWrapper>
</template>
