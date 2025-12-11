<script setup lang="ts">
const seller = defineModel<Seller | undefined>('seller', { required: true, default: () => [] })

const isOpen = defineModel<boolean>('status', { required: true, default: false })

const sellerStore = useSellerStore()

const { loading, deleteItem } = useDelete()

function deleteSeller(id: string) {
  deleteItem({
    action: () => sellerStore.destroy(id),
    onSuccess: async () => {
      isOpen.value = false

      await sellerStore.get()
    },
  })
}
</script>

<template>
  <DeleteModal v-model="isOpen">
    <template #title>
      <p>
        Êtes-vous sûr de vouloir supprimer le vendeur
        <span class="font-bold">{{ seller?.name }}</span>?
      </p>
    </template>

    <template #action>
      <ButtonDelete
        v-model="loading"
        @delete="deleteSeller(seller?.id)"
      />
    </template>
  </DeleteModal>
</template>
