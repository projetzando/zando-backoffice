<script setup lang="ts">
definePageMeta({
    name: 'Gestion des catégories',
    layout: 'dashboard'
})

const tabs = [
    {
        label: 'Catégories',
        icon: 'heroicons:tag',
        slot: 'categories'
    },
    {
        label: 'Domaines vendeurs',
        icon: 'heroicons:globe-alt',
        slot: 'domains'
    }
]

const selectedTab = ref(0)
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div>
            <h1 class="text-2xl font-bold text-gray-900">Gestion des catégories</h1>
            <p class="text-gray-600 mt-1">Configurez les catégories de produits et les domaines de vendeurs</p>
        </div>

        <!-- Tabs -->
        <UTabs v-model="selectedTab" :items="tabs" class="w-full">
            <!-- Catégories -->
            <template #categories>
                <CategoriesConfigCategories />
            </template>

            <!-- Domaines -->
            <template #domains>
                <CategoriesConfigDomains />
            </template>
        </UTabs>
    </div>
</template>
