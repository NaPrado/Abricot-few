<script setup lang="ts">
import { useAuthCallbackView } from './scripts/AuthCallbackView'

const { status, detail, loading, claims, runAuthTest, goToLogin } = useAuthCallbackView()
</script>

<template>
  <div class="auth-callback-view">
    <section class="auth-callback-panel">
      <span class="auth-callback-logo">Abricot</span>
      <h1 class="auth-callback-title">Callback de autenticacion</h1>
      <p class="auth-callback-detail">{{ detail }}</p>

      <button
        class="auth-callback-action"
        type="button"
        :disabled="status !== 'ready' || loading"
        @click="runAuthTest"
      >
        {{ loading ? 'Probando...' : 'Probar /auth-test' }}
      </button>

      <pre v-if="claims" class="auth-callback-claims">{{ claims }}</pre>

      <button class="auth-callback-link" type="button" @click="goToLogin">
        Volver al login
      </button>
    </section>
  </div>
</template>

<style src="./styles/AuthCallbackView.css" scoped></style>
