<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

const props = defineProps<{
  admin: Admin
}>();

const adminStore = useAdminStore();
const toast = useToast();

const showModal = ref(false);
const loading = ref(false);

const state = reactive({
  first_name: props.admin.first_name || '',
  last_name: props.admin.last_name || '',
  phone: props.admin.phone || '',
  avatar_url: props.admin.avatar_url || '',
});

// Réinitialiser le formulaire quand on ouvre le modal
watch(showModal, (isOpen) => {
  if (isOpen) {
    state.first_name = props.admin.first_name || '';
    state.last_name = props.admin.last_name || '';
    state.phone = props.admin.phone || '';
    state.avatar_url = props.admin.avatar_url || '';
  }
});

async function onSubmit(event: FormSubmitEvent<any>) {
  if (!props.admin.id) return;

  loading.value = true;

  try {
    const result = await adminStore.update(props.admin.id, {
      first_name: state.first_name,
      last_name: state.last_name,
      phone: state.phone,
      avatar_url: state.avatar_url,
    });

    if (result.success) {
      toast.add({
        title: 'Modifications enregistrées',
        description: 'Les informations ont été mises à jour avec succès.',
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });
      showModal.value = false;
    } else {
      toast.add({
        title: 'Erreur',
        description: result.error?.message || 'Impossible de mettre à jour les informations.',
        color: 'red',
        icon: 'i-heroicons-exclamation-triangle',
      });
    }
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.message || 'Une erreur est survenue.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    });
  } finally {
    loading.value = false;
  }
}

defineExpose({
  showModal
});
</script>

<template>
  <div>
    <UButton
      icon="i-heroicons-pencil"
      label="Modifier"
      @click="showModal = true"
    />

    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Modifier les informations</h3>
        </template>

        <UForm
          :schema="updateAdminSchema"
          :state="state"
          @submit="onSubmit"
          class="space-y-4"
        >
          <UFormGroup label="Prénom" name="first_name" required>
            <UInput
              v-model="state.first_name"
              placeholder="John"
              icon="i-heroicons-user"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Nom" name="last_name" required>
            <UInput
              v-model="state.last_name"
              placeholder="Doe"
              icon="i-heroicons-user"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Téléphone" name="phone">
            <UInput
              v-model="state.phone"
              type="tel"
              placeholder="+242 XX XXX XXXX"
              icon="i-heroicons-phone"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="URL de l'avatar" name="avatar_url">
            <UInput
              v-model="state.avatar_url"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              icon="i-heroicons-photo"
              size="lg"
            />
          </UFormGroup>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton
                label="Annuler"
                color="gray"
                @click="showModal = false"
              />
              <UButton
                type="submit"
                label="Enregistrer"
                :loading="loading"
              />
            </div>
          </template>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>
