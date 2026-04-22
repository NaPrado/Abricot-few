<script setup lang="ts">
import { useOwnerPromotionsView } from './scripts/OwnerPromotionsView'

const {
  t,
  promotions,
  loading,
  showForm,
  form,
  editingId,
  discountTypeOptions,
  savingForm,
  openCreate,
  openEdit,
  closeForm,
  savePromotion,
  deletePromotion,
  activatePromotion,
  deactivatePromotion,
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseButton,
  BaseSpinner,
  EmptyState,
  Plus,
  Pencil,
  Trash2,
} = useOwnerPromotionsView()
</script>

<template>
  <div class="owner-promotions-view">
    <header class="owner-promotions-view-header">
      <div>
        <h1 class="owner-promotions-view-title">{{ t('ownerPromotions.title') }}</h1>
        <p class="owner-promotions-view-subtitle">{{ t('ownerPromotions.subtitle') }}</p>
      </div>
      <BaseButton variant="primary" @click="openCreate">
        <Plus :size="15" />
        {{ t('ownerPromotions.new') }}
      </BaseButton>
    </header>

    <div v-if="loading" class="owner-promotions-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="promotions.length === 0"
      :message="t('ownerPromotions.empty')"
      :hint="t('ownerPromotions.emptyHint')"
    />

    <ul v-else class="owner-promotions-view-list">
      <li v-for="promo in promotions" :key="promo.id" class="owner-promotions-view-card">
        <div class="owner-promotions-view-card-main">
          <div class="owner-promotions-view-card-top">
            <h3 class="owner-promotions-view-card-title">{{ promo.title }}</h3>
            <span
              class="owner-promotions-view-status-badge"
              :class="promo.isActive ? 'owner-promotions-view-status-badge--active' : 'owner-promotions-view-status-badge--inactive'"
            >
              {{ promo.isActive ? t('ownerPromotions.active') : t('ownerPromotions.inactive') }}
            </span>
          </div>
          <p class="owner-promotions-view-card-meta">
            {{ t(`ownerPromotions.discountType.${promo.discountType}`) }} · {{ promo.discountValue }}
            <span v-if="promo.startDate || promo.endDate">
              · {{ promo.startDate }} → {{ promo.endDate }}
            </span>
          </p>
          <p v-if="promo.description" class="owner-promotions-view-card-description">
            {{ promo.description }}
          </p>
        </div>
        <div class="owner-promotions-view-card-actions">
          <button
            type="button"
            class="owner-promotions-view-action-btn"
            @click="promo.isActive ? deactivatePromotion(promo.id) : activatePromotion(promo.id)"
          >
            {{ promo.isActive ? t('ownerPromotions.deactivate') : t('ownerPromotions.activate') }}
          </button>
          <button type="button" class="owner-promotions-view-icon-btn" @click="openEdit(promo)">
            <Pencil :size="14" />
          </button>
          <button type="button" class="owner-promotions-view-icon-btn owner-promotions-view-icon-btn--danger" @click="deletePromotion(promo.id)">
            <Trash2 :size="14" />
          </button>
        </div>
      </li>
    </ul>

    <!-- Create/Edit modal -->
    <Teleport to="body">
      <div v-if="showForm" class="owner-promotions-view-modal-overlay" @click.self="closeForm">
        <div class="owner-promotions-view-modal">
          <h3 class="owner-promotions-view-modal-title">
            {{ editingId ? t('common.edit') : t('ownerPromotions.new') }}
          </h3>
          <form class="owner-promotions-view-form" @submit.prevent="savePromotion">
            <BaseInput v-model="form.title" :label="t('ownerPromotions.fields.title')" required />
            <BaseTextarea v-model="form.description" :label="t('ownerPromotions.fields.description')" />
            <BaseSelect
              v-model="form.discountType"
              :label="t('ownerPromotions.fields.discountType')"
              :options="discountTypeOptions"
            />
            <BaseInput v-model="form.discountValue" :label="t('ownerPromotions.fields.discountValue')" required />
            <BaseInput v-model="form.startDate" :label="t('ownerPromotions.fields.startDate')" type="date" />
            <BaseInput v-model="form.endDate" :label="t('ownerPromotions.fields.endDate')" type="date" />
            <label class="owner-promotions-view-checkbox-row">
              <input type="checkbox" v-model="form.notifyUsers" />
              {{ t('ownerPromotions.fields.notifyUsers') }}
            </label>
            <div class="owner-promotions-view-modal-actions">
              <BaseButton type="button" variant="ghost" @click="closeForm">{{ t('common.cancel') }}</BaseButton>
              <BaseButton type="submit" variant="primary" :loading="savingForm">{{ t('common.save') }}</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OwnerPromotionsView.css" scoped></style>
