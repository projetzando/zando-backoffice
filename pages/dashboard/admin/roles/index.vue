<script lang="ts" setup>
definePageMeta({
    name: "Liste des rôles",
    layout: 'dashboard'
})

const enumStore = useEnumStore();

const roles = computed(() => enumStore.getEnumValues('user_role'))
</script>
<template>
  <div>
    <h1>Rôles</h1>
    <p>{{ roles }}</p>
  </div>
</template>
<style scoped>

</style>