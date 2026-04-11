<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRestaurantStore } from '@/stores'
import { useToast } from '@/composables'
import { RestaurantModal, RestaurantDetailModal } from '@/components/restaurant'
import { Plus, Pencil, Trash2, AlertTriangle, Store, RefreshCw, MapPin, Phone } from 'lucide-vue-next'
import type { Restaurant, RestaurantCreateRequest } from '@/types'

const { t } = useI18n()
const store = useRestaurantStore()
const { show } = useToast()

const showModal = ref(false)
const editingRestaurant = ref<Restaurant | null>(null)
const viewingRestaurant = ref<Restaurant | null>(null)
const deletingId = ref<number | null>(null)

onMounted(() => store.fetchAll())

function openCreate(): void {
  editingRestaurant.value = null
  showModal.value = true
}

function openEdit(restaurant: Restaurant): void {
  editingRestaurant.value = restaurant
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
  editingRestaurant.value = null
}

async function handleSave(payload: RestaurantCreateRequest, photo: File | null): Promise<void> {
  try {
    let restaurantId: number
    if (editingRestaurant.value) {
      await store.update(editingRestaurant.value.id, payload)
      restaurantId = editingRestaurant.value.id
      show(t('restaurant.toast.updated'), 'success')
    } else {
      const created = await store.create(payload)
      restaurantId = created.id
      show(t('restaurant.toast.created'), 'success')
    }
    if (photo) await store.uploadPhoto(restaurantId, photo)
    closeModal()
  } catch (e) {
    show(e instanceof Error ? e.message : t('restaurant.toast.saveError'), 'error')
  }
}

async function handleUploadPhoto(file: File): Promise<void> {
  if (!viewingRestaurant.value) return
  try {
    await store.uploadPhoto(viewingRestaurant.value.id, file)
    viewingRestaurant.value = store.restaurants.find((r) => r.id === viewingRestaurant.value!.id) ?? null
    show(t('restaurant.toast.photoOk'), 'success')
  } catch (e) {
    show(e instanceof Error ? e.message : t('restaurant.toast.photoError'), 'error')
  }
}

async function handleDelete(id: number): Promise<void> {
  if (!confirm(t('restaurant.deleteConfirm'))) return
  deletingId.value = id
  try {
    await store.remove(id)
    show(t('restaurant.toast.deleted'), 'success')
  } catch (e) {
    show(e instanceof Error ? e.message : t('restaurant.toast.deleteError'), 'error')
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="restaurants-view-wrapper">
    <!-- Header -->
    <div class="restaurants-view-header">
      <div>
        <h1 class="restaurants-view-page-title">{{ t('restaurant.title') }}</h1>
        <p class="restaurants-view-page-subtitle">{{ t('restaurant.subtitle') }}</p>
      </div>
      <button class="restaurants-view-create-button" @click="openCreate">
        <Plus :size="16" />
        {{ t('restaurant.new') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="restaurants-view-loading-wrapper">
      <div class="restaurants-view-loading-spinner" />
    </div>

    <!-- Fetch error -->
    <div v-else-if="store.error" class="restaurants-view-error-wrapper">
      <AlertTriangle class="restaurants-view-error-icon" />
      <p class="restaurants-view-error-message">{{ store.error }}</p>
      <button class="restaurants-view-retry-button" @click="store.fetchAll()">
        <RefreshCw :size="13" />
        {{ t('common.retry') }}
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.restaurants.length === 0" class="restaurants-view-empty-wrapper">
      <Store class="restaurants-view-empty-icon" />
      <p class="restaurants-view-empty-title">{{ t('restaurant.empty') }}</p>
      <p class="restaurants-view-empty-hint">{{ t('restaurant.emptyHint') }}</p>
      <button class="restaurants-view-empty-create-button" @click="openCreate">
        <Plus :size="15" />
        {{ t('restaurant.create') }}
      </button>
    </div>

    <!-- Card list -->
    <div v-else class="restaurants-view-list">
      <div
        v-for="(r, i) in store.restaurants"
        :key="r.id"
        class="restaurant-card"
        :style="{ animationDelay: `${i * 0.07}s` }"
        @click="viewingRestaurant = r"
      >
        <!-- Photo -->
        <div class="restaurant-card-photo">
          <img
            v-if="r.photoUrl"
            :src="r.photoUrl"
            :alt="r.name"
            class="restaurant-card-photo-image"
          />
          <div v-else class="restaurant-card-photo-placeholder">
            {{ r.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- Info -->
        <div class="restaurant-card-info">
          <p class="restaurant-card-name">{{ r.name }}</p>
          <div class="restaurant-card-meta">
            <span class="restaurant-card-meta-item">
              <MapPin :size="11" />
              {{ r.address }}
            </span>
            <span class="restaurant-card-meta-dot" />
            <span class="restaurant-card-meta-item">
              <Phone :size="11" />
              {{ r.phone }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="restaurant-card-actions" @click.stop>
          <button
            class="restaurant-card-action-btn"
            :title="t('restaurant.edit')"
            @click="openEdit(r)"
          >
            <Pencil :size="14" />
          </button>
          <button
            class="restaurant-card-action-btn restaurant-card-action-btn--delete"
            :disabled="deletingId === r.id"
            :title="t('restaurant.deleteConfirm')"
            @click="handleDelete(r.id)"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RestaurantDetailModal
      v-if="viewingRestaurant"
      :restaurant="viewingRestaurant"
      @close="viewingRestaurant = null"
      @upload-photo="handleUploadPhoto"
    />

    <RestaurantModal
      v-if="showModal"
      :restaurant="editingRestaurant"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>

<style src="./styles/RestaurantsView.css" scoped></style>
