<script setup lang="ts">
import { useLoginView } from './scripts/LoginView'

const {
  email,
  password,
  error,
  loading,
  cognitoReady,
  cognitoDiagnostics,
  handleSubmit,
  handleCognitoLogin,
  goToRegister,
  goToLanding,
} = useLoginView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo" @click="goToLanding">Abricot</span>

      <h1 class="auth-title">Ingresar a Abricot</h1>
      <p class="auth-subtitle">Cognito es el acceso principal del TP.</p>

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

        <div v-if="!cognitoReady" class="auth-dev-diagnostic" role="status">
          <strong>Configuracion Cognito incompleta</strong>
          <ul>
            <li v-for="item in cognitoDiagnostics" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <details class="auth-legacy-panel">
        <summary>Login legacy temporal</summary>

        <form class="auth-form" @submit="handleSubmit">
          <div class="auth-field">
            <label class="auth-label" for="login-email">Email</label>
            <input
              id="login-email"
              v-model="email"
              class="auth-input"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="auth-field">
            <label class="auth-label" for="login-password">Contrasena</label>
            <input
              id="login-password"
              v-model="password"
              class="auth-input"
              type="password"
              placeholder="********"
              autocomplete="current-password"
              required
            />
          </div>

          <p v-if="error" class="auth-error">{{ error }}</p>

          <button class="auth-submit-btn" type="submit" :disabled="loading">
            {{ loading ? 'Ingresando...' : 'Ingresar con login legacy' }}
          </button>
        </form>

        <p class="auth-footer">
          Registro legacy temporal
          <button class="auth-link" type="button" @click="goToRegister">Registrate</button>
        </p>
      </details>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
