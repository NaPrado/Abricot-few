import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/locales'
import { useToast } from '@/composables'
import { AUTH_EXPIRED_EVENT } from '@/services/http'
import { useAuthStore } from '@/stores/authStore'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
const toast = useToast()
const authStore = useAuthStore(pinia)

let globalErrorLocked = false

function showGlobalError(message: string): void {
	if (globalErrorLocked) return
	globalErrorLocked = true
	toast.show(message, 'error')
	window.setTimeout(() => {
		globalErrorLocked = false
	}, 1500)
}

window.addEventListener(AUTH_EXPIRED_EVENT, () => {
	authStore.logout()
	toast.show(i18n.global.t('auth.sessionExpired'), 'error')
	if (router.currentRoute.value.path !== '/login') {
		void router.push('/login?expired=1')
	}
})

window.addEventListener('error', () => {
	showGlobalError(i18n.global.t('errors.generic'))
})

window.addEventListener('unhandledrejection', () => {
	showGlobalError(i18n.global.t('errors.generic'))
})

router.onError(() => {
	showGlobalError(i18n.global.t('errors.generic'))
})

app.config.errorHandler = () => {
	showGlobalError(i18n.global.t('errors.generic'))
}

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
