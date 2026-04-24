<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(() => void router.replace('/me/orders'))
</script>

<template>
  <div />
</template>
