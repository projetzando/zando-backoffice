<script setup lang="ts">
const { activeMenu, activeChild, toggleMenu, resetMenuState, setActiveChild } =
  useMenu();
</script>

<template>
  <div class="px-4 space-y-2">
    <h3 class="uppercase text-sm font-semibold my-4">Modules</h3>

    <NavigationSidebarButton
      label="Commandes"
      :isActive="activeMenu === Menu.Order || activeChild === Menu.Order"
      iconLeft="heroicons:shopping-cart"
      @click="toggleMenu(Menu.Order)"
    />

    <NavigationSidebarDropdown :isActive="activeMenu === Menu.Order">
      <NavigationSidebarLink
        @click="setActiveChild(Menu.Order)"
        v-for="link in orderLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :target="link.target"
        :permission="link.permission"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      label="Produits"
      :isActive="activeMenu === Menu.Product || activeChild === Menu.Product"
      iconLeft="iconoir:multiple-pages"
      @click="toggleMenu(Menu.Product)"
    />

    <NavigationSidebarDropdown :isActive="activeMenu === Menu.Product">
      <NavigationSidebarLink
        @click="setActiveChild(Menu.Product)"
        v-for="link in productLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
      />
    </NavigationSidebarDropdown>

    <NavigationSidebarButton
      label="Conversations"
      :isActive="
        activeMenu === Menu.Conversation || activeChild === Menu.Conversation
      "
      iconLeft="heroicons:chat-bubble-left-right"
      @click="toggleMenu(Menu.Conversation)"
    />

    <NavigationSidebarDropdown :isActive="activeMenu === Menu.Conversation">
      <NavigationSidebarLink
        @click="setActiveChild(Menu.Conversation)"
        v-for="link in conversationLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
      />
    </NavigationSidebarDropdown>

    <!-- <NavigationSidebarButton
            label="Paiements"
            :isActive="activeMenu === Menu.Payment || activeChild === Menu.Payment"
            iconLeft="heroicons:banknotes"
            @click="toggleMenu(Menu.Payment)"
        />

        <NavigationSidebarDropdown :isActive="activeMenu === Menu.Payment">
            <NavigationSidebarLink
                @click="setActiveChild(Menu.Payment)"
                v-for="link in paymentLinks"
                :key="link.title"
                :title="link.title"
                :link="link.route_link"
            />
        </NavigationSidebarDropdown> -->

    <NavigationSidebarButton
      label="Comptes"
      :isActive="activeMenu === Menu.User || activeChild === Menu.User"
      iconLeft="heroicons:users"
      @click="toggleMenu(Menu.User)"
    />

    <NavigationSidebarDropdown :isActive="activeMenu === Menu.User">
      <NavigationSidebarLink
        @click="setActiveChild(Menu.User)"
        v-for="link in userLinks"
        :key="link.title"
        :title="link.title"
        :link="link.route_link"
        :permission="link.permission"
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
