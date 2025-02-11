<script setup lang="ts">
defineProps<{
    icon: string;
    title: string;
    link: string;
}>();
</script>

<template>
    <div>
        <NuxtLink
            :to="`${link}`"
            active-class="text-white bg-green-600 "
            class="flex  tracking-wide text-gray-700 p-2 rounded-xl w-full  items-center gap-3"
        >
            <UIcon
                size="20"
                :name="icon"
            />

            {{ title }}
        </NuxtLink>
    </div>
</template>
