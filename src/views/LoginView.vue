<script setup lang="ts">
import { useLoginView } from './scripts/LoginView'

const {
  error,
  cognitoReady,
  cognitoDiagnostics,
  handleCognitoLogin,
  handleCognitoSignup,
  goToLanding,
} = useLoginView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo" @click="goToLanding">Abricot</span>

      <h1 class="auth-title">Ingresar a Abricot</h1>
      <p class="auth-subtitle">Cognito es el unico mecanismo de acceso del TP.</p>

      <section class="auth-cognito-panel" aria-labelledby="cognito-login-title">
        <h2 id="cognito-login-title" class="auth-section-title">Cognito Hosted UI</h2>
        <button
          class="auth-cognito-btn"
          type="button"
          :disabled="!cognitoReady"
          @click="handleCognitoLogin"
        >
          Ingresar con Cognito
        </button>

        <button
          class="auth-cognito-secondary-btn"
          type="button"
          :disabled="!cognitoReady"
          @click="handleCognitoSignup"
        >
          Crear cuenta en Cognito
        </button>

        <div v-if="!cognitoReady" class="auth-dev-diagnostic" role="status">
          <strong>Configuracion Cognito incompleta</strong>
          <ul>
            <li v-for="item in cognitoDiagnostics" :key="item">{{ item }}</li>
          </ul>
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>
      </section>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
