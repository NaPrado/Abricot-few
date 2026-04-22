<script setup lang="ts">
import { useLoginView } from './scripts/LoginView'

const {
  RouterLink,
  BaseButton,
  BaseInput,
  t,
  route,
  form,
  loading,
  error,
  onSubmit,
} = useLoginView()
</script>

<template>
  <div class="login-view">
    <div class="login-view-card">
      <img src="/abricot.png" alt="Abricot" class="login-view-logo" />
      <h1 class="login-view-title">{{ t('auth.loginButton') }}</h1>
      <p class="login-view-subtitle">{{ t('auth.loginSubtitle') }}</p>
      <p v-if="route.query.expired" class="login-view-banner">{{ t('auth.sessionExpired') }}</p>
      <p v-if="error" class="login-view-error">{{ error }}</p>
      <form class="login-view-form" @submit.prevent="onSubmit">
        <label class="login-view-label">{{ t('auth.email') }}</label>
        <BaseInput v-model="form.email" type="email" autocomplete="email" required />
        <label class="login-view-label">{{ t('auth.password') }}</label>
        <BaseInput v-model="form.password" type="password" autocomplete="current-password" required />
        <BaseButton type="submit" variant="primary" class="login-view-submit" :disabled="loading">
          {{ loading ? t('auth.loginLoading') : t('auth.loginButton') }}
        </BaseButton>
      </form>
      <p class="login-view-footer">
        <RouterLink to="/register" class="login-view-link">{{ t('auth.registerButton') }}</RouterLink>
        ·
        <RouterLink to="/" class="login-view-link">{{ t('nav.home') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
