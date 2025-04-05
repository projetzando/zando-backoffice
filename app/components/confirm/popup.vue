<script setup lang="ts">
const isVisible = ref(false)

const open = () => {
    isVisible.value = true
}

const close = () => {
    isVisible.value = false
}

defineExpose({
    open,
    close
})
</script>

<template>
    <UModal v-model="isVisible">
        <UCard>
            <template #header>
                <slot name="title"></slot>
            </template>

            <template #default>
                <slot></slot>
            </template>

            <template #footer>
                <slot name="action"></slot>
            </template>
        </UCard>
    </UModal>
</template>