<script setup lang="ts">
const props = defineProps({
  error: Object,
})

const handleError = () => clearError({ redirect: '/' })

const getErrorMessage = (statusCode: number) => {
  switch (statusCode) {
    case 404:
      return 'Désolé, la page que vous recherchez n\'existe pas.'
    case 500:
      return 'Erreur interne du serveur. Veuillez réessayer plus tard.'
    default:
      return 'Une erreur inattendue s\'est produite.'
  }
}

const errorMessage = computed(() => {
  return (
    getErrorMessage(props.error?.statusCode) ?? 'Désolé, la page que vous recherchez n\'existe pas'
  )
})
</script>

<template>
  <section class="bg-neutral-100">
    <div class="container flex items-center justify-center min-h-screen px-6 py-12 mx-auto">
      <div class="w-full">
        <div class="flex flex-col items-center max-w-lg mx-auto text-center">
          <p class="text-base font-medium text-blue-500">
            {{ `Erreur ${error?.statusCode}` }}
          </p>

          <img
            src="@/assets/images/error.svg"
            class="mx-auto w-96"
            alt="maintenance"
          >

          <h1 class="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl">
            {{ errorMessage }}
          </h1>

          <p class="mt-4 text-gray-500">
            Désolé nous n'avons pas pu trouver ce que vous recherchez.
          </p>

          <div class="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
            <button
              class="flex items-center justify-center w-1/2 px-5 py-2 text-sm text-gray-700 transition-colors duration-200 bg-white border rounded-lg gap-x-2 sm:w-auto hover:bg-gray-100"
              @click="() => useRouter().back()"
            >
              <UIcon
                name="heroicons:arrow-left-20-solid"
                size="20"
              />
              <span>Retour</span>
            </button>

            <button
              class="w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 bg-blue-500 rounded-lg shrink-0 sm:w-auto hover:bg-blue-600"
              @click="handleError"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
