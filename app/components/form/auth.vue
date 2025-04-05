<script setup lang="ts">
defineProps<{
    errors: string | string[]
    error: string
    title: string
}>()
</script>

<template>
    <div class="flex flex-col justify-center items-center min-h-screen bg-brown">
        <div
            class="relative  break-words bg-white shadow rounded-2xl bg-clip-border w-full max-w-md p-6 m-auto mx-auto border">

            <div class="flex justify-center mx-auto ">
                <NuxtLink to="/">
                    <img
                        src="~/assets/images/logo.png"
                        alt="Logo"
                        width="150"
                    />
                </NuxtLink>
            </div>

            <p class="my-5 text-xl uppercase font-semibold ">
                {{ title }}
            </p>

            <UAlert
                icon="i-heroicons-exclamation-triangle"
                color="error"
                v-show="error"
                :title="error"
                class="mt-3"
            />

            <UAlert
                v-for="(error, i) in errors"
                :key="i"
                icon="i-heroicons-exclamation-triangle"
                color="error"
                v-show="errors"
                :title="error"
                class="mt-3"
            />

            <slot />

            <div class="text-center mt-4">
                <small class="font-semibold text-xs uppercase">&copy; SKYNOV TECH {{ new Date().getFullYear() }} -
                    Tous
                    droits réservés</small>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped></style>