<script lang="ts" setup>
definePageMeta({
    layout: 'dashboard',
    name: "Détails d'un vendeur"
})

const route = useRoute()

const sellerStore = useSellerStore();

sellerStore.show(route.params.id)

function VIEW() {
    return navigateTo('/dashboard/accounts/sellers')
}

const items = [
    {
        slot: 'info',
        label: 'Details',
    },
    {
        slot: 'configuration',
        label: 'Configurations',
    },
    {
        slot: 'document',
        label: 'Documents',
    },
    {
        slot: 'payout',
        label: 'Retraits',
    },
]

const openAddress = ref(false)

const openUpdate = ref(false)

const openActivate = ref(false)
</script>
<template>
    <div>
        <ButtonList @return="VIEW" />

        <div v-if="!sellerStore.loading" class="space-x-2 bg-gray-100 p-2 rounded-lg flex justify-between my-3">

            <UButton @click="openUpdate = !openUpdate" color="blue" label="Mise à jour" />

            <UButton @click="openActivate = !openActivate" color="cyan" label="Activer" />
        </div>

        <ActivateSeller v-model:status="openActivate" v-model:seller="sellerStore.currentSeller" />

        <SellerUpdate v-model:status="openUpdate" v-model:seller="sellerStore.currentSeller" />

        <DetailsWrapper :loading="sellerStore.loading">
            <template #avatar>
                <UAvatar :alt="getName(sellerStore.currentSeller?.company_name)" size="xl" />
            </template>

            <template #header>
                <SellerHeader :seller="sellerStore.currentSeller" />
            </template>

            <template #content>
                <UTabs :items="items" class="w-full mt-2">
                    <template #info>
                        <SellerInfos :seller="sellerStore.currentSeller" />
                    </template>

                    <template #configuration>
                        <SellerConfiguration :seller="sellerStore.currentSeller" />
                    </template>

                    <template #document>
                        <SellerDocument :seller="sellerStore.currentSeller" />
                    </template>

                    <template #payout>
                        <SellerPayout :seller="sellerStore.currentSeller" />
                    </template>
                </UTabs>
            </template>
        </DetailsWrapper>
    </div>
</template>
<style></style>