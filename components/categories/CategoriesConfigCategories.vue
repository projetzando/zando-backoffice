<script setup lang="ts">
const categoryStore = useCategoryStore();

categoryStore.get()

const { categories } = storeToRefs(categoryStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(categories);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des catégories
                    </h5>

                    <ButtonCreate @new="() => navigateTo(`/dashboard/configurations/categories/create`)" />
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
                    :loading="categoryStore.loading"
                    :columns="categoryColumns"
                    :rows="rows"
                >

                    <template #image-data="{ row }">
                        <UAvatar
                            v-if="row.image"
                            :src="row.image"
                            :alt="row.name"
                            size="sm"
                        />
                        <span v-else class="text-gray-400">Aucune image</span>
                    </template>

                    <template #is_active-data="{ row }">
                        <UBadge :color="row.is_active ? 'green' : 'red'" variant="subtle">
                            {{ row.is_active ? 'Active' : 'Inactive' }}
                        </UBadge>
                    </template>

                    <template #created_at-data="{ row }">
                        {{ new Date(row.created_at).toLocaleDateString() }}
                    </template>

                    <template #actions-data="{ row }">
                        <div class="flex gap-2">
                            <UButton
                                @click="navigateTo(`/dashboard/configurations/categories/edit-${row.id}`)"
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
                    title="catégories"
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

        <CategoriesCategoryDelete
            v-model:category="oneItem"
            v-model:status=isOpen
        />
    </div>
</template>
