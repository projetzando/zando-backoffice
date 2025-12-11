<script setup lang="ts">
const { activeMenu, activeChild, toggleMenu, resetMenuState, setActiveChild } = useMenu()
</script>

<template>
  <div class="px-4 space-y-2">
    <h3 class="uppercase text-sm font-semibold my-4">
      Modules
    </h3>

    <NavigationSidebarButton
      label="Commandes"
      :is-active="activeMenu === Menu.Order || activeChild === Menu.Order"
      icon-left="heroicons:shopping-cart"
      @click="toggleMenu(Menu.Order)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.Order">
      <NavigationSidebarLink
        v-for="link in orderLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :target="link.target"
        :permission="link.permission"
        @click="setActiveChild(Menu.Order)"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      label="Produits"
      :is-active="activeMenu === Menu.Product || activeChild === Menu.Product"
      icon-left="iconoir:multiple-pages"
      @click="toggleMenu(Menu.Product)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.Product">
      <NavigationSidebarLink
        v-for="link in productLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        @click="setActiveChild(Menu.Product)"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      label="Conversations"
      :is-active="activeMenu === Menu.Conversation || activeChild === Menu.Conversation"
      icon-left="heroicons:chat-bubble-left-right"
      @click="toggleMenu(Menu.Conversation)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.Conversation">
      <NavigationSidebarLink
        v-for="link in conversationLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
        @click="setActiveChild(Menu.Conversation)"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      v-role="['admin', 'superadmin']"
      label="Paiements"
      :is-active="activeMenu === Menu.Payment || activeChild === Menu.Payment"
      icon-left="heroicons:banknotes"
      @click="toggleMenu(Menu.Payment)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.Payment">
      <NavigationSidebarLink
        v-for="link in paymentLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
        @click="setActiveChild(Menu.Payment)"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      v-role="['admin', 'superadmin']"
      label="Comptes"
      :is-active="activeMenu === Menu.User || activeChild === Menu.User"
      icon-left="heroicons:users"
      @click="toggleMenu(Menu.User)"
    />

    <NavigationSidebarDropdown :is-active="activeMenu === Menu.User">
      <NavigationSidebarLink
        v-for="link in userLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
        @click="setActiveChild(Menu.User)"
      />
    </NavigationSidebarDropdown>

    <!-- <NavigationSidebarButton
            label="Edition"
            :isActive="activeMenu === Menu.Edition || activeChild === Menu.Edition"
            iconLeft="iconoir:multiple-pages"
            @click="toggleMenu(Menu.Edition)"
        />

        <NavigationSidebarDropdown :isActive="activeMenu === Menu.Edition">
            <NavigationSidebarLink
                @click="setActiveChild(Menu.Edition)"
                v-for="link in editionLinks"
                :key="link.title"
                :title="link.title"
                :link="link.route_link"
            />
        </NavigationSidebarDropdown> -->
  </div>
</template>

<style scoped></style>
