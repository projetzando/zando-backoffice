<script setup lang="ts">
interface Props {
  show: boolean
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  message: 'Chargement en cours...',
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="show"
      class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <!-- Spinner -->
      <svg
        class="animate-spin h-5 w-5 text-primary-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      <!-- Message -->
      <span class="text-sm font-medium text-gray-700">
        {{ message }}
      </span>
    </div>
  </Transition>
</template>
