import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores'
import { Home, LogOut } from 'lucide-vue-next'

export function useSidebarNav() {
  const { t } = useI18n()
  const router = useRouter()
  const authStore = useAuthStore()

  function logout(): void {
    authStore.logout()
    router.push('/login')
  }

  return { t, authStore, logout, Home, LogOut }
}
