<script setup lang="ts">
import { useMyReservationsView } from './scripts/MyReservationsView'

const {
  t,
  reservations,
  loading,
  statusFilter,
  cancelReason,
  showCancelModal,
  statusFilterOptions,
  openCancel,
  closeCancel,
  confirmCancel,
  StatusBadge,
  BaseSelect,
  BaseInput,
  BaseButton,
  BaseSpinner,
  EmptyState,
  RouterLink,
} = useMyReservationsView()
</script>

<template>
  <div class="my-reservations-view">
    <header class="my-reservations-view-header">
      <h1 class="my-reservations-view-title">{{ t('myReservations.title') }}</h1>
      <p class="my-reservations-view-subtitle">{{ t('myReservations.subtitle') }}</p>
    </header>

    <div class="my-reservations-view-filters">
      <BaseSelect v-model="statusFilter" :label="t('myReservations.filterStatus')" :options="statusFilterOptions" />
    </div>

    <div v-if="loading" class="my-reservations-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="reservations.length === 0"
      :message="t('myReservations.empty')"
      :hint="t('myReservations.emptyHint')"
    />

    <ul v-else class="my-reservations-view-list">
      <li v-for="r in reservations" :key="r.id" class="my-reservations-view-card">
        <div class="my-reservations-view-card-main">
          <p class="my-reservations-view-card-restaurant">{{ r.restaurantName }}</p>
          <p class="my-reservations-view-card-meta">
            {{ r.date }} · {{ r.timeSlot }} · {{ r.partySize }} personas
          </p>
          <p class="my-reservations-view-card-code">{{ r.confirmationCode }}</p>
        </div>
        <div class="my-reservations-view-card-right">
          <StatusBadge :status="r.status" scope="myReservations" />
          <div class="my-reservations-view-card-actions">
            <RouterLink
              :to="`/me/reservations/${r.id}`"
              class="my-reservations-view-link-btn"
            >
              {{ t('myReservations.actions.view') }}
            </RouterLink>
            <button
              v-if="r.status === 'CONFIRMED'"
              type="button"
              class="my-reservations-view-danger-btn"
              @click="openCancel(r.id)"
            >
              {{ t('myReservations.actions.cancel') }}
            </button>
          </div>
        </div>
      </li>
    </ul>

    <!-- Cancel modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="my-reservations-view-modal-overlay" @click.self="closeCancel">
        <div class="my-reservations-view-modal">
          <h3 class="my-reservations-view-modal-title">{{ t('myReservations.cancelConfirm') }}</h3>
          <BaseInput
            v-model="cancelReason"
            :label="t('myReservations.cancelReason')"
          />
          <div class="my-reservations-view-modal-actions">
            <BaseButton variant="ghost" @click="closeCancel">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="danger" @click="confirmCancel">{{ t('myReservations.actions.cancel') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/MyReservationsView.css" scoped></style>
