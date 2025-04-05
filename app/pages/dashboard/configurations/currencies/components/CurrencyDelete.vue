<script setup lang="ts">
const currency = defineModel<Currency | undefined>('currency', { required: true, default: () => ([]) });

const isOpen = defineModel<boolean>('status', { required: true, default: false });

const currencyStore = useCurrencyStore()

const { loading, deleteItem } = useDelete();

function deleteCurrency(id: string) {
    deleteItem({
        action: () => currencyStore.destroy(id),
        onSuccess: async () => {
            isOpen.value = false

            await currencyStore.get()
        },
    });
}
</script>

<template>
    <DeleteModal v-model="isOpen">
        <template #title>
            <p>Êtes-vous sûr de vouloir supprimer la devise
                <span class="font-bold">{{ currency?.code }}</span>?
            </p>
        </template>

        <template #action>
            <ButtonDelete
                v-model="loading"
                @delete="deleteCurrency(currency?.id)"
            />
        </template>
    </DeleteModal>
</template>