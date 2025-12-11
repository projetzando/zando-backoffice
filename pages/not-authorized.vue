<script setup lang="ts">
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full px-6">
      <UCard>
        <div class="text-center py-8">
          <UIcon
            name="i-heroicons-shield-exclamation"
            class="w-20 h-20 text-red-500 mx-auto mb-4"
          />

          <h1 class="text-2xl font-bold text-gray-900 mb-3">
            Accès non autorisé
          </h1>

          <p class="text-gray-600 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>

          <UAlert
            color="orange"
            variant="subtle"
            icon="i-heroicons-information-circle"
            class="mb-6"
          >
            <template #title>
              Rôle actuel : {{ authStore.connected_user?.role || 'Non défini' }}
            </template>
            <template #description>
              Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
            </template>
          </UAlert>

          <div class="flex flex-col gap-3">
            <UButton
              color="primary"
              size="lg"
              block
              icon="i-heroicons-arrow-left"
              @click="$router.back()"
            >
              Retour
            </UButton>

            <UButton
              color="gray"
              variant="ghost"
              size="lg"
              block
              icon="i-heroicons-arrow-right-on-rectangle"
              @click="handleLogout"
            >
              Se déconnecter
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
