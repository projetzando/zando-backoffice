<script setup lang="ts">
definePageMeta({
    name: 'Liste des marques',
    layout: 'dashboard'
})

const brandStore = useBrandStore();

brandStore.get()   

const { brands } = storeToRefs(brandStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(brands);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des marques
                    </h5>

                    <ButtonCreate @new="() => navigateTo(`/dashboard/configurations/brands/create`)" />
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
                    :loading="brandStore.loading"
                    :columns="brandColumns"
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
                                @click="navigateTo(`/dashboard/configurations/brands/edit-${row.id}`)"
                                icon="lets-icons:edit-fill"
                                size="sm"
                                title="Modifier"
                                color="primary"
                                variant="outline"
                            />

                            <UButton
                                @click="confirmDeleteItem(row)"
                                icon="lets-icons:trash"
                                size="sm"
                                title="Supprimer"
                                color="error"
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
                    title="marques"
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

        <BrandDelete
            v-model:brand="oneItem"
            v-model:status=isOpen
        />
    </div>
</template>