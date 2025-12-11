<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  name: 'mon profil',
})

const route = useRoute()

useHead({
  htmlAttrs: {
    lang: 'fr',
  },
  title: route.meta.name?.toUpperCase(),
})

const auth = useAuthStore()

await auth.connectedUser()

// Définir les onglets en fonction du rôle
const items = computed(() => {
  const tabs = [
    {
      slot: 'info',
      label: 'Mes informations personnelles',
    },
    {
      slot: 'password',
      label: 'Mot de passe',
    },
  ]

  // Ajouter l'onglet vendeur si l'utilisateur est un vendeur
  if (auth.connected_user?.role === 'seller') {
    tabs.splice(1, 0, {
      slot: 'seller',
      label: 'Informations de mon entreprise',
    })
  }

  return tabs
})

// Nom d'affichage
const displayName = computed(() => {
  if (auth.profile?.first_name || auth.profile?.last_name) {
    return `${auth.profile.first_name || ''} ${auth.profile.last_name || ''}`.trim()
  }
  return auth.connected_user.email?.split('@')[0] || 'Utilisateur'
})

// Badge du rôle
const roleLabel = computed(() => {
  const labels: Record<string, string> = {
    buyer: 'Acheteur',
    seller: 'Vendeur',
    admin: 'Administrateur',
    superadmin: 'Super Administrateur',
  }
  return labels[auth.connected_user?.role || 'buyer'] || 'Utilisateur'
})

const roleColor = computed(() => {
  const colors: Record<string, string> = {
    buyer: 'blue',
    seller: 'purple',
    admin: 'orange',
    superadmin: 'red',
  }
  return colors[auth.connected_user?.role || 'buyer'] || 'gray'
})
</script>

<template>
  <div class="space-y-6">
    <!-- En-tête du profil -->
    <UCard>
      <div class="flex flex-col items-center justify-center p-4">
        <!-- Avatar ou icône -->
        <div
          v-if="auth.profile?.avatar_url"
          class="mb-4"
        >
          <img
            :src="auth.profile.avatar_url"
            :alt="displayName"
            class="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
          >
        </div>
        <UIcon
          v-else
          class="w-20 h-20 text-gray-400 mb-4"
          name="i-heroicons-user-circle"
        />

        <!-- Nom -->
        <h1 class="text-gray-900 font-bold text-2xl mb-2">
          {{ displayName }}
        </h1>

        <!-- Email -->
        <p class="text-gray-600 text-lg mb-3">
          {{ auth.connected_user.email }}
        </p>

        <!-- Badge du rôle -->
        <UBadge
          :color="roleColor"
          variant="subtle"
          size="lg"
        >
          {{ roleLabel }}
        </UBadge>
      </div>
    </UCard>

    <!-- Onglets -->
    <UTabs
      :items="items"
      class="w-full"
    >
      <template #info>
        <ProfileInfos />
      </template>

      <template
        v-if="auth.connected_user?.role === 'seller'"
        #seller
      >
        <ProfileSellerInfos />
      </template>

      <template #password>
        <ProfilePassword />
      </template>
    </UTabs>
  </div>
</template>
