<script setup lang="ts">
const city = defineModel<City | undefined>('city', { required: true, default: () => [] })

const isOpen = defineModel<boolean>('status', { required: true, default: false })

const cityStore = useCityStore()

const { loading, deleteItem } = useDelete()

function deleteCity(id: string) {
  deleteItem({
    action: () => cityStore.destroy(id),
    onSuccess: async () => {
      isOpen.value = false

      await cityStore.get()
    },
  })
}
</script>

<template>
  <DeleteModal v-model="isOpen">
    <template #title>
      <p>
        Êtes-vous sûr de vouloir supprimer la ville <span class="font-bold">{{ city?.name }}</span>?
      </p>
    </template>

    <template #action>
      <ButtonDelete
        v-model="loading"
        @delete="deleteCity(city?.id)"
      />
    </template>
  </DeleteModal>
</template>
