<script setup lang="ts">
definePageMeta({
  name: 'Liste des villes',
  layout: 'dashboard',
  roles: ['admin', 'superadmin'], // Configuration réservée aux admins
})

const cityStore = useCityStore()

cityStore.get()

const { cities } = storeToRefs(cityStore)

const { q, page, pageCount, oneItem, isOpen, rows, totalFilteredRows, confirmDeleteItem }
  = useTable(cities)
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

        <div class="flex justify-between py-3 border-y">
          <TableElementByPage
            v-model="pageCount"
            class="pl-3"
          />

          <UInput
            v-model="q"
            required
            class="pr-3"
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
                icon="lets-icons:edit-fill"
                size="sm"
                title="Modifier"
                color="primary"
                variant="outline"
                @click="navigateTo(`/dashboard/configurations/cities/edit-${row.id}`)"
              />

              <UButton
                icon="lets-icons:trash"
                size="sm"
                title="Supprimer"
                color="red"
                variant="outline"
                @click="confirmDeleteItem(row)"
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
      v-model:status="isOpen"
    />
  </div>
</template>
