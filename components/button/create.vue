<script setup lang="ts">
const emit = defineEmits(['new']);

function handleClick() {
    emit('new');
}
</script>


<template>
    <UButton
        @click="handleClick"
        icon="i-heroicons-plus"
        size="md"
        color="primary"
        variant="outline"
        :trailing="false"
    />
</template>
