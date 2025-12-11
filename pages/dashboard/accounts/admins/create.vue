<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

definePageMeta({
  name: "Créer un administrateur",
  layout: "dashboard",
  roles: ['admin', 'superadmin'],
});

const adminStore = useAdminStore();
const toast = useToast();
const router = useRouter();

// État du formulaire
const state = reactive({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  role: 'admin' as 'admin' | 'superadmin',
  password: '',
  password_confirmation: '',
});

const loading = ref(false);
const showPassword = ref(false);
const showPasswordConfirm = ref(false);

// Options pour le select de rôle
const roleOptions = [
  {
    label: 'Administrateur',
    value: 'admin',
    description: 'Accès limité aux fonctionnalités de gestion'
  },
  {
    label: 'Super Administrateur',
    value: 'superadmin',
    description: 'Accès complet à toutes les fonctionnalités'
  }
];

// Soumettre le formulaire
async function onSubmit(event: FormSubmitEvent<any>) {
  loading.value = true;

  try {
    const result = await adminStore.store({
      first_name: state.first_name,
      last_name: state.last_name,
      email: state.email,
      phone: state.phone,
      role: state.role,
      is_active: true,
    });

    if (result.success) {
      toast.add({
        title: 'Administrateur créé',
        description: `${state.first_name} ${state.last_name} a été ajouté avec succès.`,
        color: 'green',
        icon: 'i-heroicons-check-circle',
      });

      // Rediriger vers la liste
      router.push('/dashboard/accounts/admins');
    } else {
      toast.add({
        title: 'Erreur',
        description: result.error?.message || 'Impossible de créer l\'administrateur.',
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

function goBack() {
  router.push('/dashboard/accounts/admins');
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        size="lg"
        color="gray"
        variant="ghost"
        @click="goBack"
      />
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nouvel administrateur</h1>
        <p class="text-sm text-gray-600 mt-1">
          Créer un nouveau compte administrateur pour le backoffice
        </p>
      </div>
    </div>

    <!-- Formulaire -->
    <UForm
      :schema="createAdminSchema"
      :state="state"
      @submit="onSubmit"
      class="space-y-6"
    >
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Formulaire principal -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations personnelles -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Informations personnelles</h3>
            </template>

            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <UFormGroup label="Email" name="email" required>
                <UInput
                  v-model="state.email"
                  type="email"
                  placeholder="admin@example.com"
                  icon="i-heroicons-envelope"
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
            </div>
          </UCard>

          <!-- Sécurité -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Mot de passe</h3>
            </template>

            <div class="space-y-4">
              <UFormGroup label="Mot de passe" name="password" required>
                <UInput
                  v-model="state.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  icon="i-heroicons-lock-closed"
                  size="lg"
                >
                  <template #trailing>
                    <UButton
                      :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                      color="gray"
                      variant="ghost"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </UInput>
                <template #help>
                  <p class="text-xs text-gray-500">Minimum 8 caractères</p>
                </template>
              </UFormGroup>

              <UFormGroup label="Confirmer le mot de passe" name="password_confirmation" required>
                <UInput
                  v-model="state.password_confirmation"
                  :type="showPasswordConfirm ? 'text' : 'password'"
                  placeholder="••••••••"
                  icon="i-heroicons-lock-closed"
                  size="lg"
                >
                  <template #trailing>
                    <UButton
                      :icon="showPasswordConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                      color="gray"
                      variant="ghost"
                      @click="showPasswordConfirm = !showPasswordConfirm"
                    />
                  </template>
                </UInput>
              </UFormGroup>
            </div>
          </UCard>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Rôle -->
          <UCard>
            <template #header>
              <h3 class="text-lg font-semibold">Rôle et permissions</h3>
            </template>

            <UFormGroup label="Rôle" name="role" required>
              <div class="space-y-3">
                <div
                  v-for="option in roleOptions"
                  :key="option.value"
                  class="relative"
                >
                  <label
                    :for="`role-${option.value}`"
                    class="flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-all"
                    :class="[
                      state.role === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    ]"
                  >
                    <input
                      :id="`role-${option.value}`"
                      v-model="state.role"
                      type="radio"
                      :value="option.value"
                      class="mt-1"
                    />
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{{ option.label }}</div>
                      <div class="text-sm text-gray-500 mt-1">{{ option.description }}</div>
                    </div>
                  </label>
                </div>
              </div>
            </UFormGroup>

            <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div class="flex gap-2">
                <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div class="text-sm text-blue-800">
                  <p class="font-medium">À propos des rôles</p>
                  <ul class="mt-2 space-y-1 text-xs">
                    <li><strong>Admin:</strong> Peut gérer les contenus et les utilisateurs</li>
                    <li><strong>Super Admin:</strong> Accès complet incluant la gestion des admins</li>
                  </ul>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Récapitulatif -->
          <UCard>
            <template #header>
              <h3 class="text-base font-semibold">Récapitulatif</h3>
            </template>

            <div class="space-y-3 text-sm">
              <div>
                <span class="text-gray-500">Nom complet:</span>
                <p class="text-gray-900 font-medium mt-1">
                  {{ state.first_name || '-' }} {{ state.last_name || '-' }}
                </p>
              </div>

              <div>
                <span class="text-gray-500">Email:</span>
                <p class="text-gray-900 font-medium mt-1">
                  {{ state.email || '-' }}
                </p>
              </div>

              <div>
                <span class="text-gray-500">Rôle:</span>
                <p class="text-gray-900 font-medium mt-1">
                  <UBadge
                    :color="state.role === 'superadmin' ? 'red' : 'blue'"
                    variant="subtle"
                  >
                    {{ roleOptions.find(r => r.value === state.role)?.label }}
                  </UBadge>
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-4 border-t">
        <UButton
          label="Annuler"
          color="gray"
          size="lg"
          @click="goBack"
        />
        <UButton
          type="submit"
          icon="i-heroicons-check"
          label="Créer l'administrateur"
          size="lg"
          :loading="loading"
        />
      </div>
    </UForm>
  </div>
</template>
