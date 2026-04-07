<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: { label: string; value: number }[]
}>()

const chartData = computed(() => ({
  labels: props.data.map((d) => d.label),
  datasets: [
    {
      label: 'Ocupación (%)',
      data: props.data.map((d) => d.value),
      backgroundColor: '#111827',
      borderRadius: 6,
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
  <Bar :data="chartData" :options="chartOptions" />
</template>
