<script setup lang="ts">
</script>

<template>
    <div class="flex min-h-screen  w-full relative">
        <Preloader />

        <NetworkStatus />

        <NavigationSidebar />

        <main class=" bg-white w-full overflow-x-auto">
            <InitData />

            <NavigationHeader />

            <div class="p-4 my-5">
                <slot />
            </div>
        </main>
    </div>
</template>