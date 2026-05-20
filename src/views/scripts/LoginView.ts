import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { debugError } from '@/utils/debug'
import {
  buildCognitoLoginUrl,
  buildCognitoSignupUrl,
  getCognitoConfigDiagnostics,
} from '@/services'

export function useLoginView() {
  const router = useRouter()
  const cognitoConfig = getCognitoConfigDiagnostics()

  const error = ref('')
  const cognitoReady = cognitoConfig.isConfigured
  const cognitoDiagnostics = cognitoConfig.diagnostics

  function goToLanding() {
    void router.push('/')
  }

  function handleCognitoLogin(): void {
    error.value = ''
    if (!cognitoReady) return

    try {
      window.location.assign(buildCognitoLoginUrl())
    } catch (err) {
      debugError('login-view', 'cognito login URL build failed', { error: err })
      error.value = 'Cognito no esta configurado para este entorno.'
    }
  }

  function handleCognitoSignup(): void {
    error.value = ''
    if (!cognitoReady) return

    try {
      window.location.assign(buildCognitoSignupUrl())
    } catch (err) {
      debugError('login-view', 'cognito signup URL build failed', { error: err })
      error.value = 'Cognito no esta configurado para este entorno.'
    }
  }

  return {
    error,
    cognitoReady,
    cognitoDiagnostics,
    handleCognitoLogin,
    handleCognitoSignup,
    goToLanding,
  }
}
