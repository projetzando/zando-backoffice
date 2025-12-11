<script setup lang="ts">
const emit = defineEmits(['filter'])

function handleClick() {
  emit('filter')
}
</script>

<template>
  <UButton
    icon="hugeicons:filter"
    size="md"
    color="white"
    variant="solid"
    label="Filtres"
    :trailing="false"
    @click="handleClick"
  />
</template>
