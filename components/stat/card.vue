<script lang="ts" setup>
const statStore = useStatStore()
const loading = ref(false)
const items = ref<StatItem[]>([])

async function init() {
  loading.value = true

  await statStore
    .infos()
    .then((data: any) => {
      items.value = data.data as StatItem[]
    })
    .catch((error: any) => {
      console.log(error)
    })
    .finally(() => {
      loading.value = false
    })
}

init()
</script>

<template>
  <div>
    <div class="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3 lg:gap-8">
      <a
        v-for="item in items"
        :key="item.libelle"
        href="javascript:void(0)"
        class="flex flex-col rounded-lg border border-slate-200 bg-white hover:border-slate-300 active:border-blue-300"
      >
        <div class="flex grow items-center justify-between p-5">
          <dl>
            <dt class="text-2xl font-bold">{{ item.nombre }}</dt>
            <dd class="text-sm font-medium text-slate-500">
              {{ item.libelle }}
            </dd>
          </dl>
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-dark-blue"
          >
            <Icon
              name="heroicons-information-circle"
              size="25"
            />
          </div>
        </div>
        <div class="border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-500">
          <p>Nombre des {{ item.libelle }}</p>
        </div>
      </a>
    </div>
  </div>
</template>

<style></style>
