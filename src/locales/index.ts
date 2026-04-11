import { createI18n } from 'vue-i18n'
import type { MessageSchema } from './es'
import es from './es'
import en from './en'

export const i18n = createI18n<[MessageSchema], 'es' | 'en'>({
  legacy: false,          // required for Composition API usage
  locale: 'es',           // default — Spanish Argentina
  fallbackLocale: 'en',
  messages: { es, en },
})
