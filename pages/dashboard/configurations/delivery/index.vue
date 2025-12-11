<script setup lang="ts">
definePageMeta({
    name: 'Configuration de livraison',
    layout: 'dashboard',
    roles: ['admin', 'superadmin'], // Configuration réservée aux admins
})

const tabs = [
    {
        label: 'Villes',
        icon: 'heroicons:map-pin',
        slot: 'cities'
    },
    {
        label: 'Quartiers',
        icon: 'heroicons:building-office',
        slot: 'areas'
    },
    {
        label: 'Zones de livraison',
        icon: 'heroicons:globe-alt',
        slot: 'zones'
    },
    {
        label: 'Tarifs',
        icon: 'heroicons:currency-dollar',
        slot: 'pricings'
    }
]

const selectedTab = ref(0)
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Configuration de livraison</h1>
            <p class="text-gray-600 mt-1">Gérez les villes, quartiers, zones et tarifs de livraison</p>
        </div>

        <!-- Tabs -->
        <UTabs v-model="selectedTab" :items="tabs" class="w-full">
            <!-- Villes -->
            <template #cities>
                <DeliveryConfigCities />
            </template>

            <!-- Quartiers -->
            <template #areas>
                <DeliveryConfigAreas />
            </template>

            <!-- Zones de livraison -->
            <template #zones>
                <DeliveryConfigZones />
            </template>

            <!-- Tarifs -->
            <template #pricings>
                <DeliveryConfigPricings />
            </template>
        </UTabs>
    </div>
</template>
