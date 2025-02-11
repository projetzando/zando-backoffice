<script setup lang='ts'>
const emit = defineEmits(['trash']);

function handleClick() {
    emit('trash');
}
</script>

<template>
    <UButton
        @click="handleClick"
        icon="lets-icons:trash"
        size="sm"
        title="Supprimer"
        color="red"
        variant="outline"
    />
</template>

<style lang="css" scoped></style>