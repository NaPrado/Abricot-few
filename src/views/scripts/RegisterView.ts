import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

export function useRegisterView() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const role = ref<'customer' | 'owner'>(route.query.role === 'owner' ? 'owner' : 'customer')
  const name = ref('')
  const surname = ref('')
  const email = ref('')
  const password = ref('')
  const error = ref('')
  const loading = ref(false)

  async function handleSubmit(e: Event) {
    e.preventDefault()
    error.value = ''
    loading.value = true
    try {
      await authStore.register({
        name: name.value,
        surname: surname.value,
        email: email.value,
        password: password.value,
      })
      if (authStore.isOwner) {
        void router.push('/app/restaurants')
      } else {
        void router.push('/me/reservations')
      }
    } catch {
      error.value = 'No pudimos crear tu cuenta. Verificá los datos e intentá de nuevo.'
    } finally {
      loading.value = false
    }
  }

  function goToLogin() {
    void router.push('/login')
  }

  function goToLanding() {
    void router.push('/')
  }

  return { role, name, surname, email, password, error, loading, handleSubmit, goToLogin, goToLanding }
}
