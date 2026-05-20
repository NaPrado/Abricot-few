<script setup lang="ts">
import { useAccountTypeOnboardingView } from './scripts/AccountTypeOnboardingView'

const { loading, error, chooseCustomer, chooseOwner } = useAccountTypeOnboardingView()
</script>

<template>
  <div class="auth-view">
    <div class="auth-card">
      <span class="auth-logo">Abricot</span>
      <h1 class="auth-title">¿Cómo vas a usar Abricot?</h1>
      <p class="auth-subtitle">Elegí el tipo de cuenta para continuar.</p>

      <p v-if="error" class="auth-error" role="alert">{{ error }}</p>

      <div class="onboarding-choice-grid">
        <button
          type="button"
          class="onboarding-choice-card"
          :disabled="loading"
          @click="chooseCustomer"
        >
          <span class="onboarding-choice-title">Quiero pedir comida</span>
          <span class="onboarding-choice-desc">Explorar restaurantes y hacer pedidos.</span>
        </button>
        <button
          type="button"
          class="onboarding-choice-card onboarding-choice-card--owner"
          :disabled="loading"
          @click="chooseOwner"
        >
          <span class="onboarding-choice-title">Tengo un restaurante</span>
          <span class="onboarding-choice-desc">Registrar mi local y administrarlo.</span>
        </button>
      </div>

      <p v-if="loading" class="auth-subtitle">Creando tu cuenta...</p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
<style scoped>
.onboarding-choice-grid {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

.onboarding-choice-card {
  text-align: left;
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid #222;
  background: #0a0a0a;
  cursor: pointer;
  transition: border-color 0.15s ease;
}

.onboarding-choice-card:hover:not(:disabled) {
  border-color: var(--brand);
}

.onboarding-choice-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.onboarding-choice-card--owner {
  border-color: #2a2210;
}

.onboarding-choice-title {
  display: block;
  font-weight: 700;
  color: #ddd;
  margin-bottom: 0.35rem;
}

.onboarding-choice-desc {
  display: block;
  font-size: 0.8125rem;
  color: #666;
}

.auth-error {
  color: #e55;
  font-size: 0.8125rem;
  margin: 1rem 0 0;
  text-align: center;
}
</style>
