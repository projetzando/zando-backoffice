<script setup lang="ts">
interface Props {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
  loading?: boolean
}

interface Emits {
  (e: 'update:currentPage', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})
const emit = defineEmits<Emits>()

// Générer les numéros de pages à afficher
const pageNumbers = computed(() => {
  const pages: (number | string)[] = []
  const maxVisible = 5
  const halfVisible = Math.floor(maxVisible / 2)

  if (props.totalPages <= maxVisible) {
    // Afficher toutes les pages si le total est petit
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  }
  else {
    // Calculer les pages à afficher
    let startPage = Math.max(1, props.currentPage - halfVisible)
    let endPage = Math.min(props.totalPages, props.currentPage + halfVisible)

    // Ajuster si on est proche du début ou de la fin
    if (props.currentPage <= halfVisible) {
      endPage = maxVisible
    }
    if (props.currentPage >= props.totalPages - halfVisible) {
      startPage = props.totalPages - maxVisible + 1
    }

    // Première page + ellipse si nécessaire
    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) {
        pages.push('...')
      }
    }

    // Pages du milieu
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    // Ellipse + dernière page si nécessaire
    if (endPage < props.totalPages) {
      if (endPage < props.totalPages - 1) {
        pages.push('...')
      }
      pages.push(props.totalPages)
    }
  }

  return pages
})

function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

function goToFirst() {
  goToPage(1)
}

function goToLast() {
  goToPage(props.totalPages)
}

function goToPrevious() {
  goToPage(props.currentPage - 1)
}

function goToNext() {
  goToPage(props.currentPage + 1)
}

const canGoPrevious = computed(() => props.currentPage > 1)
const canGoNext = computed(() => props.currentPage < props.totalPages)
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Indicateur de chargement -->
    <div
      v-if="loading"
      class="flex items-center gap-2 text-sm text-gray-600 mr-2"
    >
      <svg
        class="animate-spin h-4 w-4 text-primary-600"
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
      <span>Chargement...</span>
    </div>

    <!-- Bouton Première page -->
    <button
      :disabled="!canGoPrevious || loading"
      class="pagination-button"
      :class="{ 'pagination-button-disabled': !canGoPrevious || loading }"
      title="Première page"
      @click="goToFirst"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- Bouton Page précédente -->
    <button
      :disabled="!canGoPrevious || loading"
      class="pagination-button"
      :class="{ 'pagination-button-disabled': !canGoPrevious || loading }"
      title="Page précédente"
      @click="goToPrevious"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>

    <!-- Numéros de pages -->
    <div class="flex items-center gap-1">
      <template
        v-for="(page, index) in pageNumbers"
        :key="index"
      >
        <button
          v-if="page !== '...'"
          :disabled="loading"
          class="pagination-number"
          :class="{
            'pagination-number-active': page === currentPage,
            'pagination-number-inactive': page !== currentPage,
            'opacity-50 cursor-not-allowed': loading,
          }"
          @click="goToPage(page as number)"
        >
          {{ page }}
        </button>
        <span
          v-else
          class="px-2 text-gray-500"
        >...</span>
      </template>
    </div>

    <!-- Bouton Page suivante -->
    <button
      :disabled="!canGoNext || loading"
      class="pagination-button"
      :class="{ 'pagination-button-disabled': !canGoNext || loading }"
      title="Page suivante"
      @click="goToNext"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>

    <!-- Bouton Dernière page -->
    <button
      :disabled="!canGoNext || loading"
      class="pagination-button"
      :class="{ 'pagination-button-disabled': !canGoNext || loading }"
      title="Dernière page"
      @click="goToLast"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.pagination-button {
  @apply p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors;
}

.pagination-button-disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-white;
}

.pagination-number {
  @apply min-w-[2.5rem] h-10 px-3 rounded-lg border transition-colors font-medium;
}

.pagination-number-active {
  @apply bg-primary-600 text-white border-primary-600;
}

.pagination-number-inactive {
  @apply bg-white text-gray-700 border-gray-300 hover:bg-gray-50;
}
</style>
