<script setup lang="ts">
definePageMeta({
    name: 'Liste des vendeurs',
    layout: 'dashboard'
})

const sellerStore = useSellerStore();

sellerStore.get()   

const { sellers } = storeToRefs(sellerStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(sellers);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des vendeurs
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
                    :loading="sellerStore.loading"
                    :columns="sellerColumns"
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
                                @click="navigateTo(`/dashboard/accounts/sellers/${row.id}`)"
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
                    title="vendeurs"
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