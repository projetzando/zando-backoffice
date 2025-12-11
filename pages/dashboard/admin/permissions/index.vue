<script lang="ts" setup>
definePageMeta({
  name: 'Liste des permissions',
  layout: 'dashboard',
  requireRole: 'superadmin', // Réservé au superadmin uniquement
})
</script>

<template>
  <div>
    <h1>Permissions</h1>
  </div>
</template>

<style scoped></style>
