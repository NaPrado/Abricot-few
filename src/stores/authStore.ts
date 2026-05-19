import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { authService } from '@/services'
import { isOwnerRole, normalizeAuthUser } from '@/utils/authRole'
import { debugError, debugSection, redactAuthPayload } from '@/utils/debug'
import type { User, LoginRequest, RegisterRequest } from '@/types'
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

  function _persist(accessToken: string, refreshToken: string, userData: User): void {
    const normalizedUser = normalizeAuthUser(userData)
    if (!normalizedUser) {
      debugError('auth-store', 'invalid auth payload received from API', {
        userData,
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken),
      })
      throw new Error('Invalid auth user payload')
    }

    debugSection('auth-store', 'persist auth session', {
      userId: normalizedUser.id,
      role: normalizedUser.role,
      email: normalizedUser.email,
      hasAccessToken: Boolean(accessToken),
      hasRefreshToken: Boolean(refreshToken),
      clearedActiveRestaurant: true,
    })

    token.value = accessToken
    user.value = normalizedUser
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("refresh_token", refreshToken)
    localStorage.setItem("user", JSON.stringify(normalizedUser))
    localStorage.removeItem(ACTIVE_RESTAURANT_STORAGE_KEY)
  }

  async function login(payload: LoginRequest): Promise<void> {
    debugSection('auth-store', 'login start', redactAuthPayload({ ...payload }))
    const res = await authService.login(payload)
    debugSection('auth-store', 'login success response', {
      userId: res.user?.id,
      role: res.user?.role,
      hasAccessToken: Boolean(res.accessToken),
      hasRefreshToken: Boolean(res.refreshToken),
    })
    _persist(res.accessToken, res.refreshToken, res.user)
  }

  async function register(payload: RegisterRequest): Promise<void> {
    debugSection('auth-store', 'register start', redactAuthPayload({ ...payload }))
    const res = await authService.register(payload)
    debugSection('auth-store', 'register success response', {
      userId: res.user?.id,
      role: res.user?.role,
      requestedRole: payload.role,
      hasAccessToken: Boolean(res.accessToken),
      hasRefreshToken: Boolean(res.refreshToken),
    })
    _persist(res.accessToken, res.refreshToken, res.user)
  }

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

  return { token, user, isAuthenticated, isOwner, isCustomer, login, register, persistCognitoTokens, persistLocalUser, logout }
})
