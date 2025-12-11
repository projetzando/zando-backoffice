<script setup lang="ts">
definePageMeta({
  name: 'Gestion des frais',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'], // Configuration réservée aux admins
})

const tabs = [
  {
    label: 'Frais',
    icon: 'heroicons:currency-dollar',
    slot: 'fees',
  },
  {
    label: 'Règles de frais',
    icon: 'heroicons:adjustments-horizontal',
    slot: 'rules',
  },
]

const selectedTab = ref(0)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Gestion des frais
      </h1>
      <p class="text-gray-600 mt-1">
        Configurez les frais et leurs règles d'application
      </p>
    </div>

    <!-- Tabs -->
    <UTabs
      v-model="selectedTab"
      :items="tabs"
      class="w-full"
    >
      <!-- Frais -->
      <template #fees>
        <FeesConfigFees />
      </template>

      <!-- Règles -->
      <template #rules>
        <FeesConfigRules />
      </template>
    </UTabs>
  </div>
</template>
