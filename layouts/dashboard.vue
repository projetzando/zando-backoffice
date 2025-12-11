<script setup lang="ts">
const confirm = useTemplateRef('confirm')

provide('confirm', confirm)
</script>

<template>
  <div class="flex min-h-screen w-full relative">
    <Preloader />
    <NetworkStatus />

    <NavigationSidebar class="" />

    <ConfirmDialog ref="confirm" />

    <main class="bg-white w-full overflow-x-auto">
      <InitData />

      <NavigationHeader />

      <div class="p-4 my-5">
        <slot />
      </div>
    </main>
  </div>
</template>
