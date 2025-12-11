<script setup lang="ts">
defineProps<{
  seller: Seller
}>()
</script>

<template>
  <div class="border rounded-lg px-4 pt-3">
    <p class="flex flex-col space-y-1 mb-3">
      <span class="font-semibold">Statut</span>

      <UBadge
        color="green"
        label="Actif"
        class="w-36"
        size="lg"
      />
    </p>

    <DetailsInfos
      title="Nom du vendeur"
      :description="seller?.company_name"
    />
    <DetailsInfos
      title="Responsable"
      :description="seller?.company_name"
    />
  </div>
</template>
