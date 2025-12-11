<script setup lang="ts">
const authStore = useAuthStore()
const supabase = useSupabaseClient()

const { submit, error, errors } = useFormSubmission()

// État pour les infos du vendeur
const sellerData = ref<Seller | null>(null)
const loading = ref(false)

// Initialiser le formulaire
const form = ref({
  company_name: '',
  company_description: '',
  phone: '',
  email: '',
  website: '',
})

// Charger les infos du vendeur
async function loadSellerData() {
  if (authStore.connected_user?.role !== 'seller') return

  loading.value = true
  try {
    const { data, error: sellerError } = await supabase
      .from('sellers')
      .select('*')
      .eq('user_id', authStore.connected_user.id)
      .single()

    if (sellerError) {
      console.error('Erreur chargement vendeur:', sellerError)
      return
    }

    sellerData.value = data

    // Remplir le formulaire
    form.value = {
      company_name: data.company_name || '',
      company_description: data.company_description || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
    }
  }
  catch (err) {
    console.error('Erreur:', err)
  }
  finally {
    loading.value = false
  }
}

// Mettre à jour les infos du vendeur
async function updateSellerInfo() {
  submit({
    action: async () => {
      if (!sellerData.value?.id) {
        throw new Error('Données vendeur non chargées')
      }

      const { data, error: updateError } = await supabase
        .from('sellers')
        .update({
          company_name: form.value.company_name,
          company_description: form.value.company_description,
          phone: form.value.phone,
          email: form.value.email,
          website: form.value.website,
        })
        .eq('id', sellerData.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      sellerData.value = data
      return { success: true, data }
    },
  })
}

// Charger au montage
onMounted(() => {
  loadSellerData()
})
</script>

<template>
  <FormWrapper
    v-if="authStore.connected_user?.role === 'seller'"
    title="Informations de mon entreprise"
    :errors="errors"
    :error="error"
  >
    <div
      v-if="loading"
      class="flex justify-center py-8"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-6 h-6 animate-spin"
      />
    </div>

    <UForm
      v-else
      :state="form"
      class="my-3 space-y-4"
      @submit="updateSellerInfo"
    >
      <UFormGroup
        label="Nom de l'entreprise"
        name="company_name"
        required
      >
        <UInput
          v-model="form.company_name"
          required
          placeholder="Nom de votre entreprise"
        />
      </UFormGroup>

      <UFormGroup
        label="Description"
        name="company_description"
      >
        <UTextarea
          v-model="form.company_description"
          placeholder="Description de votre entreprise"
          :rows="4"
        />
      </UFormGroup>

      <div class="tablet:flex-row flex-col gap-2 flex">
        <UFormGroup
          class="w-full"
          label="Téléphone de l'entreprise"
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
          label="Email de l'entreprise"
          name="email"
        >
          <UInput
            v-model="form.email"
            placeholder="Email de contact"
            type="email"
          />
        </UFormGroup>
      </div>

      <UFormGroup
        label="Site web"
        name="website"
      >
        <UInput
          v-model="form.website"
          placeholder="https://www.votresite.com"
          type="url"
        />
      </UFormGroup>

      <UAlert
        v-if="sellerData && !sellerData.is_approved"
        color="orange"
        variant="subtle"
        title="Compte en attente de validation"
        description="Votre compte vendeur est en cours de validation par l'équipe administrative."
        icon="i-heroicons-exclamation-triangle"
      />

      <UAlert
        v-else-if="sellerData && sellerData.is_approved"
        color="green"
        variant="subtle"
        title="Compte validé"
        description="Votre compte vendeur est validé et actif."
        icon="i-heroicons-check-circle"
      />

      <div class="flex space-x-2">
        <ButtonSubmit :model-value="loading" />

        <UButton
          type="reset"
          color="red"
          label="Annuler"
          @click="loadSellerData()"
        />
      </div>
    </UForm>
  </FormWrapper>

  <div
    v-else
    class="p-4 text-center text-gray-500"
  >
    <UIcon
      name="i-heroicons-information-circle"
      class="w-8 h-8 mx-auto mb-2"
    />
    <p>Cette section est réservée aux vendeurs uniquement.</p>
  </div>
</template>
