<script setup lang='ts'>
const { activeMenu, activeChild, toggleMenu, setActiveChild } = useMenu();
</script>

<template>
    <div class="px-4 space-y-2">
        <h3 class="uppercase text-sm font-semibold  my-4">Paramètres</h3>

        <NavigationSidebarButton label="Configuration"
            :isActive="activeMenu === Menu.Localisation || activeChild === Menu.Localisation" iconLeft="heroicons:cog"
            @click="toggleMenu(Menu.Localisation)" />

        <NavigationSidebarDropdown :isActive="activeMenu === Menu.Localisation">
            <NavigationSidebarLink @click="setActiveChild(Menu.Localisation)" v-for="link in localisationLinks"
                :key="link.title" :title="link.title" :link="link.route_link" />
        </NavigationSidebarDropdown>


        <NavigationSidebarButton label="Admin" :isActive="activeMenu === Menu.Admin || activeChild === Menu.Admin"
            iconLeft="heroicons:users" @click="toggleMenu(Menu.Admin)" />

        <NavigationSidebarDropdown :isActive="activeMenu === Menu.Admin">
            <NavigationSidebarLink @click="setActiveChild(Menu.Admin)" v-for="link in adminLinks" :key="link.title"
                :title="link.title" :link="link.route_link" />
        </NavigationSidebarDropdown>
    </div>
</template>

<style scoped></style>
