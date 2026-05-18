import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cognitoAuthService, parseCognitoCallbackHash } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection } from '@/utils/debug'

type CallbackStatus = 'processing' | 'ready' | 'error'

export function useAuthCallbackView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const status = ref<CallbackStatus>('processing')
  const message = ref('Procesando credenciales...')
  const loading = ref(false)
  const authTestResult = ref<unknown>(null)

  const claims = computed(() =>
    authTestResult.value ? JSON.stringify(authTestResult.value, null, 2) : '',
  )

  const detail = computed(() => message.value)

  function cleanHash(): void {
    const cleanUrl = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, document.title, cleanUrl)
  }

  async function runAuthTest(): Promise<void> {
    loading.value = true
    authTestResult.value = null
    try {
      const response = await cognitoAuthService.authTest()
      authTestResult.value = response.claims
      message.value = '/auth-test respondio correctamente.'
    } catch (err) {
      debugError('auth-callback-view', 'auth-test failed', { error: err })
      message.value = 'No se pudo validar /auth-test con el token actual.'
      status.value = 'error'
    } finally {
      loading.value = false
    }
  }

  function goToLogin(): void {
    void router.push('/login')
  }

  onMounted(() => {
    const parsed = parseCognitoCallbackHash(window.location.hash)
    if ('error' in parsed) {
      status.value = 'error'
      message.value = parsed.errorDescription
        ? `${parsed.error}: ${parsed.errorDescription}`
        : parsed.error
      cleanHash()
      return
    }

    authStore.persistCognitoTokens(parsed)
    cleanHash()
    status.value = 'ready'
    message.value = 'Tokens Cognito guardados. Ya podes probar /auth-test.'
    debugSection('auth-callback-view', 'cognito tokens stored', {
      hasAccessToken: Boolean(parsed.accessToken),
      hasIdToken: Boolean(parsed.idToken),
      hasRefreshToken: Boolean(parsed.refreshToken),
      expiresIn: parsed.expiresIn ?? null,
    })
  })

  return { status, detail, loading, claims, runAuthTest, goToLogin }
}
