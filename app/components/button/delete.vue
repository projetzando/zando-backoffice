<script setup lang="ts">
const loading = defineModel<boolean>({ required: true, default: () => false })

const emit = defineEmits(['delete']);

function handleClick() {
    emit('delete');
}
</script>


<template>
    <UButton
        size="lg"
        label="Supprimer"
        color="primary"
        :loading="loading"
        @click="handleClick"
    />
</template>
