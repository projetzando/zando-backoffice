<script setup lang='ts'>
defineProps<{
    errors: string | string[]
    error: string
}>()
</script>

<template>
    <UAlert
        icon="i-heroicons-bell-alert"
        color="orange"
        v-if="error"
        :title="error"
        variant="subtle"
        class="mt-3 text-start"
    />

    <div
        class="mt-2 text-start"
        v-if="typeof errors === 'string' && errors.length > 0"
    >
        <UAlert
            title="Erreurs"
            icon="i-heroicons-bell-alert"
            color="orange"
            variant="subtle"
        >
            <template #description>
                <ul>
                    <li class="text-sm">* {{ errors }}</li>
                </ul>
            </template>
        </UAlert>
    </div>

    <div
        class="mt-2 text-start"
        v-if="typeof errors !== 'string' && errors.length > 0"
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
                        class="text-sm"
                        v-for="error in errors"
                        :key="error"
                    >* {{ error }}</li>
                </ul>
            </template>
        </UAlert>
    </div>
</template>

<style lang="css" scoped></style>