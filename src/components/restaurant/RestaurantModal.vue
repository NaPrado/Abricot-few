<script setup lang="ts">
import type { Restaurant, RestaurantCreateRequest } from '@/types'
import { useRestaurantModal } from './scripts/RestaurantModal'

const props = withDefaults(defineProps<{ restaurant?: Restaurant | null }>(), { restaurant: null })
const emit = defineEmits<{
  (e: 'save', payload: RestaurantCreateRequest, photo: File | null): void
  (e: 'close'): void
}>()

const {
  t,
  form,
  photoPreview,
  fileInput,
  BaseInput,
  BaseButton,
  ImagePlus,
  X,
  onFileChange,
  removePhoto,
  handleSubmit,
} = useRestaurantModal(props, emit)
</script>

<template>
  <div class="restaurant-modal-overlay" @click.self="emit('close')">
    <div class="restaurant-modal-container">
      <!-- Header -->
      <div class="restaurant-modal-header">
        <h2 class="restaurant-modal-title">
          {{ restaurant ? t('restaurant.edit') : t('restaurant.new') }}
        </h2>
        <button class="restaurant-modal-close-button" @click="emit('close')">
          <X :size="16" />
        </button>
      </div>

      <!-- Form -->
      <form class="restaurant-modal-form" @submit.prevent="handleSubmit">

        <!-- Photo -->
        <div>
          <label class="restaurant-modal-field-label">{{ t('restaurant.fields.photo') }}</label>
          <div class="restaurant-modal-photo-wrapper" @click="!photoPreview && fileInput?.click()">
            <img
              v-if="photoPreview"
              :src="photoPreview"
              alt="Preview"
              class="restaurant-modal-photo-preview-image"
            />
            <div v-else class="restaurant-modal-photo-placeholder">
              <ImagePlus :size="24" />
              <span class="restaurant-modal-photo-placeholder-text">{{ t('restaurant.photo.select') }}</span>
            </div>

            <div v-if="photoPreview" class="restaurant-modal-photo-hover-overlay">
              <button
                type="button"
                class="restaurant-modal-photo-change-button"
                @click.stop="fileInput?.click()"
              >
                <ImagePlus :size="13" />
                {{ t('restaurant.photo.change') }}
              </button>
              <button
                type="button"
                class="restaurant-modal-photo-remove-button"
                @click.stop="removePhoto"
              >
                <X :size="13" />
              </button>
            </div>
          </div>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
        </div>

        <div>
          <label class="restaurant-modal-field-label">
            {{ t('restaurant.fields.name') }}
            <span class="restaurant-modal-required-mark">*</span>
          </label>
          <BaseInput v-model="form.name" placeholder="La Parolaccia" required />
        </div>

        <div>
          <label class="restaurant-modal-field-label">
            {{ t('restaurant.fields.address') }}
            <span class="restaurant-modal-required-mark">*</span>
          </label>
          <BaseInput v-model="form.address" placeholder="Av. Corrientes 1234, CABA" required />
        </div>

        <div>
          <label class="restaurant-modal-field-label">
            {{ t('restaurant.fields.cityId') }}
            <span class="restaurant-modal-required-mark">*</span>
          </label>
          <BaseInput v-model="form.cityId" placeholder="00000000-0000-7000-8000-000000000000" required />
        </div>

        <div>
          <label class="restaurant-modal-field-label">
            {{ t('restaurant.fields.phone') }}
            <span class="restaurant-modal-required-mark">*</span>
          </label>
          <BaseInput v-model="form.phone" placeholder="+54 11 4444-5555" required />
        </div>

        <div>
          <label class="restaurant-modal-field-label">{{ t('restaurant.fields.email') }}</label>
          <BaseInput v-model="form.email" type="email" placeholder="reservas@restaurante.com" />
        </div>

        <div>
          <label class="restaurant-modal-field-label">{{ t('restaurant.fields.description') }}</label>
          <textarea
            v-model="form.description"
            rows="3"
            :placeholder="t('restaurant.fields.description')"
            class="restaurant-modal-textarea"
          />
        </div>

        <!-- Actions -->
        <div class="restaurant-modal-actions-row">
          <BaseButton
            variant="secondary"
            class="restaurant-modal-action-button"
            @click="emit('close')"
          >
            {{ t('common.cancel') }}
          </BaseButton>
          <BaseButton type="submit" variant="primary" class="restaurant-modal-action-button">
            {{ restaurant ? t('common.save') : t('restaurant.create') }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style src="./styles/RestaurantModal.css" scoped></style>
