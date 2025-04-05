<script lang="ts" setup>
definePageMeta({
    layout: 'dashboard',
    name: "Détails d'un acheteur"
})

const route = useRoute()

const customerStore = useCustomerStore();

customerStore.show(route.params.id)

function VIEW() {
    return navigateTo('/dashboard/accounts/customers')
}

const items = [
    {
        slot: 'info',
        label: 'Details',
    },
    {
        slot: 'order',
        label: 'Commandes',
    }
]

const openAddress = ref(false)

const openUpdate = ref(false)

const openActivate = ref(false)
</script>
<template>
    <div>
        <ButtonList @return="VIEW" />

        <div v-if="!customerStore.loading" class="space-x-2 bg-gray-100 p-2 rounded-lg flex justify-between my-3">

            <UButton @click="openUpdate = !openUpdate" color="blue" label="Mise à jour" />

            <UButton @click="openActivate = !openActivate" color="cyan" label="Activer" />
        </div>

        <ActivateCustomer v-model:status="openActivate" v-model:customer="customerStore.currentCustomer" />

        <CustomerUpdate v-model:status="openUpdate" v-model:customer="customerStore.currentCustomer" />

        <DetailsWrapper :loading="customerStore.loading">
            <template #avatar>
                <UAvatar :alt="getName(customerStore.currentCustomer?.first_name + ' ' + customerStore.currentCustomer?.last_name)" size="xl" />
            </template>

            <template #header>
                <CustomerHeader :customer="customerStore.currentCustomer" />
            </template>

            <template #content>
                <UTabs :items="items" class="w-full mt-2">
                    <template #info>
                        <CustomerInfos :customer="customerStore.currentCustomer" />
                    </template>

                    <template #order>
                        <CustomerOrder :customer="customerStore.currentCustomer" />
                    </template>
                </UTabs>
            </template>
        </DetailsWrapper>
    </div>
</template>
<style></style>