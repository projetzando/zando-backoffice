<script setup lang="ts">
const { logout } = useLogout()

// const user = useSupabaseUser()

const authStore = useAuthStore()

authStore.connectedUser()

const { resetMenuState } = useMenu()

const profile = () => {
  resetMenuState()

  navigateTo('/dashboard/profile')
}

const userName = computed(() => authStore.connected_user?.name || authStore.connected_user?.email)

const items = [
  [
    {
      label: 'Salut',
      slot: 'account',
      disabled: true,
    },
  ],
  [
    {
      label: `Mon profil`,
      icon: 'i-heroicons-user',
      click: () => profile(),
    },
  ],
  [
    {
      label: 'Déconnexion',
      icon: 'i-heroicons-arrow-left-on-rectangle',
      click: () => {
        logout()
      },
    },
  ],
]
</script>

<template>
  <UDropdown
    :items="items"
    :ui="{ item: { disabled: 'cursor-text select-text' } }"
    :popper="{ placement: 'bottom-start' }"
  >
    <UIcon
      class="text-light-blue"
      size="25"
      name="i-heroicons-user"
    />

    <template #account="{ item }">
      <div class="text-left">
        <p class="truncate font-medium">
          {{ userName }}
        </p>
      </div>
    </template>

    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>

      <UIcon
        :name="item.icon"
        class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
      />
    </template>
  </UDropdown>
</template>

<style lang="css" scoped></style>
