<script setup lang='ts'>
defineProps<{
    title: string,
    icon: string
}>()
</script>

<template>
    <div class="flex shadow-sm border justify-between  text-sm items-center gap-1 bg-gray-50 text-black p-2 rounded-lg">
        <div>
            <p class="font-bold text-base capitalize">{{ title }}</p>

            <slot />
        </div>

        <UAvatar
            :ui="{ background: 'bg-green-500', icon: { base: 'text-white' } }"
            :icon="icon"
            size="md"
        />
    </div>
</template>

<style lang="css" scoped></style>