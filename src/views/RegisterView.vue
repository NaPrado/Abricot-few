<script setup lang="ts">
import { useRegisterView } from './scripts/RegisterView'

const {
  RouterLink,
  BaseButton,
  BaseInput,
  t,
  form,
  loading,
  error,
  onSubmit,
} = useRegisterView()
</script>

<template>
  <div class="register-view">
    <div class="register-view-card">
      <img src="/abricot.png" alt="Abricot" class="register-view-logo" />
      <h1 class="register-view-title">{{ t('auth.registerButton') }}</h1>
      <p class="register-view-subtitle">{{ t('auth.registerSubtitle') }}</p>
      <p v-if="error" class="register-view-error">{{ error }}</p>
      <form class="register-view-form" @submit.prevent="onSubmit">
        <label class="register-view-label">{{ t('auth.firstName') }}</label>
        <BaseInput v-model="form.name" autocomplete="given-name" required />
        <label class="register-view-label">{{ t('auth.lastName') }}</label>
        <BaseInput v-model="form.surname" autocomplete="family-name" required />
        <label class="register-view-label">{{ t('auth.email') }}</label>
        <BaseInput v-model="form.email" type="email" autocomplete="email" required />
        <label class="register-view-label">{{ t('auth.password') }} {{ t('auth.passwordHint') }}</label>
        <BaseInput v-model="form.password" type="password" autocomplete="new-password" required />
        <BaseButton type="submit" variant="primary" class="register-view-submit" :disabled="loading">
          {{ loading ? t('auth.registerLoading') : t('auth.registerButton') }}
        </BaseButton>
      </form>
      <p class="register-view-footer">
        <RouterLink to="/login" class="register-view-link">{{ t('auth.loginButton') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style src="./styles/RegisterView.css" scoped></style>
