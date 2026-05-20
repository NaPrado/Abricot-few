import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { parseCognitoCallbackHash } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection } from '@/utils/debug'
import { normalizeAuthUser } from '@/utils/authRole'
import { homePathForRole } from '@/utils/onboardingRedirect'

type CallbackStatus = 'processing' | 'redirecting' | 'error'

export function useAuthCallbackView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const status = ref<CallbackStatus>('processing')
  const message = ref('Procesando credenciales...')
  const secondaryMessage = ref('')

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
      cleanHash()

      const storedUser =
        authStore.user ?? normalizeAuthUser(JSON.parse(localStorage.getItem('user') ?? 'null'))

      if (storedUser) {
        status.value = 'redirecting'
        message.value = 'Sesion restaurada. Redirigiendo...'
        debugSection('auth-callback-view', 'stored local user found; redirecting by role', {
          userId: storedUser.id,
          role: storedUser.role,
        })
        await router.replace(homePathForRole(storedUser.role))
        return
      }

      status.value = 'redirecting'
      message.value = 'Completá el tipo de cuenta para continuar.'
      debugSection('auth-callback-view', 'no stored local user; onboarding account type', {
        hasAccessToken: Boolean(parsed.accessToken),
      })
      await router.replace('/onboarding/account-type')
    } catch (err) {
      debugError('auth-callback-view', 'callback processing failed', { error: err })
      cleanHash()
      status.value = 'error'
      message.value = 'No se pudieron guardar las credenciales de Cognito.'
      secondaryMessage.value = ''
    }
  }

  function cleanHash(): void {
    const cleanUrl = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, document.title, cleanUrl)
  }

  function goToLogin(): void {
    void router.push('/login')
  }

  onMounted(() => {
    void processCallback()
  })

  return {
    status,
    detail: message,
    secondaryDetail: secondaryMessage,
    goToLogin,
  }
}
