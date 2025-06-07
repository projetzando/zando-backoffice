<script setup lang='ts'>
const { resetMenuState } = useMenu();
</script>

<template>
    <aside class="w-80 h-screen bg-white hidden flex-col border-r border-r-gray-200 sticky top-0 lg:flex">
        <div class="py-4 px-4 sticky top-0 bg-white z-10 flex">
            <img
                src="~/assets/images/logo.png"
                alt="Logo"
                width="150"
            >
        </div>

        <nav class="flex flex-col space-y-4 overflow-x-auto">
            <div class="py-2 px-4">
                <h3 class="uppercase text-sm font-semibold my-4">Accueil</h3>

                <NavigationLink
                    title="Tableau de bord"
                    link="/dashboard"
                    icon="heroicons:home"
                    @click="resetMenuState"
                />
            </div>

            <NavigationSidebarModule />

            <NavigationSidebarConfig />
        </nav>
    </aside>
</template>
