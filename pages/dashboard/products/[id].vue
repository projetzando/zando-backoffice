<script lang="ts" setup>
definePageMeta({
    layout: 'dashboard',
    name: "Détails d'un produit"
})

const route = useRoute()

const productStore = useProductStore();

productStore.show(route.params.id)

function VIEW() {
    return navigateTo('/dashboard/products')
}

const items = [
    {
        slot: 'info',
        label: 'Details',
    },
    {
        slot: 'order',
        label: 'Commandes',
    }
]

const openAddress = ref(false)

const openUpdate = ref(false)

const openActivate = ref(false)
</script>
<template>
    <div>
        <ButtonList @return="VIEW" />

        <h1>Détails du produit</h1>
    </div>
</template>
<style></style>