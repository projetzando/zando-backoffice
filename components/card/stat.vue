<script setup lang="ts">
const appStore = useAppStore()

const getRandomColor = () => {
  const colors = [
    'bg-red-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-gray-500',
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<template>
  <div
    v-for="item in appStore.stats"
    v-if="!appStore.loading"
    class="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
  >
    <p class="xl:col-span-3 lg:col-span-2 col-span-1 bg-gray-50 p-2 border rounded-xl">
      {{ item.name }}
    </p>

    <article
      v-for="stat in item.data"
      :key="item.name"
      class="w-full p-4 bg-white border rounded-lg shadow-sm"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-500 dark:text-white">
            {{ stat.name }}
          </p>

          <p class="text-2xl font-medium text-gray-900 dark:text-gray-200">
            {{ stat.count }}
          </p>
        </div>

        <span
          :class="getRandomColor()"
          class="flex items-center justify-center p-3 text-white rounded-full"
        >
          <UIcon
            :name="stat.icon"
            size="28"
          />
        </span>
      </div>
    </article>
  </div>

  <div
    v-else
    class="rounded-lg grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3"
  >
    <USkeleton
      v-for="n in 6"
      class="h-24 w-full grid-cols-1"
      :ui="{ rounded: 'rounded-lg' }"
    />
  </div>
</template>
