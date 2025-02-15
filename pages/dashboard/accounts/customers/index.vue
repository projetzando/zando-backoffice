<script setup lang="ts">
definePageMeta({
    name: 'Liste des acheteurs',
    layout: 'dashboard'
})

const customerStore = useCustomerStore();

customerStore.get()   

const { customers } = storeToRefs(customerStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(customers);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des acheteurs
                    </h5>

                    <!-- <ButtonCreate @new="() => navigateTo(`/dashboard/accounts/sellers/create`)" /> -->
                </div>

                <div class="flex justify-between py-3 border-y ">
                    <TableElementByPage
                        class="pl-3"
                        v-model="pageCount"
                    />

                    <UInput
                        required
                        class="pr-3"
                        v-model="q"
                        placeholder="Effectuer une recherche..."
                    />
                </div>
            </template>

            <template #content>
                <UTable
                    :loading="customerStore.loading"
                    :columns="customerColumns"
                    :rows="rows"
                >

                    <template #image-data="{ row }">
                        <UAvatar :src=row.image />
                    </template>

                    <template #created_at-data="{ row }">
                        {{ new Date(row.created_at).toLocaleDateString() }}
                    </template>

                    <template #actions-data="{ row }">
                        <div class="flex gap-2">
                            <UButton
                                @click="navigateTo(`/dashboard/accounts/customers/${row.id}`)"
                                icon="lets-icons:eye"
                                size="sm"
                                label="Voir"
                                title="Modifier"
                                color="primary"
                                variant="outline"
                            />
                        </div>
                    </template>
                </UTable>
            </template>

            <template #footer>
                <TablePaginationInfo
                    :page="page"
                    :page-count="pageCount"
                    :length="totalFilteredRows"
                    title="acheteurs"
                />

                <UPagination
                    v-if="totalFilteredRows > 0"
                    v-model="page"
                    show-first
                    show-last
                    :page-count="pageCount"
                    :total="totalFilteredRows"
                />
            </template>
        </TableWrapper>
    </div>
</template>