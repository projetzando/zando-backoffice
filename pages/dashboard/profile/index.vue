<script setup lang="ts">
definePageMeta({
    layout: "dashboard",
    name: "mon profil",
});

const route = useRoute()


useHead({
    htmlAttrs: {
        lang: 'fr',
    },
    title: route.meta.name?.toUpperCase()
})

const auth = useAuthStore()

const items = [
    {
        slot: 'password',
        label: 'Nouveau mot de passe',
    },
    {
        slot: 'info',
        label: 'Mes infos personnelles',
    },
]
</script>

<template>
    <div>
        <div class="w-full shadow-sm border rounded-xl">
            <div class="bg-white flex flex-col items-center justify-center p-3">
                <UIcon
                    class="mx-2 w-16 h-14 object-cover rounded-lg hidden sm:block"
                    name="heroicons:user-circle"
                />

                <h1 class="text-gray-900 font-bold text-xl leading-8 my-1">{{ auth.user.name }}</h1>

                <h3 class="text-gray-600 font-lg  text-semibold leading-6">{{
                    auth.user.email }}</h3>
            </div>
        </div>

        <UTabs
            :items="items"
            class="w-full mt-2"
        >
            <template #password>
                <ProfilePassword />
            </template>

            <template #info>
                <ProfileInfos :user="auth.user" />
            </template>
        </UTabs>
    </div>
</template>