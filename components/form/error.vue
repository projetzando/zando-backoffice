<script setup lang="ts">
defineProps<{
  errors: string | string[]
  error: string
}>()
</script>

<template>
  <UAlert
    v-if="error"
    icon="i-heroicons-bell-alert"
    color="orange"
    :title="error"
    variant="subtle"
    class="mt-3 text-start"
  />

  <div
    v-if="typeof errors === 'string' && errors.length > 0"
    class="mt-2 text-start"
  >
    <UAlert
      title="Erreurs"
      icon="i-heroicons-bell-alert"
      color="orange"
      variant="subtle"
    >
      <template #description>
        <ul>
          <li class="text-sm">
            * {{ errors }}
          </li>
        </ul>
      </template>
    </UAlert>
  </div>

  <div
    v-if="typeof errors !== 'string' && errors.length > 0"
    class="mt-2 text-start"
  >
    <UAlert
      title="Erreurs"
      icon="i-heroicons-bell-alert"
      color="orange"
      variant="subtle"
    >
      <template #description>
        <ul>
          <li
            v-for="error in errors"
            :key="error"
            class="text-sm"
          >
            * {{ error }}
          </li>
        </ul>
      </template>
    </UAlert>
  </div>
</template>

<style lang="css" scoped></style>
