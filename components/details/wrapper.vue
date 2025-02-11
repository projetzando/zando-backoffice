<script setup lang='ts'>
defineProps<{
    loading: boolean
}>()
</script>

<template>
    <div
        v-if="!loading"
        class="border bg-white rounded-md flex-col w-full mt-2 shadow-sm p-2 flex items-center"
    >
        <div class="w-full flex items-center space-x-2">
            <div class="laptop:block hidden">
                <slot name="avatar" />
            </div>

            <div class="grid laptop:grid-cols-4 grid-cols-1 gap-2 w-full">
                <slot name="header" />
            </div>
        </div>

        <div class="space-y-4  my-2 w-full">
            <slot name="content" />
        </div>

        <slot name="other" />
    </div>

    <USkeleton
        v-else
        class="h-52 mt-5 w-full"
    />
</template>

<style lang="css" scoped></style>