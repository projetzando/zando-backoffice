<script setup lang="ts">
const emit = defineEmits(['details'])

function handleClick() {
  emit('details')
}
</script>

<template>
  <UButton
    icon="lets-icons:eye"
    size="sm"
    title="Details"
    color="primary"
    variant="outline"
    @click="handleClick"
  />
</template>

<style lang="css" scoped></style>
