import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export function usePlaceholderView() {
  const { t } = useI18n()
  const route = useRoute()
  const title = computed(() => (route.meta.title as string) || t('placeholder.defaultTitle'))

  return { RouterLink, t, title }
}
