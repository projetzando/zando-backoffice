<script setup lang="ts">
defineProps<{
  title: string
  link: string
  target?: string
  permission?: string
}>()
</script>

<template>
  <div v-permission="permission">
    <NuxtLink
      :to="`${link}`"
      :target="target"
      active-class="text-gray-700 font-bold"
      class="flex text-black rounded-md w-full p-2 items-center space-x-5 text-sm"
    >
      <UIcon
        size="10"
        name="ion:ellipse-outline"
      />

      <span>{{ title }}</span>
    </NuxtLink>
  </div>
</template>
