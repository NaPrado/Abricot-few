<script setup lang="ts">
import { usePlaceholderView } from './scripts/PlaceholderView'

const { RouterLink, t, title } = usePlaceholderView()
</script>

<template>
  <div class="placeholder-view">
    <RouterLink to="/explore" class="placeholder-back">{{ t('placeholder.back') }}</RouterLink>
    <h1 class="placeholder-title">{{ title }}</h1>
    <p class="placeholder-text">{{ t('placeholder.body') }}</p>
  </div>
</template>

<style src="./styles/PlaceholderView.css" scoped></style>
