import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { PublicMarketingNav } from '@/components/shared'
import { ArrowRight } from 'lucide-vue-next'

export function useLandingView() {
  const { t } = useI18n()
  const authStore = useAuthStore()
  const searchQuery = ref('')

  return {
    t,
    RouterLink,
    PublicMarketingNav,
    authStore,
    searchQuery,
    ArrowRight,
  }
}
