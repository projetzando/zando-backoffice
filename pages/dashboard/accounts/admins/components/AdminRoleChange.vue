<script setup lang="ts">
const props = defineProps<{
  admin: Admin
}>();

const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToast();

const showModal = ref(false);
const loading = ref(false);
const selectedRole = ref<'admin' | 'superadmin'>(props.admin.role || 'admin');

watch(showModal, (isOpen) => {
  if (isOpen) {
    selectedRole.value = props.admin.role || 'admin';
  }
});

async function updateRole() {
  if (!props.admin.id) return;

  // Vérifier que ce n'est pas le dernier superadmin
  if (props.admin.role === 'superadmin' && selectedRole.value === 'admin') {
    const superadminsCount = adminStore.admins.filter(a => a.role === 'superadmin').length;
    if (superadminsCount <= 1) {
      toast.add({
        title: 'Action interdite',
        description: 'Il doit rester au moins un super administrateur.',
        color: 'red',
        icon: 'i-heroicons-shield-exclamation',
      });
      return;
    }
  }

  loading.value = true;

  try {
    const result = await adminStore.updateRole(props.admin.id, selectedRole.value);

    if (result.success) {
      toast.add({
        title: 'Rôle modifié',
        description: `Le rôle a été changé en ${selectedRole.value === 'superadmin' ? 'Super Admin' : 'Admin'}.`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });
      showModal.value = false;
    } else {
      toast.add({
        title: 'Erreur',
        description: 'Impossible de modifier le rôle.',
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
      icon="i-heroicons-shield-check"
      label="Changer le rôle"
      color="orange"
      @click="showModal = true"
    />

    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Changer le rôle</h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Sélectionnez le nouveau rôle pour
            <strong>{{ admin.first_name }} {{ admin.last_name }}</strong>
          </p>

          <div class="space-y-3">
            <label
              class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all"
              :class="[
                selectedRole === 'admin'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <input
                v-model="selectedRole"
                type="radio"
                value="admin"
                class="mt-1"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">Administrateur</div>
                <div class="text-sm text-gray-500 mt-1">
                  Accès limité aux fonctionnalités de gestion
                </div>
              </div>
              <UBadge v-if="admin.role === 'admin'" color="blue" variant="subtle">
                Actuel
              </UBadge>
            </label>

            <label
              class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all"
              :class="[
                selectedRole === 'superadmin'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <input
                v-model="selectedRole"
                type="radio"
                value="superadmin"
                class="mt-1"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-900">Super Administrateur</div>
                <div class="text-sm text-gray-500 mt-1">
                  Accès complet à toutes les fonctionnalités
                </div>
              </div>
              <UBadge v-if="admin.role === 'superadmin'" color="red" variant="subtle">
                Actuel
              </UBadge>
            </label>
          </div>

          <div v-if="admin.role === 'superadmin' && selectedRole === 'admin'" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div class="text-sm text-yellow-800">
                <p class="font-medium">Attention</p>
                <p class="mt-1">Vous êtes sur le point de rétrograder un super administrateur. Cette action réduira ses permissions.</p>
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
              label="Modifier le rôle"
              color="orange"
              :loading="loading"
              :disabled="selectedRole === admin.role"
              @click="updateRole"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
