import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { BaseButton, BaseInput } from '@/components/base'

export function useRegisterView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const router = useRouter()

  const form = reactive({
    email: '',
    password: '',
    name: '',
    surname: '',
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function onSubmit(): Promise<void> {
    error.value = null
    loading.value = true
    try {
      await auth.register({
        email: form.email,
        password: form.password,
        name: form.name,
        surname: form.surname,
      })
      const role = auth.user?.role
      if (role === 'RESTAURANT_ADMIN' || role === 'SUPER_ADMIN') {
        await router.replace('/app/restaurants')
      } else {
        await router.replace('/explore')
      }
    } catch {
      error.value = t('auth.errors.register')
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
    form,
    loading,
    error,
    onSubmit,
  }
}
