<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, X, MapPin, Phone, Mail, Calendar } from 'lucide-vue-next'
import type { Restaurant } from '@/types'

const props = defineProps<{ restaurant: Restaurant }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'upload-photo', file: File): void
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

function onFileChange(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('upload-photo', file)
}
</script>

<template>
  <div class="restaurant-detail-modal-overlay" @click.self="emit('close')">
    <div class="restaurant-detail-modal-container">

      <!-- Hero photo -->
      <div class="restaurant-detail-modal-hero">
        <img
          v-if="restaurant.photoUrl"
          :src="restaurant.photoUrl"
          :alt="restaurant.name"
          class="restaurant-detail-modal-hero-image"
        />
        <div v-else class="restaurant-detail-modal-hero-placeholder">
          {{ restaurant.name.charAt(0).toUpperCase() }}
        </div>

        <div class="restaurant-detail-modal-hero-gradient" />

        <!-- Upload trigger -->
        <button class="restaurant-detail-modal-photo-upload-trigger" @click="fileInput?.click()">
          <ImagePlus :size="18" />
          {{ restaurant.photoUrl ? t('restaurant.photo.uploadChange') : t('restaurant.photo.upload') }}
        </button>

        <!-- Name + close overlaid on gradient -->
        <div class="restaurant-detail-modal-hero-info">
          <h2 class="restaurant-detail-modal-title">{{ restaurant.name }}</h2>
          <button class="restaurant-detail-modal-close-button" @click="emit('close')">
            <X :size="16" />
          </button>
        </div>

        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      </div>

      <!-- Body -->
      <div class="restaurant-detail-modal-body">
        <div class="restaurant-detail-modal-fields-grid">
          <div>
            <p class="restaurant-detail-modal-field-label">
              <MapPin :size="10" />
              {{ t('restaurant.fields.address') }}
            </p>
            <p class="restaurant-detail-modal-field-value">{{ restaurant.address }}</p>
          </div>
          <div>
            <p class="restaurant-detail-modal-field-label">
              <Phone :size="10" />
              {{ t('restaurant.fields.phone') }}
            </p>
            <p class="restaurant-detail-modal-field-value">{{ restaurant.phone }}</p>
          </div>
        </div>

        <div class="restaurant-detail-modal-divider" />

        <div>
          <p class="restaurant-detail-modal-field-label">
            <Mail :size="10" />
            {{ t('restaurant.fields.email') }}
          </p>
          <p class="restaurant-detail-modal-field-value--muted">{{ restaurant.email ?? '—' }}</p>
        </div>

        <div>
          <p class="restaurant-detail-modal-field-label">{{ t('restaurant.fields.description') }}</p>
          <p class="restaurant-detail-modal-field-value--muted">{{ restaurant.description ?? '—' }}</p>
        </div>

        <div class="restaurant-detail-modal-divider" />

        <div>
          <p class="restaurant-detail-modal-field-label">
            <Calendar :size="10" />
            {{ t('restaurant.detail.createdAt') }}
          </p>
          <p class="restaurant-detail-modal-field-value--date">{{ formatDate(restaurant.createdAt) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="./styles/RestaurantDetailModal.css" scoped></style>
