<script lang="ts" setup>
definePageMeta({
  layout: "dashboard",
  name: "Détails d'un administrateur",
});

const route = useRoute();
const adminStore = useAdminStore();
const authStore = useAuthStore();
const toast = useToast();

// Charger les détails de l'admin
const { data: admin, pending } = await useLazyAsyncData(
  `admin-${route.params.id}`,
  () => adminStore.show(route.params.id as string)
);

const { currentAdmin } = storeToRefs(adminStore);

// États pour le modal de modification
const showEditModal = ref(false);
const showRoleModal = ref(false);
const showDeleteModal = ref(false);

const editForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  avatar_url: '',
});

// Statistiques de l'admin (activités)
const adminStats = ref({
  lastLogin: null,
  actionsCount: 0,
  recentActions: [],
});

// Fonction pour charger les statistiques
async function loadAdminStats() {
  if (!currentAdmin.value?.id) return;

  try {
    const supabase = useSupabaseClient();

    // Récupérer les activités de l'admin (si vous avez une table d'audit)
    // const { data: activities } = await supabase
    //   .from('admin_activities')
    //   .select('*')
    //   .eq('admin_id', currentAdmin.value.id)
    //   .order('created_at', { ascending: false })
    //   .limit(10);

    adminStats.value = {
      lastLogin: currentAdmin.value.last_login,
      actionsCount: 0,
      recentActions: [],
    };
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
  }
}

// Charger les stats quand l'admin change
watch(
  currentAdmin,
  (newAdmin) => {
    if (newAdmin?.id) {
      loadAdminStats();
      // Remplir le formulaire d'édition
      editForm.value = {
        first_name: newAdmin.first_name || '',
        last_name: newAdmin.last_name || '',
        phone: newAdmin.phone || '',
        avatar_url: newAdmin.avatar_url || '',
      };
    }
  },
  { immediate: true }
);

function goBack() {
  return navigateTo("/dashboard/accounts/admins");
}

function getCompanyInitials(admin: any) {
  const first = admin.first_name?.charAt(0) || "";
  const last = admin.last_name?.charAt(0) || "";
  return (first + last).toUpperCase();
}

function formatDate(date: string) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getRoleBadgeColor(role: string) {
  return role === 'superadmin' ? 'red' : 'blue';
}

function getRoleLabel(role: string) {
  return role === 'superadmin' ? 'Super Admin' : 'Admin';
}

// Mettre à jour les informations
async function updateAdminInfo() {
  if (!currentAdmin.value?.id) return;

  const result = await adminStore.update(currentAdmin.value.id, editForm.value);

  if (result.success) {
    toast.add({
      title: 'Succès',
      description: 'Les informations ont été mises à jour.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    });
    showEditModal.value = false;
  } else {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de mettre à jour les informations.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    });
  }
}

// Changer le rôle
async function updateRole(newRole: 'admin' | 'superadmin') {
  if (!currentAdmin.value?.id) return;

  // Vérifier que ce n'est pas le dernier superadmin
  if (currentAdmin.value.role === 'superadmin') {
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

  const result = await adminStore.updateRole(currentAdmin.value.id, newRole);

  if (result.success) {
    toast.add({
      title: 'Rôle modifié',
      description: `Le rôle a été changé en ${getRoleLabel(newRole)}.`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    });
    showRoleModal.value = false;
  } else {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de modifier le rôle.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    });
  }
}

// Supprimer l'admin
async function deleteAdmin() {
  if (!currentAdmin.value?.id) return;

  // Empêcher de supprimer son propre compte
  if (currentAdmin.value.id === authStore.connected_user?.id) {
    toast.add({
      title: 'Action interdite',
      description: 'Vous ne pouvez pas supprimer votre propre compte.',
      color: 'red',
      icon: 'i-heroicons-shield-exclamation',
    });
    return;
  }

  // Vérifier que ce n'est pas le dernier superadmin
  if (currentAdmin.value.role === 'superadmin') {
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

  const result = await adminStore.destroy(currentAdmin.value.id);

  if (result.success) {
    toast.add({
      title: 'Supprimé',
      description: 'L\'administrateur a été supprimé.',
      color: 'green',
      icon: 'i-heroicons-check-circle',
    });
    navigateTo('/dashboard/accounts/admins');
  } else {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer l\'administrateur.',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    });
  }
}

// Activer/Désactiver
async function toggleStatus() {
  if (!currentAdmin.value) return;

  // Empêcher de désactiver son propre compte
  if (currentAdmin.value.id === authStore.connected_user?.id) {
    toast.add({
      title: 'Action interdite',
      description: 'Vous ne pouvez pas désactiver votre propre compte.',
      color: 'red',
      icon: 'i-heroicons-shield-exclamation',
    });
    return;
  }

  const result = await adminStore.toggleStatus(currentAdmin.value.id!);

  if (result.success) {
    toast.add({
      title: 'Statut mis à jour',
      description: `L'administrateur a été ${currentAdmin.value.is_active ? 'désactivé' : 'activé'}.`,
      color: 'green',
      icon: 'i-heroicons-check-circle',
    });
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-heroicons-arrow-left"
          size="lg"
          color="gray"
          variant="ghost"
          @click="goBack"
        />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ currentAdmin?.first_name }} {{ currentAdmin?.last_name }}
          </h1>
          <p class="text-sm text-gray-600 mt-1">
            Détails de l'administrateur
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <UButton
          v-role="'superadmin'"
          icon="i-heroicons-pencil"
          label="Modifier"
          @click="showEditModal = true"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Admin not found -->
    <UCard v-else-if="!currentAdmin" class="text-center py-12">
      <UIcon name="i-heroicons-user-circle" class="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Administrateur introuvable</h3>
      <p class="text-gray-600 mb-4">
        L'administrateur que vous recherchez n'existe pas ou a été supprimé.
      </p>
      <UButton label="Retour à la liste" @click="goBack" />
    </UCard>

    <!-- Admin details -->
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations générales -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">Informations générales</h3>
                <UBadge
                  :color="currentAdmin.is_active ? 'green' : 'gray'"
                  variant="subtle"
                >
                  {{ currentAdmin.is_active ? 'Actif' : 'Inactif' }}
                </UBadge>
              </div>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-gray-700">Prénom</label>
                  <p class="mt-1 text-sm text-gray-900">{{ currentAdmin.first_name || '-' }}</p>
                </div>
                <div>
                  <label class="text-sm font-medium text-gray-700">Nom</label>
                  <p class="mt-1 text-sm text-gray-900">{{ currentAdmin.last_name || '-' }}</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Email</label>
                <p class="mt-1 text-sm text-gray-900">{{ currentAdmin.email || '-' }}</p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Téléphone</label>
                <p class="mt-1 text-sm text-gray-900">{{ currentAdmin.phone || '-' }}</p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Rôle</label>
                <div class="mt-1">
                  <UBadge
                    :color="getRoleBadgeColor(currentAdmin.role!)"
                    variant="subtle"
                  >
                    {{ getRoleLabel(currentAdmin.role!) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Actions dangereuses -->
          <UCard v-role="'superadmin'">
            <template #header>
              <h3 class="text-lg font-semibold text-red-600">Zone dangereuse</h3>
            </template>

            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ currentAdmin.is_active ? 'Désactiver' : 'Activer' }} le compte
                  </h4>
                  <p class="text-sm text-gray-500">
                    {{ currentAdmin.is_active
                      ? 'L\'administrateur ne pourra plus se connecter'
                      : 'L\'administrateur pourra à nouveau se connecter'
                    }}
                  </p>
                </div>
                <UButton
                  :color="currentAdmin.is_active ? 'red' : 'green'"
                  :label="currentAdmin.is_active ? 'Désactiver' : 'Activer'"
                  @click="toggleStatus"
                />
              </div>

              <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 class="text-sm font-medium text-gray-900">Changer le rôle</h4>
                  <p class="text-sm text-gray-500">
                    Modifier les permissions de cet administrateur
                  </p>
                </div>
                <UButton
                  color="orange"
                  label="Modifier le rôle"
                  @click="showRoleModal = true"
                />
              </div>

              <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h4 class="text-sm font-medium text-red-900">Supprimer l'administrateur</h4>
                  <p class="text-sm text-red-700">
                    Cette action est irréversible
                  </p>
                </div>
                <UButton
                  color="red"
                  label="Supprimer"
                  @click="showDeleteModal = true"
                />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Photo de profil -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                <img
                  v-if="currentAdmin.avatar_url"
                  :src="currentAdmin.avatar_url"
                  :alt="`${currentAdmin.first_name} ${currentAdmin.last_name}`"
                  class="h-32 w-32 rounded-full object-cover"
                />
                <span v-else class="text-4xl font-bold text-primary-700">
                  {{ getCompanyInitials(currentAdmin) }}
                </span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ currentAdmin.first_name }} {{ currentAdmin.last_name }}
              </h3>
              <p class="text-sm text-gray-600">{{ currentAdmin.email }}</p>
            </div>
          </UCard>

          <!-- Métadonnées -->
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold">Métadonnées</h3>
            </template>

            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-500">ID:</span>
                <p class="text-gray-900 font-mono text-xs mt-1 break-all">
                  {{ currentAdmin.id }}
                </p>
              </div>

              <div>
                <span class="text-gray-500">Créé le:</span>
                <p class="text-gray-900 mt-1">
                  {{ formatDate(currentAdmin.created_at!) }}
                </p>
              </div>

              <div v-if="currentAdmin.last_login">
                <span class="text-gray-500">Dernière connexion:</span>
                <p class="text-gray-900 mt-1">
                  {{ formatDate(currentAdmin.last_login) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>

    <!-- Modal de modification -->
    <UModal v-model="showEditModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Modifier les informations</h3>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Prénom">
            <UInput v-model="editForm.first_name" />
          </UFormGroup>

          <UFormGroup label="Nom">
            <UInput v-model="editForm.last_name" />
          </UFormGroup>

          <UFormGroup label="Téléphone">
            <UInput v-model="editForm.phone" />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Annuler" color="gray" @click="showEditModal = false" />
            <UButton label="Enregistrer" @click="updateAdminInfo" />
          </div>
        </template>
      </UCard>
    </UModal>

    <!-- Modal de changement de rôle -->
    <UModal v-model="showRoleModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Changer le rôle</h3>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">
            Sélectionnez le nouveau rôle pour cet administrateur
          </p>

          <div class="space-y-2">
            <UButton
              block
              :color="currentAdmin?.role === 'admin' ? 'primary' : 'gray'"
              @click="updateRole('admin')"
            >
              <div class="text-left">
                <div class="font-semibold">Admin</div>
                <div class="text-xs opacity-75">Accès limité aux fonctionnalités</div>
              </div>
            </UButton>

            <UButton
              block
              :color="currentAdmin?.role === 'superadmin' ? 'primary' : 'gray'"
              @click="updateRole('superadmin')"
            >
              <div class="text-left">
                <div class="font-semibold">Super Admin</div>
                <div class="text-xs opacity-75">Accès complet à toutes les fonctionnalités</div>
              </div>
            </UButton>
          </div>
        </div>

        <template #footer>
          <UButton label="Fermer" color="gray" @click="showRoleModal = false" />
        </template>
      </UCard>
    </UModal>

    <!-- Modal de confirmation de suppression -->
    <UModal v-model="showDeleteModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">Confirmer la suppression</h3>
        </template>

        <p class="text-sm text-gray-600">
          Êtes-vous sûr de vouloir supprimer l'administrateur
          <strong>{{ currentAdmin?.first_name }} {{ currentAdmin?.last_name }}</strong> ?
          Cette action est irréversible.
        </p>

        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton label="Annuler" color="gray" @click="showDeleteModal = false" />
            <UButton label="Supprimer" color="red" @click="deleteAdmin" />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
