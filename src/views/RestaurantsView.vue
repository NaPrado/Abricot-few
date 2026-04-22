<script setup lang="ts">
import { useRestaurantsView } from './scripts/RestaurantsView'

const {
  Plus,
  Pencil,
  Trash2,
  Eye,
  BaseButton,
  RestaurantModal,
  RestaurantDetailModal,
  t,
  store,
  showForm,
  editing,
  detail,
  openCreate,
  openEdit,
  closeForm,
  onSave,
  onDelete,
  onDetailPhoto,
} = useRestaurantsView()
</script>

<template>
  <div class="restaurants-view">
    <header class="restaurants-view-header">
      <div>
        <h1 class="restaurants-view-title">{{ t('restaurant.title') }}</h1>
        <p class="restaurants-view-subtitle">{{ t('restaurant.subtitle') }}</p>
      </div>
      <BaseButton variant="primary" class="restaurants-view-add" @click="openCreate">
        <Plus :size="16" />
        {{ t('restaurant.new') }}
      </BaseButton>
    </header>

    <p v-if="store.error" class="restaurants-view-error">{{ store.error }}</p>

    <div v-if="store.isLoading" class="restaurants-view-loading">{{ t('common.loading') }}</div>

    <ul v-else-if="store.restaurants.length === 0" class="restaurants-view-empty">
      <li>{{ t('restaurant.empty') }}</li>
      <li class="restaurants-view-empty-hint">{{ t('restaurant.emptyHint') }}</li>
    </ul>

    <ul v-else class="restaurants-view-list">
      <li v-for="r in store.restaurants" :key="r.id" class="restaurants-view-card">
        <div class="restaurants-view-card-main">
          <h2 class="restaurants-view-card-name">{{ r.name }}</h2>
          <p class="restaurants-view-card-meta">{{ r.address }} · {{ r.city.name }}</p>
        </div>
        <div class="restaurants-view-card-actions">
          <button type="button" class="restaurants-view-icon-btn" :title="t('common.view')" @click="detail = r">
            <Eye :size="16" />
          </button>
          <button type="button" class="restaurants-view-icon-btn" :title="t('common.edit')" @click="openEdit(r)">
            <Pencil :size="16" />
          </button>
          <button type="button" class="restaurants-view-icon-btn restaurants-view-icon-btn--danger" :title="t('common.delete')" @click="onDelete(r.id)">
            <Trash2 :size="16" />
          </button>
        </div>
      </li>
    </ul>

    <RestaurantModal
      v-if="showForm"
      :restaurant="editing"
      @close="closeForm"
      @save="onSave"
    />

    <RestaurantDetailModal
      v-if="detail"
      :restaurant="detail"
      @close="detail = null"
      @upload-photo="onDetailPhoto"
    />
  </div>
</template>

<style src="./styles/RestaurantsView.css" scoped></style>
