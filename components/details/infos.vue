<script setup lang="ts">
defineProps<{
  title: string
  description: string | undefined | number | Date
}>()
</script>

<template>
  <p class="flex flex-col space-y-1 mb-3">
    <span class="font-semibold">{{ title }}</span>

    <span>{{ description }}</span>
  </p>
</template>

<style lang="css" scoped></style>
