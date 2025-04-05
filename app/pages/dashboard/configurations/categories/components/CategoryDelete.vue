<script setup lang="ts">
const category = defineModel<Category | undefined>('category', { required: true, default: () => ([]) });

const isOpen = defineModel<boolean>('status', { required: true, default: false });

const categoryStore = useCategoryStore()

const { loading, deleteItem } = useDelete();

function deleteCategory(id: string) {
    deleteItem({
        action: () => categoryStore.destroy(id),
        onSuccess: async () => {
            isOpen.value = false

            await categoryStore.get()
        },
    });
}
</script>

<template>
    <DeleteModal v-model="isOpen">
        <template #title>
            <p>Êtes-vous sûr de vouloir supprimer la categorie
                <span class="font-bold">{{ category?.name }}</span>?
            </p>
        </template>

        <template #action>
            <ButtonDelete
                v-model="loading"
                @delete="deleteCategory(category?.id)"
            />
        </template>
    </DeleteModal>
</template>