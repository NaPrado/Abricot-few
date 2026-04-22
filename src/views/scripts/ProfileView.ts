import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { userService } from '@/services'
import { useToast } from '@/composables/useToast'
import { BaseInput, BaseButton } from '@/components/base'

export function useProfileView() {
  const { t } = useI18n()
  const auth = useAuthStore()
  const toast = useToast()

  const form = reactive({
    name: '',
    surname: '',
    email: '',
  })

  const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const saving = ref(false)
  const savingPassword = ref(false)

  onMounted(() => {
    if (auth.user) {
      form.name = auth.user.name
      form.surname = auth.user.surname
      form.email = auth.user.email
    }
  })

  async function saveInfo(): Promise<void> {
    if (!auth.user) return
    saving.value = true
    try {
      const updated = await userService.update(auth.user.id, { name: form.name, surname: form.surname })
      auth.user.name = updated.name
      auth.user.surname = updated.surname
      toast.show(t('profile.toast.infoOk'), 'success')
    } catch {
      toast.show(t('profile.toast.infoError'), 'error')
    } finally {
      saving.value = false
    }
  }

  async function savePassword(): Promise<void> {
    if (!auth.user) return
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.show(t('profile.toast.passwordMismatch'), 'error')
      return
    }
    savingPassword.value = true
    try {
      await userService.updatePassword(auth.user.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      toast.show(t('profile.toast.passwordOk'), 'success')
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } catch {
      toast.show(t('profile.toast.passwordError'), 'error')
    } finally {
      savingPassword.value = false
    }
  }

  return {
    t,
    form,
    passwordForm,
    saving,
    savingPassword,
    saveInfo,
    savePassword,
    BaseInput,
    BaseButton,
  }
}
