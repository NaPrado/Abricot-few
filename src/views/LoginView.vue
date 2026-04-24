<script setup lang="ts">
import { useLoginView } from './scripts/LoginView'

const { email, password, error, loading, handleSubmit, goToRegister, goToLanding } = useLoginView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo" @click="goToLanding">Abricot</span>

      <h1 class="auth-title">Bienvenido de nuevo</h1>
      <p class="auth-subtitle">Ingresá a tu cuenta para continuar.</p>

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
          <label class="auth-label" for="login-password">Contraseña</label>
          <input
            id="login-password"
            v-model="password"
            class="auth-input"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button class="auth-submit-btn" type="submit" :disabled="loading">
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿No tenés cuenta?
        <button class="auth-link" type="button" @click="goToRegister">Registrate</button>
      </p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
