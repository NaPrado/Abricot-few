<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { HttpError } from '@/services'
import { BaseInput, BaseButton } from '@/components/base'
import { AlertTriangle } from 'lucide-vue-next'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sessionExpired = route.query.expired === '1'

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const isLoading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMsg.value = null
  isLoading.value = true
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/app')
  } catch (e) {
    errorMsg.value = e instanceof HttpError ? e.message : t('auth.errors.login')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-view-wrapper">
    <div class="login-view-content">
      <!-- Logo -->
      <div class="login-view-logo-section">
        <RouterLink to="/" class="login-view-logo-link">
          <img src="/abricot.png" alt="Abricot" class="login-view-logo-image" />
        </RouterLink>
        <p class="login-view-subtitle">{{ t('auth.loginSubtitle') }}</p>
      </div>

      <!-- Session expired banner -->
      <div v-if="sessionExpired" class="login-view-session-expired-banner">
        <AlertTriangle :size="16" />
        {{ t('auth.sessionExpired') }}
      </div>

      <!-- Card -->
      <div class="login-view-card">
        <form class="login-view-form" @submit.prevent="handleSubmit">
          <div>
            <label class="login-view-field-label">{{ t('auth.email') }}</label>
            <BaseInput v-model="email" type="email" placeholder="hola@restaurante.com" required />
          </div>

          <div>
            <label class="login-view-field-label">{{ t('auth.password') }}</label>
            <BaseInput v-model="password" type="password" placeholder="••••••••" required />
          </div>

          <p v-if="errorMsg" class="login-view-error-message">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="isLoading" class="w-full">
            {{ isLoading ? t('auth.loginLoading') : t('auth.loginButton') }}
          </BaseButton>
        </form>
      </div>

      <p class="login-view-register-prompt">
        {{ t('auth.noAccount') }}
        <RouterLink to="/register" class="login-view-register-link">{{ t('auth.signUp') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style src="./styles/LoginView.css" scoped></style>
