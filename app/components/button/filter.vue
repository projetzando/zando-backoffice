<script setup lang="ts">
const emit = defineEmits(['filter']);

function handleClick() {
    emit('filter');
}
</script>


<template>
    <UButton
        @click="handleClick"
        icon="hugeicons:filter"
        size="md"
        color="neutral"
        variant="solid"
        label="Filtres"
        :trailing="false"
    />
</template>
