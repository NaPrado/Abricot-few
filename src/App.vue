<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { BaseButton } from '@/components/base'
import { ToastContainer } from '@/components/shared'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const hasFatalError = ref(false)

onErrorCaptured(() => {
  hasFatalError.value = true
  return false
})

function reloadApp(): void {
  window.location.reload()
}
</script>

<template>
  <div class="app-root">
    <main v-if="hasFatalError" class="app-fallback">
      <h1 class="app-fallback-title">{{ t('app.fatalTitle') }}</h1>
      <p class="app-fallback-description">{{ t('app.fatalDescription') }}</p>
      <BaseButton variant="outline" @click="reloadApp">{{ t('app.reloadAction') }}</BaseButton>
    </main>
    <RouterView v-else />
    <ToastContainer />
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
}

.app-fallback {
  min-height: 100vh;
  display: grid;
  place-content: center;
  gap: 0.85rem;
  text-align: center;
  padding: 1.5rem;
}

.app-fallback-title {
  margin: 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
}

.app-fallback-description {
  margin: 0;
  color: var(--text-muted);
  max-width: 30rem;
}
</style>
