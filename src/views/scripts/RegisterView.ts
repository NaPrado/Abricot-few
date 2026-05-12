import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection, redactAuthPayload } from '@/utils/debug'

export function useRegisterView() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()

  const role = ref<'customer' | 'owner'>(route.query.role === 'owner' ? 'owner' : 'customer')

  watch(
    () => route.query.role,
    (r) => {
      role.value = r === 'owner' ? 'owner' : 'customer'
    },
  )
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
    const requestedRole = role.value === 'owner' ? 'RESTAURANT_ADMIN' : 'CUSTOMER'
    debugSection('register-view', 'submit start', redactAuthPayload({
      name: name.value,
      surname: surname.value,
      email: email.value,
      password: password.value,
      role: requestedRole,
      currentPath: route.fullPath,
    }))
    try {
      await authStore.register({
        name: name.value,
        surname: surname.value,
        email: email.value,
        password: password.value,
        role: requestedRole,
      })
      const redirectPath = authStore.isOwner ? '/app/restaurants' : '/me/reservations'
      debugSection('register-view', 'register completed; navigating', {
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
      debugSection('register-view', 'navigation completed', {
        currentPath: router.currentRoute.value.fullPath,
      })
    } catch (err) {
      debugError('register-view', 'register flow failed', {
        error: err,
        requestedRole,
        storedRole: authStore.user?.role ?? null,
        currentPath: route.fullPath,
      })
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
