<script setup lang="ts">
const appStore = useAppStore()
const toast = useToast()

const loading = ref(false)
const progress = ref(0)
const currentTask = ref('')

// Tâches d'initialisation
const tasks = [
  { name: 'catégories', store: useCategoryStore() },
  { name: 'enumérations', store: useEnumStore() },
]

async function initializeApp() {
  if (appStore.initData) return

  loading.value = true
  progress.value = 0

  try {
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      currentTask.value = `Chargement des ${task.name}`

      try {
        if (task.name === 'enumérations') {
          await task.store.fetchEnumTypes()
        }
        else {
          await task.store.get()
        }
      }
      catch (error: any) {
        // Continuer même en cas d'erreur (ex: permissions)
        if (error.response?.status !== 403) {
          console.warn(`Erreur lors du chargement des ${task.name}:`, error)
        }
      }

      progress.value = ((i + 1) / tasks.length) * 100
      await new Promise(resolve => setTimeout(resolve, 200)) // Petit délai visuel
    }

    appStore.initData = true
    toast.add({
      title: 'Application prête',
      description: 'Toutes les données ont été chargées',
      icon: 'i-heroicons-check-circle',
    })
  }
  catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
    toast.add({
      title: 'Erreur d\'initialisation',
      description: 'Certaines données n\'ont pas pu être chargées',
      color: 'red',
      icon: 'i-heroicons-exclamation-triangle',
    })
    appStore.initData = true // Permettre l'accès à l'app même en cas d'erreur
  }
  finally {
    loading.value = false
  }
}

onMounted(initializeApp)
</script>

<template>
  <div
    v-if="loading"
    class="flex w-full px-4 my-2 space-x-1 text-xs text-center text-black"
  >
    <div
      class="flex items-center justify-center w-full p-1 space-x-1 bg-white border dark:bg-gray-900 dark:text-white dark:border-gray-800 rounded-xl"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="animate-spin"
        size="16"
      />

      <span>Initialisation de l'application ({{ progress.toFixed(0) }}%)</span>

      <UProgress
        class="w-1/2"
        :value="progress"
      />

      <span>{{ currentTask }}</span>
    </div>
  </div>
</template>
