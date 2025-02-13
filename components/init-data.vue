<script setup lang="ts">
const appStore = useAppStore()

const toast = useToast()

const timer = ref(0)

const counter = ref(0)

const current_load = ref('Début du chargement')

function update(value: string) {
    timer.value += 20

    counter.value++

    current_load.value = `Chargement des ${value}`
}

async function init() {
    if (!appStore.initData) {
        const stores = [
            { store: useCategoryStore(), label: 'Catégories' },
            { store: useBrandStore(), label: 'Marques' },
            { store: useCurrencyStore(), label: 'Devise' },
            { store: useSettingStore(), label: 'Paramètres' },
        ];

        for (const { store, label } of stores) {
            try {
                await store.get();

                update(label);
            } catch (error: any) {
                if (error.response?.status === 403) {
                    update(label);
                }
            }
        }

        try {
            await useEnumStore().fetchEnumTypes();

            update('Enumérations');
        } catch (error: any) {
            if (error.response?.status === 403) {
                update('Enumérations');
            }
        }
    }
}

onMounted(() => {
    init()
})

watch(timer, () => {
    if (timer.value > 100) {
        appStore.initData = true

        toast.add({ title: 'Chargement des données effectués avec succès', icon: "i-heroicons-check-circle" })

        timer.value = 0
    }
})
</script>

<template>
    <div
        v-if="timer < 100 && timer !== 0"
        class="flex w-full px-4 my-2 space-x-1 text-xs text-center text-black"
    >
        <div
            class="flex items-center justify-center w-full p-1 space-x-1 bg-white border dark:bg-gray-900 dark:text-white dark:border-gray-800 rounded-xl">
            <UIcon
                name="heroicons:cloud-arrow-down"
                size="20"
            />

            <span>Chargement des données ({{ timer.toFixed(2) }}%)</span>

            <UProgress
                class="w-1/2"
                :value="timer"
            />

            <span>({{ counter }}/17) - {{ current_load }}</span>
        </div>
    </div>
</template>