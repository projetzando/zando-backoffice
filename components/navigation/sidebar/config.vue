<script setup lang="ts">
const { activeMenu, activeChild, toggleMenu, setActiveChild } = useMenu()
</script>

<template>
  <div class="px-4 space-y-2">
    <h3 class="uppercase text-sm font-semibold my-4">
      Paramètres
    </h3>

    <NavigationSidebarButton
      v-role="['admin', 'superadmin']"
      label="Configuration"
      :is-active="activeMenu === Menu.Localisation || activeChild === Menu.Localisation"
      icon-left="heroicons:cog"
      @click="toggleMenu(Menu.Localisation)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.Localisation">
      <NavigationSidebarLink
        v-for="link in localisationLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
        @click="setActiveChild(Menu.Localisation)"
      />
    </NavigationSidebarDropdown>
  </div>
</template>

<style scoped></style>
