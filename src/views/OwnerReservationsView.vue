<script setup lang="ts">
import { useOwnerReservationsView } from './scripts/OwnerReservationsView'

const {
  t,
  reservations,
  loading,
  filters,
  statusFilterOptions,
  sourceFilterOptions,
  adminSourceOptions,
  showAdminForm,
  adminForm,
  availableSlots,
  loadingSlots,
  cancelTarget,
  cancelReason,
  openAdminForm,
  closeAdminForm,
  checkSlots,
  createAdminReservation,
  openCancel,
  closeCancel,
  confirmCancel,
  confirmComplete,
  confirmNoShow,
  StatusBadge,
  BaseInput,
  BaseSelect,
  BaseButton,
  BaseSpinner,
  EmptyState,
  Plus,
} = useOwnerReservationsView()
</script>

<template>
  <div class="owner-reservations-view">
    <header class="owner-reservations-view-header">
      <div>
        <h1 class="owner-reservations-view-title">{{ t('ownerReservations.title') }}</h1>
        <p class="owner-reservations-view-subtitle">{{ t('ownerReservations.subtitle') }}</p>
      </div>
      <BaseButton variant="primary" @click="openAdminForm">
        <Plus :size="15" />
        {{ t('ownerReservations.new') }}
      </BaseButton>
    </header>

    <!-- Filters -->
    <div class="owner-reservations-view-filters">
      <BaseInput v-model="filters.dateFrom" :label="t('ownerReservations.filterDateFrom')" type="date" />
      <BaseInput v-model="filters.dateTo" :label="t('ownerReservations.filterDateTo')" type="date" />
      <BaseSelect v-model="filters.status" :label="t('ownerReservations.filterStatus')" :options="statusFilterOptions" />
      <BaseSelect v-model="filters.source" :label="t('ownerReservations.filterSource')" :options="sourceFilterOptions" />
    </div>

    <div v-if="loading" class="owner-reservations-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="reservations.length === 0"
      :message="t('ownerReservations.empty')"
    />

    <ul v-else class="owner-reservations-view-list">
      <li v-for="r in reservations" :key="r.id" class="owner-reservations-view-card">
        <div class="owner-reservations-view-card-info">
          <p class="owner-reservations-view-card-guest">
            {{ r.guestName ?? 'Cliente registrado' }}
          </p>
          <p class="owner-reservations-view-card-meta">
            {{ r.date }} · {{ r.timeSlot }} · {{ r.partySize }} personas · {{ r.confirmationCode }}
          </p>
        </div>
        <div class="owner-reservations-view-card-right">
          <StatusBadge :status="r.status" scope="ownerReservations" />
          <div class="owner-reservations-view-card-actions">
            <button
              v-if="r.status === 'CONFIRMED'"
              type="button"
              class="owner-reservations-view-action-btn owner-reservations-view-action-btn--success"
              @click="confirmComplete(r.id)"
            >
              {{ t('ownerReservations.actions.complete') }}
            </button>
            <button
              v-if="r.status === 'CONFIRMED'"
              type="button"
              class="owner-reservations-view-action-btn owner-reservations-view-action-btn--warning"
              @click="confirmNoShow(r.id)"
            >
              {{ t('ownerReservations.actions.noShow') }}
            </button>
            <button
              v-if="r.status === 'CONFIRMED'"
              type="button"
              class="owner-reservations-view-action-btn owner-reservations-view-action-btn--danger"
              @click="openCancel(r.id)"
            >
              {{ t('ownerReservations.actions.cancel') }}
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Admin create modal -->
    <Teleport to="body">
      <div v-if="showAdminForm" class="owner-reservations-view-modal-overlay" @click.self="closeAdminForm">
        <div class="owner-reservations-view-modal">
          <h3 class="owner-reservations-view-modal-title">{{ t('ownerReservations.adminForm.title') }}</h3>
          <form class="owner-reservations-view-form" @submit.prevent="createAdminReservation">
            <BaseInput v-model.number="adminForm.partySize" :label="t('ownerReservations.adminForm.partySize')" type="number" required />
            <BaseInput v-model="adminForm.date" :label="t('ownerReservations.adminForm.date')" type="date" required />
            <BaseSelect v-model="adminForm.source" :label="t('ownerReservations.adminForm.source')" :options="adminSourceOptions" />
            <BaseInput v-model="adminForm.guestName" :label="t('ownerReservations.adminForm.guestName')" />
            <BaseInput v-model="adminForm.guestPhone" :label="t('ownerReservations.adminForm.guestPhone')" />
            <BaseInput v-model="adminForm.notes" :label="t('ownerReservations.adminForm.notes')" />
            <BaseButton type="button" variant="ghost" @click="checkSlots" :loading="loadingSlots">
              {{ t('ownerReservations.adminForm.checkSlots') }}
            </BaseButton>
            <div v-if="availableSlots.length > 0" class="owner-reservations-view-slots">
              <p class="owner-reservations-view-slots-label">{{ t('restaurantPublic.book.availableSlots') }}</p>
              <div class="owner-reservations-view-slots-grid">
                <button
                  v-for="slot in availableSlots"
                  :key="slot.timeSlot"
                  type="button"
                  class="owner-reservations-view-slot-btn"
                  :class="{ 'owner-reservations-view-slot-btn--selected': adminForm.timeSlot === slot.timeSlot }"
                  @click="adminForm.timeSlot = slot.timeSlot"
                >
                  {{ slot.timeSlot }}
                </button>
              </div>
            </div>
            <div class="owner-reservations-view-modal-actions">
              <BaseButton type="button" variant="ghost" @click="closeAdminForm">{{ t('common.cancel') }}</BaseButton>
              <BaseButton type="submit" variant="primary" :disabled="!adminForm.timeSlot">{{ t('common.create') }}</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Cancel modal -->
    <Teleport to="body">
      <div v-if="cancelTarget" class="owner-reservations-view-modal-overlay" @click.self="closeCancel">
        <div class="owner-reservations-view-modal">
          <h3 class="owner-reservations-view-modal-title">{{ t('ownerReservations.cancelConfirm') }}</h3>
          <BaseInput v-model="cancelReason" :label="t('ownerReservations.cancelReason')" />
          <div class="owner-reservations-view-modal-actions">
            <BaseButton variant="ghost" @click="closeCancel">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="danger" @click="confirmCancel">{{ t('common.confirm') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/OwnerReservationsView.css" scoped></style>
