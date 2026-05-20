import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection } from '@/utils/debug'
import {
  redirectAfterProvision,
  type AccountTypeChoice,
} from '@/utils/onboardingRedirect'
import { isOwnerRole } from '@/utils/authRole'

export function useAccountTypeOnboardingView() {
  const router = useRouter()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref('')

  async function choose(accountType: AccountTypeChoice): Promise<void> {
    if (loading.value) return
    error.value = ''
    loading.value = true
    debugSection('account-type-onboarding', 'provision start', { accountType })
    try {
      const profile = await userService.provision(accountType)
      authStore.persistLocalUser(profile)

      if (isOwnerRole(profile.role)) {
        await router.replace('/app/restaurants')
        return
      }

      const path = redirectAfterProvision(profile.role, accountType)
      debugSection('account-type-onboarding', 'provision completed', {
        accountType,
        role: profile.role,
        path,
      })
      await router.replace(path)
    } catch (err) {
      debugError('account-type-onboarding', 'provision failed', { error: err, accountType })
      error.value = 'No se pudo crear tu cuenta local. Reintentá.'
    } finally {
      loading.value = false
    }
  }

  return { loading, error, chooseCustomer: () => choose('customer'), chooseOwner: () => choose('restaurant_owner') }
}
