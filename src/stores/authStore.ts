import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { isOwnerRole, normalizeAuthUser } from '@/utils/authRole'
import { debugError, debugSection } from '@/utils/debug'
import type { User } from '@/types'
import type { CognitoTokenHash } from '@/services'

const ACTIVE_RESTAURANT_STORAGE_KEY = 'abricot_active_restaurant_id'
const COGNITO_STORAGE_KEYS = [
  'id_token',
  'cognito_id_token',
  'cognito_expires_in',
  'cognito_expires_at',
] as const

function clearCognitoStorage(): void {
  for (const key of COGNITO_STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}

function readStoredUser(): User | null {
  try {
    const storedUser = normalizeAuthUser(JSON.parse(localStorage.getItem("user") ?? "null"))
    debugSection('auth-store', 'read stored user', {
      hasUser: Boolean(storedUser),
      role: storedUser?.role ?? null,
      id: storedUser?.id ?? null,
    })
    return storedUser
  } catch (error) {
    debugError('auth-store', 'failed to parse stored user', { error })
    return null
  }
}

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("access_token"))
  const user = ref<User | null>(readStoredUser())

  const isAuthenticated = computed(() => token.value !== null)

  const isOwner = computed(() => isOwnerRole(user.value?.role))

  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')

  function persistCognitoTokens(payload: CognitoTokenHash): void {
    debugSection('auth-store', 'persist cognito token session', {
      hasAccessToken: Boolean(payload.accessToken),
      hasIdToken: Boolean(payload.idToken),
      hasRefreshToken: Boolean(payload.refreshToken),
      expiresIn: payload.expiresIn ?? null,
    })

    token.value = payload.accessToken
    localStorage.setItem("access_token", payload.accessToken)
    if (payload.refreshToken) {
      localStorage.setItem("refresh_token", payload.refreshToken)
    }
    if (payload.idToken) {
      localStorage.setItem("id_token", payload.idToken)
      localStorage.setItem("cognito_id_token", payload.idToken)
    }
    if (payload.expiresIn) {
      const expiresAt = Date.now() + payload.expiresIn * 1000
      localStorage.setItem("cognito_expires_in", String(payload.expiresIn))
      localStorage.setItem("cognito_expires_at", String(expiresAt))
    }
    localStorage.removeItem(ACTIVE_RESTAURANT_STORAGE_KEY)
  }

  function persistLocalUser(userData: User): void {
    const normalizedUser = normalizeAuthUser(userData)
    if (!normalizedUser) {
      debugError('auth-store', 'invalid local user payload received after cognito provisioning', {
        userData,
      })
      throw new Error('Invalid local user payload')
    }

    debugSection('auth-store', 'persist local user after cognito provisioning', {
      userId: normalizedUser.id,
      role: normalizedUser.role,
      email: normalizedUser.email,
    })

    user.value = normalizedUser
    localStorage.setItem("user", JSON.stringify(normalizedUser))
  }

  async function refreshLocalUser(): Promise<User> {
    const { userService } = await import('@/services/userService')
    const profile = await userService.refreshLocalUser()
    persistLocalUser(profile)
    return profile
  }

  /**
   * Fresh GET /users/{id} with the Cognito access-token JWT. The backend re-checks
   * the SNS subscription on this read and persists the resulting status, so this is
   * the call the "Ya confirmé, verificar" gate must use — provisioning via
   * POST /users (refreshLocalUser) does NOT trigger the SNS sync. Persists to the
   * store so every view sees the refreshed status.
   */
  async function reloadAuthenticatedUser(): Promise<User> {
    const currentUserId = user.value?.id
    if (!currentUserId) {
      throw new Error('No authenticated user to reload')
    }
    const { userService } = await import('@/services/userService')
    const profile = await userService.getById(currentUserId)
    persistLocalUser(profile)
    return profile
  }

  function logout(): void {
    debugSection('auth-store', 'logout', {
      userId: user.value?.id ?? null,
      role: user.value?.role ?? null,
      clearedActiveRestaurant: true,
    })
    token.value = null
    user.value = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    localStorage.removeItem(ACTIVE_RESTAURANT_STORAGE_KEY)
    clearCognitoStorage()
  }

  return {
    token,
    user,
    isAuthenticated,
    isOwner,
    isCustomer,
    persistCognitoTokens,
    persistLocalUser,
    refreshLocalUser,
    reloadAuthenticatedUser,
    logout,
  }
})
