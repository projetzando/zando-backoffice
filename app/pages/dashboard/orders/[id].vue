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

</script>
<template>
    <div class="space-y-4">
        <ButtonList @return="VIEW" />

        <OrderDetails :order="orderStore.currentOrder" :loading="orderStore.loading" />
    </div>
</template>
<style></style>