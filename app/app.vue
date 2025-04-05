<script setup lang="ts">
const route = useRoute()

watch(() => route.meta.name, (newName) => {
  useHead({
    htmlAttrs: {
      lang: 'fr',
    },
    title: newName?.toLocaleLowerCase().replace(/^./, char => char.toUpperCase()) || 'Zando',
  })
}, { immediate: true })

</script>

<template>
  <UApp :toaster="{position : 'top-right'}">
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
      <UNotifications />
    </NuxtLayout>
  </UApp>
</template>

<style>
.page-enter-active {
  transition: all 0.2s ease-out;
}

.page-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.page-enter-from,
.page-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.layout-enter-active {
  transition: all 0.2s ease-out;
}

.layout-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.layout-enter-from,
.layout-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>