<script setup lang="ts">
const emit = defineEmits(['edit'])

function handleClick() {
  emit('edit')
}
</script>

<template>
  <UButton
    icon="lets-icons:edit-fill"
    size="sm"
    title="Modifier"
    color="green"
    variant="outline"
    @click="handleClick"
  />
</template>

<style lang="css" scoped></style>
