<script setup lang="ts">
definePageMeta({
    name: 'Liste des villes',
    layout: 'dashboard'
})

const cityStore = useCityStore();

cityStore.get()

const { cities } = storeToRefs(cityStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(cities);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des villes
                    </h5>

                    <ButtonCreate @new="() => navigateTo(`/dashboard/configurations/cities/create`)" />
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
                    :loading="cityStore.loading"
                    :columns="cityColumns"
                    :rows="rows"
                >
                    <template #created_at-data="{ row }">
                        {{ new Date(row.created_at).toLocaleDateString() }}
                    </template>

                    <template #actions-data="{ row }">
                        <div class="flex gap-2">
                            <UButton
                                @click="navigateTo(`/dashboard/configurations/cities/edit-${row.id}`)"
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
                                color="red"
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
                    title="villes"
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

        <CityDelete
            v-model:city="oneItem"
            v-model:status=isOpen
        />
    </div>
</template>
