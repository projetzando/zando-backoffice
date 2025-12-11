<script setup lang="ts">
const series = [
  {
    data: [630, 850, 448, 470, 540, 580, 690, 1100, 1200, 1380, 1020, 1420],
  },
]

const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      borderRadiusApplication: 'end',
      horizontal: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  xaxis: {
    categories: [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ],
  },
})
</script>

<template>
  <div>
    <div class="bg-white rounded-lg border border-slate-200">
      <h1 class="p-4 text-xl font-bold">
        Tendance des ventes
      </h1>
      <apexchart
        ref="chart"
        type="line"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<style lang="css" scoped></style>
