import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useLoginView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const password = ref('')
  const error = ref('')
  const loading = ref(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    error.value = ''
    loading.value = true
    try {
      await authStore.login({ email: email.value, password: password.value })
      if (authStore.isOwner) {
        void router.push('/app/restaurants')
      } else {
        void router.push('/me/reservations')
      }
    } catch {
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

  return { email, password, error, loading, handleSubmit, goToRegister, goToLanding }
}
