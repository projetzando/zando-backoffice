<script setup lang="ts">
const isOpen = defineModel<boolean>({ required: true, default: () => false })
</script>

<template>
    <UModal
        v-model="isOpen"
        prevent-close
    >
        <UCard>
            <template #header>
                <div class="flex items-center justify-between">
                    <h1> Suppression</h1>

                    <UButton
                        @click="isOpen = false"
                        icon="i-heroicons-x-circle"
                        size="lg"
                        color="primary"
                        variant="ghost"
                        :trailing="false"
                    />
                </div>
            </template>

            <template #default>
                <div class="flex gap-x-2 items-center">
                    <Icon
                        name="heroicons:exclamation-circle"
                        size="25"
                    />

                    <slot name="title" />
                </div>
            </template>

            <template #footer>
                <div class="flex justify-end space-x-2">
                    <UButton
                        size="lg"
                        color="neutral"
                        label="Annuler"
                        @click="isOpen = !isOpen"
                    />

                    <slot name="action" />
                </div>
            </template>
        </UCard>
    </UModal>
</template>