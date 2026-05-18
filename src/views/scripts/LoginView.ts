import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection, redactAuthPayload } from '@/utils/debug'
import { buildCognitoLoginUrl, isCognitoConfigured } from '@/services'

export function useLoginView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const error = ref('')
  const loading = ref(false)
  const cognitoAvailable = isCognitoConfigured()

  async function handleSubmit(e: Event) {
    e.preventDefault()
    error.value = ''
    loading.value = true
    debugSection('login-view', 'submit start', redactAuthPayload({
      email: email.value,
      password: password.value,
    }))
    try {
      await authStore.login({ email: email.value, password: password.value })
      const redirectPath = authStore.isOwner ? '/app/restaurants' : '/me/reservations'
      debugSection('login-view', 'login completed; navigating', {
        redirectPath,
        storedRole: authStore.user?.role ?? null,
        isOwner: authStore.isOwner,
        isCustomer: authStore.isCustomer,
      })
      if (authStore.isOwner) {
        await router.push('/app/restaurants')
      } else {
        await router.push('/me/reservations')
      }
      debugSection('login-view', 'navigation completed', {
        currentPath: router.currentRoute.value.fullPath,
      })
    } catch (err) {
      debugError('login-view', 'login flow failed', {
        error: err,
        storedRole: authStore.user?.role ?? null,
      })
      error.value = 'Email o contraseña incorrectos.'
    } finally {
      loading.value = false
    }
  }

  function goToRegister() {
    void router.push('/register')
  }

  function goToLanding() {
    void router.push('/')
  }

  function handleCognitoLogin(): void {
    error.value = ''
    try {
      window.location.assign(buildCognitoLoginUrl())
    } catch (err) {
      debugError('login-view', 'cognito login URL build failed', { error: err })
      error.value = 'Cognito no esta configurado para este entorno.'
    }
  }

  return {
    email,
    password,
    error,
    loading,
    cognitoAvailable,
    handleSubmit,
    handleCognitoLogin,
    goToRegister,
    goToLanding,
  }
}
