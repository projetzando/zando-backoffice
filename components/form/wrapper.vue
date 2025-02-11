<script setup lang="ts">
defineProps<{
    title: string
    errors: string | string[]
    error: string
}>()
</script>

<template>
    <div class="mt-4 w-full">
        <div class="bg-white  rounded-lg border">

            <div class="flex justify-start border-b ">
                <h1 class=" font-semibold text-lg my-2 px-5">
                    {{ title }}
                </h1>
            </div>

            <div class="px-4">
                <FormError
                    :errors="errors"
                    :error="error"
                />

                <slot />
            </div>
        </div>
    </div>
</template>