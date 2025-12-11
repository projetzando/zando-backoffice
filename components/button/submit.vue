<script setup lang="ts">
const loading = defineModel<boolean>({ required: true, default: () => false })
</script>

<template>
  <UButton
    type="submit"
    label="Soumettre"
    color="primary"
    :loading="loading"
  />
</template>
