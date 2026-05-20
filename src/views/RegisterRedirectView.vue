<script setup lang="ts">
import { useRegisterRedirectView } from './scripts/RegisterRedirectView'

const { message } = useRegisterRedirectView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo">Abricot</span>
      <p class="auth-subtitle">{{ message }}</p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
