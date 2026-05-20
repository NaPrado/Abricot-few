import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { buildCognitoSignupUrl, getCognitoConfigDiagnostics } from '@/services'
import { debugError } from '@/utils/debug'

export function useRegisterRedirectView() {
  const router = useRouter()
  const message = ref('Redirigiendo a Cognito…')
  const cognitoConfig = getCognitoConfigDiagnostics()

  onMounted(() => {
    if (!cognitoConfig.isConfigured) {
      message.value = 'Cognito no está configurado.'
      void router.replace('/login')
      return
    }

    try {
      window.location.assign(buildCognitoSignupUrl())
    } catch (err) {
      debugError('register-redirect-view', 'cognito signup URL build failed', { error: err })
      message.value = 'No se pudo abrir el registro de Cognito.'
      void router.replace('/login')
    }
  })

  return { message }
}
