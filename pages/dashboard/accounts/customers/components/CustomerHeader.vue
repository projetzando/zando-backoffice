<script setup lang="ts">
defineProps<{
  customer: Customer
}>()
</script>

<template>
  <Card
    title="Nom complet"
    icon="bx:user"
  >
    <p>{{ customer?.first_name + ' ' + customer?.last_name }}</p>
  </Card>

  <Card
    title="Téléphone"
    icon="heroicons:phone"
  >
    <p>{{ customer?.phone }}</p>
  </Card>

  <Card
    title="Statut"
    icon="material-symbols:type-specimen"
  >
    <p>{{ customer?.status }}</p>
  </Card>

  <Card
    title="Langue"
    icon="hugeicons:job-link"
  >
    <p>{{ customer?.language }}</p>
  </Card>
</template>

<style lang="css" scoped></style>
