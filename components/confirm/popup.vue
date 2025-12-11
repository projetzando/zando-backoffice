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
  close,
})
</script>

<template>
  <UModal v-model="isVisible">
    <UCard>
      <template #header>
        <slot name="title" />
      </template>

      <template #default>
        <slot />
      </template>

      <template #footer>
        <slot name="action" />
      </template>
    </UCard>
  </UModal>
</template>
