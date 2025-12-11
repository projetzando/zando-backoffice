<script setup lang="ts">
const { activeMenu, activeChild, toggleMenu, setActiveChild } = useMenu();
</script>

<template>
  <div class="px-4 space-y-2">
    <h3 class="uppercase text-sm font-semibold my-4">Paramètres</h3>

    <NavigationSidebarButton
      label="Configuration"
      :isActive="
        activeMenu === Menu.Localisation || activeChild === Menu.Localisation
      "
      iconLeft="heroicons:cog"
      @click="toggleMenu(Menu.Localisation)"
      v-role="['admin', 'superadmin']"
    />

    <NavigationSidebarDropdown :isActive="activeMenu === Menu.Localisation">
      <NavigationSidebarLink
        @click="setActiveChild(Menu.Localisation)"
        v-for="link in localisationLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
      />
    </NavigationSidebarDropdown>
  </div>
</template>

<style scoped></style>
