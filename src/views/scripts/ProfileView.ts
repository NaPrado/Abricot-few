import { ref, onMounted } from 'vue'
import { userService } from '@/services'
import { useAuthStore } from '@/stores/authStore'
import type { UpdatePasswordRequest } from '@/types'

export function useProfileView() {
  const authStore = useAuthStore()

  const name = ref(authStore.user?.name ?? '')
  const surname = ref(authStore.user?.surname ?? '')
  const email = ref(authStore.user?.email ?? '')
  const saving = ref(false)
  const saveSuccess = ref(false)
  const saveError = ref('')

  const currentPassword = ref('')
  const newPassword = ref('')
  const passwordSaving = ref(false)
  const passwordSuccess = ref(false)
  const passwordError = ref('')

  async function saveProfile(e: Event) {
    e.preventDefault()
    if (!authStore.user) return
    saving.value = true
    saveSuccess.value = false
    saveError.value = ''
    try {
      await userService.update(authStore.user.id, { name: name.value, surname: surname.value })
      saveSuccess.value = true
    } catch {
      saveError.value = 'No fue posible guardar los cambios.'
    } finally {
      saving.value = false
    }
  }

  async function savePassword(e: Event) {
    e.preventDefault()
    if (!authStore.user) return
    passwordSaving.value = true
    passwordSuccess.value = false
    passwordError.value = ''
    const payload: UpdatePasswordRequest = {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
    }
    try {
      await userService.updatePassword(authStore.user.id, payload)
      passwordSuccess.value = true
      currentPassword.value = ''
      newPassword.value = ''
    } catch {
      passwordError.value = 'Contraseña actual incorrecta o error al actualizar.'
    } finally {
      passwordSaving.value = false
    }
  }

  onMounted(async () => {
    if (!authStore.user) return
    try {
      const profile = await userService.getById(authStore.user.id)
      name.value = profile.name
      surname.value = profile.surname
      email.value = profile.email
    } catch {
      // use cached values
    }
  })

  return {
    name, surname, email,
    saving, saveSuccess, saveError, saveProfile,
    currentPassword, newPassword, passwordSaving, passwordSuccess, passwordError, savePassword,
  }
}
