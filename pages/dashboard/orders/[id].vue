<script lang="ts" setup>
definePageMeta({
    layout: 'dashboard',
    name: "Détails d'une commande"
})

const route = useRoute()

const orderStore = useOrderStore();

orderStore.show(route.params.id)

function VIEW() {
    return navigateTo('/dashboard/orders')
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

        <h1>Détails de la commande</h1>
        <pre>
            {{ orderStore.currentOrder }}
        </pre>
    </div>
</template>
<style></style>