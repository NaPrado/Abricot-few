<script setup lang="ts">
import { useRegisterView } from './scripts/RegisterView'

const {
  role,
  name,
  surname,
  email,
  password,
  error,
  loading,
  handleSubmit,
  goToLogin,
  goToLanding,
} = useRegisterView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo" @click="goToLanding">Abricot</span>

      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-subtitle">Empezá gratis. Sin tarjeta requerida.</p>

      <!-- Role toggle -->
      <div class="auth-role-toggle">
        <button
          :class="['auth-role-btn', role === 'customer' && 'auth-role-btn--active']"
          type="button"
          @click="role = 'customer'"
        >
          Comensal
        </button>
        <button
          :class="['auth-role-btn', role === 'owner' && 'auth-role-btn--active']"
          type="button"
          @click="role = 'owner'"
        >
          Propietario
        </button>
      </div>

      <form class="auth-form" @submit="handleSubmit">
        <div class="auth-row">
          <div class="auth-field">
            <label class="auth-label" for="reg-name">Nombre</label>
            <input
              id="reg-name"
              v-model="name"
              class="auth-input"
              type="text"
              placeholder="Juan"
              required
            />
          </div>
          <div class="auth-field">
            <label class="auth-label" for="reg-surname">Apellido</label>
            <input
              id="reg-surname"
              v-model="surname"
              class="auth-input"
              type="text"
              placeholder="García"
              required
            />
          </div>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="email"
            class="auth-input"
            type="email"
            placeholder="tu@email.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="auth-field">
          <label class="auth-label" for="reg-password">Contraseña</label>
          <input
            id="reg-password"
            v-model="password"
            class="auth-input"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autocomplete="new-password"
            minlength="8"
            required
          />
        </div>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button class="auth-submit-btn" type="submit" :disabled="loading">
          {{ loading ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tenés cuenta?
        <button class="auth-link" type="button" @click="goToLogin">Ingresá</button>
      </p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
<style scoped>
.auth-role-toggle {
  display: flex;
  background: #080808;
  border: 1px solid #141414;
  border-radius: var(--radius-md);
  padding: 4px;
  margin-bottom: 1.5rem;
  gap: 4px;
}

.auth-role-btn {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  color: #444;
  font-size: 0.8125rem;
  font-family: inherit;
  cursor: pointer;
  transition: background var(--dur-fast), color var(--dur-fast);
}

.auth-role-btn--active {
  background: #111;
  color: #ccc;
}

.auth-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
</style>
