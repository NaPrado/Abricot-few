<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: { label: string; value: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: 'Ocupación (%)',
      data: props.data.map((d) => d.value),
      borderColor: '#111827',
      backgroundColor: 'rgba(17, 24, 39, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: { min: 0, max: 100, ticks: { callback: (v: number | string) => `${v}%` } },
  },
}
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>
