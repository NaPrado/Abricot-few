<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { HttpError } from '@/services'
import { BaseInput, BaseButton } from '@/components/base'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const isLoading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMsg.value = null
  if (password.value.length < 8) {
    errorMsg.value = t('auth.errors.passwordLength')
    return
  }
  isLoading.value = true
  try {
    await authStore.register({ name: name.value, surname: surname.value, email: email.value, password: password.value })
    router.push('/app')
  } catch (e) {
    errorMsg.value = e instanceof HttpError ? e.message : t('auth.errors.register')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="register-view-wrapper">
    <div class="register-view-content">
      <!-- Logo -->
      <div class="register-view-logo-section">
        <RouterLink to="/" class="register-view-logo-link">
          <img src="/abricot.png" alt="Abricot" class="register-view-logo-image" />
        </RouterLink>
        <p class="register-view-subtitle">{{ t('auth.registerSubtitle') }}</p>
      </div>

      <!-- Card -->
      <div class="register-view-card">
        <form class="register-view-form" @submit.prevent="handleSubmit">
          <div class="register-view-name-grid">
            <div>
              <label class="register-view-field-label">{{ t('auth.firstName') }}</label>
              <BaseInput v-model="name" placeholder="Juan" required />
            </div>
            <div>
              <label class="register-view-field-label">{{ t('auth.lastName') }}</label>
              <BaseInput v-model="surname" placeholder="García" required />
            </div>
          </div>

          <div>
            <label class="register-view-field-label">{{ t('auth.email') }}</label>
            <BaseInput v-model="email" type="email" placeholder="hola@restaurante.com" required />
          </div>

          <div>
            <label class="register-view-field-label">
              {{ t('auth.password') }}
              <span class="register-view-password-hint">{{ t('auth.passwordHint') }}</span>
            </label>
            <BaseInput v-model="password" type="password" placeholder="••••••••" required />
          </div>

          <p v-if="errorMsg" class="register-view-error-message">{{ errorMsg }}</p>

          <BaseButton type="submit" :loading="isLoading" class="w-full">
            {{ isLoading ? t('auth.registerLoading') : t('auth.registerButton') }}
          </BaseButton>
        </form>
      </div>

      <p class="register-view-login-prompt">
        {{ t('auth.hasAccount') }}
        <RouterLink to="/login" class="register-view-login-link">{{ t('auth.signIn') }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style src="./styles/RegisterView.css" scoped></style>
