<script setup lang='ts'>
defineProps<{
    customer: Customer
}>()

</script>
<template>
    <div class="border rounded-lg px-4 pt-3">
        <p class="flex flex-col space-y-1 mb-3">
            <span class="font-semibold">Statut</span>

            <UBadge color="green" label="Actif" class="w-36" size="lg" />
        </p>

        <DetailsInfos title="Nom du client" :description="customer?.first_name + ' ' + customer?.last_name" />
        <DetailsInfos title="Responsable" :description="customer?.first_name + ' ' + customer?.last_name" />
    </div>
</template>