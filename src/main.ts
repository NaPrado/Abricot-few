import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { i18n } from '@/locales'
import { useToast } from '@/composables'
import { AUTH_EXPIRED_EVENT } from '@/services/http'
import { useAuthStore } from '@/stores/authStore'
import { debugError, debugSection, installAbricotDebugControls } from '@/utils/debug'
import App from './App.vue'
import router from './router'
import './assets/main.css'

installAbricotDebugControls()

const app = createApp(App)
const pinia = createPinia()
const toast = useToast()
const authStore = useAuthStore(pinia)

debugSection('app', 'bootstrap', {
	path: window.location.href,
	hasAccessToken: Boolean(localStorage.getItem('access_token')),
	hasRefreshToken: Boolean(localStorage.getItem('refresh_token')),
	hasUser: Boolean(localStorage.getItem('user')),
})

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
	debugSection('auth', 'session expired event', {
		currentPath: router.currentRoute.value.fullPath,
	})
	authStore.logout()
	toast.show(i18n.global.t('auth.sessionExpired'), 'error')
	if (router.currentRoute.value.path !== '/login') {
		void router.push('/login?expired=1')
	}
})

window.addEventListener('error', (event) => {
	debugError('global', 'window error', {
		message: event.message,
		filename: event.filename,
		lineno: event.lineno,
		colno: event.colno,
		error: event.error,
	})
	showGlobalError(i18n.global.t('errors.generic'))
})

window.addEventListener('unhandledrejection', (event) => {
	debugError('global', 'unhandled promise rejection', {
		reason: event.reason,
	})
	showGlobalError(i18n.global.t('errors.generic'))
})

router.onError((error, to, from) => {
	debugError('router', 'router error', {
		error,
		to: to?.fullPath,
		from: from?.fullPath,
	})
	showGlobalError(i18n.global.t('errors.generic'))
})

app.config.errorHandler = (error, instance, info) => {
	debugError('vue', 'app error handler', {
		error,
		info,
		component: instance?.$options?.name ?? '(anonymous)',
	})
	showGlobalError(i18n.global.t('errors.generic'))
}

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
