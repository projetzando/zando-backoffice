<script lang="ts" setup>
definePageMeta({
  layout: "dashboard",
  name: "Tableau de bord"
});

const loader = ref<Boolean>(true)

const cardData = ref<any[]>([
  {
    provenance: 'Commandes en cours',
    number: 72,
    isMonetary: false,
    title: 'Commandes',
    color: 'emerald',
    icon: 'i-heroicons-shopping-cart'
  },
  {
    provenance: 'Bénéfice net',
    number: 12650,
    isMonetary: true,
    title: 'Bénéfice net',
    color: 'emerald',
    icon: 'i-heroicons-rectangle-stack-20-solid'
  },
  {
    provenance: 'Utilisateurs actifs',
    number: 35,
    isMonetary: false,
    title: 'Utilisateurs',
    color: 'emerald',
    icon: 'i-heroicons-users'
  }
])
</script>
<template>
  <div>
    <div class="py-4">
      <div class="flex flex-col gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-start">
        <div class="grow">
          <h1 class="mb-1 text-xl font-bold">Vue d'ensemble</h1>

          <h2 class="text-sm font-medium text-slate-500">
            Bienvenue dans votre tableau de bord
          </h2>
        </div>

        <div
          class="flex flex-none gap-2 justify-center items-center px-2 rounded sm:justify-end sm:bg-transparent sm:px-0">
          <UButton color="primary" to="/dashboard/orders" label="Commandes en cours" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3 lg:gap-8">
      <CardDashboard v-for="item in cardData" :key="item.title" :provenance="item.provenance" :icon="item.icon"
        :number="item.number" :title="item.title" :color="item.color" :isMonetary="item.isMonetary" />
    </div>

    <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2 lg:gap-8">
        <StatTauxReussite />
        <StatContributor />
    </div>

    <Chart v-if="loader" class="py-4 mt-5 bg-white rounded-xl" />
  </div>
</template>
<style></style>