import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { redirectToCognitoSignup } from '@/services'
import { useAuthStore } from '@/stores/authStore'

export function useAppNavbar() {
  const router = useRouter()
  const route = useRoute()
  const authStore = useAuthStore()
  const menuOpen = ref(false)

  const isOwner = computed(() => authStore.isOwner)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() ?? '?')
  const userName = computed(() => {
    if (!user.value) return ''
    return `${user.value.name} ${user.value.surname}`.trim()
  })

  function isActive(path: string): boolean {
    return route.path === path || route.path.startsWith(path + '/')
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function logout() {
    authStore.logout()
    menuOpen.value = false
    void router.push('/login')
  }

  function goToSignup() {
    try {
      redirectToCognitoSignup()
    } catch {
      void router.push('/login')
    }
  }

  return {
    menuOpen,
    isOwner,
    isAuthenticated,
    user,
    userInitial,
    userName,
    isActive,
    closeMenu,
    logout,
    goToSignup,
  }
}
