<script setup lang="ts">
const props = defineProps<{
  admin: Admin
}>();

const emit = defineEmits(['deleted']);

const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToast();

const showModal = ref(false);
const loading = ref(false);
const confirmText = ref('');

const isConfirmValid = computed(() => {
  const expectedText = `${props.admin.first_name} ${props.admin.last_name}`;
  return confirmText.value.toLowerCase() === expectedText.toLowerCase();
});

async function deleteAdmin() {
  if (!props.admin.id || !isConfirmValid.value) return;

  // Empêcher de supprimer son propre compte
  if (props.admin.id === authStore.connected_user?.id) {
    toast.add({
      title: 'Action interdite',
      description: 'Vous ne pouvez pas supprimer votre propre compte.',
      color: 'red',
      icon: 'i-heroicons-shield-exclamation',
    });
    return;
  }

  // Vérifier que ce n'est pas le dernier superadmin
  if (props.admin.role === 'superadmin') {
    const superadminsCount = adminStore.admins.filter(a => a.role === 'superadmin').length;
    if (superadminsCount <= 1) {
      toast.add({
        title: 'Action interdite',
        description: 'Vous ne pouvez pas supprimer le dernier super administrateur.',
        color: 'red',
        icon: 'i-heroicons-shield-exclamation',
      });
      return;
    }
  }

  loading.value = true;

  try {
    const result = await adminStore.destroy(props.admin.id);

    if (result.success) {
      toast.add({
        title: 'Supprimé',
        description: 'L\'administrateur a été supprimé avec succès.',
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });
      showModal.value = false;
      emit('deleted');
    } else {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'administrateur.',
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

watch(showModal, (isOpen) => {
  if (!isOpen) {
    confirmText.value = '';
  }
});

defineExpose({
  showModal
});
</script>

<template>
  <div>
    <UButton
      icon="i-heroicons-trash"
      label="Supprimer"
      color="red"
      @click="showModal = true"
    />

    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-red-100 rounded-lg">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600" />
            </div>
            <h3 class="text-lg font-semibold text-red-600">Supprimer l'administrateur</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800 font-medium">
              ⚠️ Cette action est irréversible
            </p>
            <p class="text-sm text-red-700 mt-2">
              Vous êtes sur le point de supprimer définitivement le compte administrateur de
              <strong>{{ admin.first_name }} {{ admin.last_name }}</strong>.
            </p>
          </div>

          <div>
            <p class="text-sm text-gray-600 mb-2">
              Pour confirmer, veuillez taper le nom complet de l'administrateur :
            </p>
            <p class="text-sm font-mono font-semibold text-gray-900 mb-3 p-2 bg-gray-100 rounded">
              {{ admin.first_name }} {{ admin.last_name }}
            </p>
            <UInput
              v-model="confirmText"
              placeholder="Tapez le nom complet ici"
              size="lg"
            />
          </div>

          <div v-if="admin.role === 'superadmin'" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex gap-2">
              <UIcon name="i-heroicons-shield-exclamation" class="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Suppression d'un Super Admin</p>
                <p class="mt-1">Assurez-vous qu'il existe au moins un autre super administrateur avant de continuer.</p>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              label="Annuler"
              color="gray"
              @click="showModal = false"
            />
            <UButton
              label="Supprimer définitivement"
              color="red"
              icon="i-heroicons-trash"
              :loading="loading"
              :disabled="!isConfirmValid"
              @click="deleteAdmin"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
