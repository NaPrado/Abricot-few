import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { BaseButton, BaseInput } from '@/components/base'

export function useLoginView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const form = reactive({ email: '', password: '' })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function onSubmit(): Promise<void> {
    error.value = null
    loading.value = true
    try {
      await auth.login({ email: form.email, password: form.password })
      const role = auth.user?.role
      if (role === 'RESTAURANT_ADMIN' || role === 'SUPER_ADMIN') {
        await router.replace('/app/restaurants')
      } else {
        await router.replace('/explore')
      }
    } catch {
      error.value = t('auth.errors.login')
    } finally {
      loading.value = false
    }
  }

  return {
    RouterLink,
    BaseButton,
    BaseInput,
    t,
    auth,
    router,
    route,
    form,
    loading,
    error,
    onSubmit,
  }
}
