<script setup lang="ts">
defineProps<{
  isActive: boolean
}>()
</script>

<template>
  <transition
    name="fade-slide"
    mode="out-in"
  >
    <ul
      v-if="isActive"
      class="ml-6 text-sm"
    >
      <slot />
    </ul>
  </transition>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
