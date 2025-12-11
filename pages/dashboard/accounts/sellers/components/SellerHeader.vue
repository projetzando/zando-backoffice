<script setup lang="ts">
defineProps<{
  seller: Seller
}>()
</script>

<template>
  <Card
    title="Nom"
    icon="bx:user"
  >
    <p>{{ seller?.company_name }}</p>
  </Card>

  <Card
    title="Statut juridique"
    icon="heroicons:phone"
  >
    <p>{{ seller?.legal_status }}</p>
  </Card>

  <Card
    title="Siret"
    icon="material-symbols:type-specimen"
  >
    <p>{{ seller?.siret }}</p>
  </Card>

  <Card
    title="Numéro TVA"
    icon="hugeicons:job-link"
  >
    <p>{{ seller?.vat_number }}</p>
  </Card>
</template>

<style lang="css" scoped></style>
