<script setup lang='ts'>
defineProps<{
    customer: Customer
}>()

</script>
<template>
    <div class="border rounded-lg px-4 pt-3">
        <p class="flex flex-col space-y-1 mb-3">
            <span class="font-semibold">Commandes</span>
        </p>
    </div>
</template>