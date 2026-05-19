import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { cognitoAuthService, parseCognitoCallbackHash, userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection } from '@/utils/debug'

type CallbackStatus = 'processing' | 'ready' | 'error'

export function useAuthCallbackView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const status = ref<CallbackStatus>('processing')
  const message = ref('Procesando credenciales...')
  const secondaryMessage = ref('')
  const loading = ref(false)
  const authTestResult = ref<unknown>(null)

  const hasAccessToken = computed(() =>
    Boolean(authStore.token || localStorage.getItem('access_token')),
  )
  const canRunAuthTest = computed(() => hasAccessToken.value && !loading.value)
  const claims = computed(() =>
    authTestResult.value ? JSON.stringify(authTestResult.value, null, 2) : '',
  )

  const detail = computed(() => message.value)
  const secondaryDetail = computed(() => secondaryMessage.value)

  function cleanHash(): void {
    const cleanUrl = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, document.title, cleanUrl)
  }

  async function runAuthTest(): Promise<void> {
    if (!hasAccessToken.value) {
      status.value = 'error'
      message.value = 'No hay access_token disponible para probar /auth-test.'
      secondaryMessage.value = ''
      return
    }

    loading.value = true
    authTestResult.value = null
    try {
      const response = await cognitoAuthService.authTest()
      authTestResult.value = response.claims
      message.value = '/auth-test respondio correctamente.'
      secondaryMessage.value = ''
      status.value = 'ready'
    } catch (err) {
      debugError('auth-callback-view', 'auth-test failed', { error: err })
      message.value = 'No se pudo validar /auth-test con el token actual.'
      secondaryMessage.value = ''
      status.value = 'error'
    } finally {
      loading.value = false
    }
  }

  function goToLogin(): void {
    void router.push('/login')
  }

  async function processCallback(): Promise<void> {
    const parsed = parseCognitoCallbackHash(window.location.hash)
    if ('error' in parsed) {
      status.value = 'error'
      message.value = parsed.errorDescription
        ? `${parsed.error}: ${parsed.errorDescription}`
        : parsed.error
      secondaryMessage.value = ''
      cleanHash()
      return
    }

    try {
      authStore.persistCognitoTokens(parsed)
      const localUser = await userService.provisionFromCognito()
      authStore.persistLocalUser(localUser)
      cleanHash()
      status.value = 'ready'
      message.value = 'Sesion Cognito vinculada con usuario local. Ya podes probar /auth-test.'
      secondaryMessage.value = ''
      debugSection('auth-callback-view', 'cognito tokens and local user stored', {
        hasAccessToken: Boolean(parsed.accessToken),
        hasIdToken: Boolean(parsed.idToken),
        hasRefreshToken: Boolean(parsed.refreshToken),
        expiresIn: parsed.expiresIn ?? null,
        userId: localUser.id,
        role: localUser.role,
      })
    } catch (err) {
      debugError('auth-callback-view', 'local user provisioning failed', { error: err })
      cleanHash()
      status.value = 'error'
      message.value = 'Tokens Cognito guardados, pero no se pudo hidratar el usuario local.'
      secondaryMessage.value = 'Esto es esperable hasta aplicar PASO 2.3 / RDS Proxy.'
    }
  }

  onMounted(() => {
    void processCallback()
  })

  return {
    status,
    detail,
    secondaryDetail,
    loading,
    canRunAuthTest,
    claims,
    runAuthTest,
    goToLogin,
  }
}
