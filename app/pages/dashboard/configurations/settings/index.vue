<script setup lang="ts">
definePageMeta({
    name: 'Paramètres généraux',
    layout: 'dashboard'
})

const settingStore = useSettingStore();

settingStore.get()   

const { settings } = storeToRefs(settingStore);

const {
    q,
    page,
    pageCount,
    oneItem,
    isOpen,
    rows,
    totalFilteredRows,
    confirmDeleteItem,
} = useTable(settings);
</script>

<template>
    <div>
        <TableWrapper>
            <template #header>
                <div class="table-header">
                    <h5 class="table-title">
                        Liste des paramètres
                    </h5>

                    <ButtonCreate @new="() => navigateTo(`/dashboard/configurations/settings/create`)" />
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
                    :loading="settingStore.loading"
                    :columns="settingColumns"
                    :rows="rows"
                >

                    <template #created_at-data="{ row }">
                        {{ new Date(row.created_at).toLocaleDateString() }}
                    </template>

                    <template #actions-data="{ row }">
                        <div class="flex gap-2">
                            <UButton
                                @click="navigateTo(`/dashboard/configurations/settings/edit-${row.id}`)"
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
                    title="paramètres"
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

        <SettingDelete
            v-model:setting="oneItem"
            v-model:status=isOpen
        />
    </div>
</template>