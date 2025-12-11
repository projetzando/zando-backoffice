<script setup lang="ts">
const emit = defineEmits(['return'])

function handleClick() {
  emit('return')
}
</script>

<template>
  <UButton
    icon="i-heroicons-arrow-left"
    size="sm"
    :trailing="false"
    color="primary"
    variant="outline"
    label="Liste"
    @click="handleClick"
  />
</template>
