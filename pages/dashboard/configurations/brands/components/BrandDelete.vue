<script setup lang="ts">
const brand = defineModel<Brand | undefined>('brand', { required: true, default: () => ([]) });

const isOpen = defineModel<boolean>('status', { required: true, default: false });

const brandStore = useBrandStore()

const { loading, deleteItem } = useDelete();

function deleteBrand(id: string) {
    deleteItem({
        action: () => brandStore.destroy(id),
        onSuccess: async () => {
            isOpen.value = false

            await brandStore.get()
        },
    });
}
</script>

<template>
    <DeleteModal v-model="isOpen">
        <template #title>
            <p>Êtes-vous sûr de vouloir supprimer la marque
                <span class="font-bold">{{ brand?.name }}</span>?
            </p>
        </template>

        <template #action>
            <ButtonDelete
                v-model="loading"
                @delete="deleteBrand(brand?.id)"
            />
        </template>
    </DeleteModal>
</template>