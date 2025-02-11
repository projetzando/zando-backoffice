<script setup lang='ts'>
const emit = defineEmits(['details']);

function handleClick() {
    emit('details');
}
</script>

<template>
    <UButton
        @click="handleClick"
        icon="lets-icons:eye"
        size="sm"
        title="Details"
        color="primary"
        variant="outline"
    />
</template>

<style lang="css" scoped></style>