<script lang="ts" setup>
defineProps<{
    label: string;
    isActive: boolean;
    iconLeft: string;
}>();

const emit = defineEmits(['click']);

function handleClick() {
    emit('click');
}
</script>

<template>
    <button
        @click="handleClick"
        :class="[
            'flex justify-between items-center w-full p-2 rounded-xl',
            isActive ? 'bg-green-600 text-white' : 'text-gray-700 hover:text-green-600'
        ]"
    >
        <div class="flex items-center space-x-4">
            <UIcon
                size="20"
                :name="iconLeft"
            />
            <span>{{ label }}</span>
        </div>

        <UIcon :name="isActive ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" />
    </button>
</template>
