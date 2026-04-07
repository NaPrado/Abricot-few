import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { authService } from "@/services/authService"
import type { User, LoginRequest, RegisterRequest } from "@/types"

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("access_token"))
  const user = ref<User | null>(JSON.parse(localStorage.getItem("user") ?? "null"))

  const isAuthenticated = computed(() => token.value !== null)

  function _persist(accessToken: string, userData: User): void {
    token.value = accessToken
    user.value = userData
    localStorage.setItem("access_token", accessToken)
    localStorage.setItem("user", JSON.stringify(userData))
  }

  async function login(payload: LoginRequest): Promise<void> {
    const res = await authService.login(payload)
    _persist(res.accessToken, res.user)
  }

  async function register(payload: RegisterRequest): Promise<void> {
    const res = await authService.register(payload)
    _persist(res.accessToken, res.user)
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
  }

  return { token, user, isAuthenticated, login, register, logout }
})
