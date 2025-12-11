<script setup lang="ts">
const route = useRoute()

const appStore = useAppStore()

const confirm = useConfirm()

const isOpen = ref<boolean>(false)

async function reloadDatabase() {
  confirm?.value
    .show({
      title: 'Rechargement des données',
      message: 'Voulez vraiment vous rechargez les données ?',
      okButton: 'Confirmer',
    })
    .then((result: boolean) => {
      appStore.initData = false

      window.location.reload()
    })
    .catch(() => {
      console.log('Annuler')
    })
}
</script>

<template>
  <nav class="flex items-center justify-between border-b top-0 p-6">
    <h1 class="text-lg flex items-center font-semibold text-black laptop-m:space-x-0 space-x-2">
      <UIcon
        class="laptop-m:hidden block"
        size="25"
        name="heroicons:bars-3"
        @click="isOpen = !isOpen"
      />

      <span class="tablet:text-base text-sm">{{
        route.meta.name?.toUpperCase() ?? 'NKUNA MarketPlace'
      }}</span>
    </h1>

    <div class="flex items-center gap-x-5">
      <UIcon
        class="cursor-pointer"
        size="25"
        name="i-heroicons-arrow-path"
        @click="reloadDatabase"
      />

      <NavigationSidebarMobile v-model="isOpen" />

      <NavigationHeaderUser />
    </div>
  </nav>
</template>
