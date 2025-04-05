<script setup lang="ts">
defineProps<{
    page: number;
    pageCount: number;
    length?: number;
    title: string
}>();
</script>

<template>
    <div>
        <span class="text-gray-600 dark:text-white">
            Montre
            {{ length === 0
                ? "0"
                : (page - 1) * pageCount + 1 }}
            de
            {{ Math.min(page * pageCount, Number(length)) }}
            sur
            {{ length }}
            {{ title }}
        </span>
    </div>
</template>