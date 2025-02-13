<script setup lang="ts">
const setting = defineModel<Setting | undefined>('setting', { required: true, default: () => ([]) });

const isOpen = defineModel<boolean>('status', { required: true, default: false });

const settingStore = useSettingStore()

const { loading, deleteItem } = useDelete();

function deleteSetting(id: string) {
    deleteItem({
        action: () => settingStore.destroy(id),
        onSuccess: async () => {
            isOpen.value = false

            await settingStore.get()
        },
    });
}
</script>

<template>
    <DeleteModal v-model="isOpen">
        <template #title>
            <p>Êtes-vous sûr de vouloir supprimer la devise
                <span class="font-bold">{{ setting?.code }}</span>?
            </p>
        </template>

        <template #action>
            <ButtonDelete
                v-model="loading"
                @delete="deleteSetting(setting?.id)"
            />
        </template>
    </DeleteModal>
</template>