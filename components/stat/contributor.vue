<script lang="ts" setup>
const loading = ref(false)

// const items = ref<StatItem[]>([])
const series = ref<(number | undefined)[]>([])
const options = ref({})

async function init() {
  loading.value = true

  setTimeout(() => {
    const libelleArray = ['Non statisfaits', 'Statisfaits']
    const nombreArray = [65, 2000]
    series.value = nombreArray

    options.value = {
      chart: {
        type: 'donut',
        height: 350,
      },
      dataLabels: {
        enabled: true,
      },
      labels: libelleArray,
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
            },
          },
        },
      },
    }

    loading.value = false
  }, 500)

  // await statStore.type().then((data: any) => {
  //     items.value = data.data as StatItem[]

  //     const libelleArray = items.value.map(item => item.libelle);
  //     const nombreArray = items.value.map(item => item.nombre);

  //     series.value = nombreArray;

  //     options.value = {
  //         chart: {
  //             type: 'donut',
  //             height: 350
  //         },
  //         dataLabels: {
  //             enabled: true
  //         },
  //         labels: libelleArray,
  //         plotOptions: {
  //             pie: {
  //                 donut: {
  //                     labels: {
  //                         show: true
  //                     }
  //                 }
  //             }
  //         }
  //     }
  // }).finally(() => {
  //     loading.value = false
  // })
}

init()
</script>

<template>
  <div>
    <div class="bg-white rounded-lg border border-slate-200">
      <h1 class="p-4 text-xl font-bold">
        Taux de statisfaction
      </h1>
      <apexchart
        type="donut"
        height="350"
        :options="options"
        :series="series"
        class="p-4"
      />
    </div>
  </div>
</template>

<style></style>
