<script setup lang="ts">
import { useReservationDetailView } from './scripts/ReservationDetailView'

const {
  t,
  reservation,
  loading,
  showCancelModal,
  cancelReason,
  openCancel,
  closeCancel,
  confirmCancel,
  StatusBadge,
  BaseInput,
  BaseButton,
  BaseSpinner,
  RouterLink,
} = useReservationDetailView()
</script>

<template>
  <div class="reservation-detail-view">
    <RouterLink to="/me/reservations" class="reservation-detail-view-back">
      {{ t('reservationDetail.back') }}
    </RouterLink>

    <div v-if="loading" class="reservation-detail-view-loading">
      <BaseSpinner />
    </div>

    <p v-else-if="!reservation" class="reservation-detail-view-not-found">
      {{ t('reservationDetail.notFound') }}
    </p>

    <div v-else class="reservation-detail-view-content">
      <header class="reservation-detail-view-header">
        <h1 class="reservation-detail-view-title">{{ t('reservationDetail.title') }}</h1>
        <StatusBadge :status="reservation.status" scope="myReservations" />
      </header>

      <div class="reservation-detail-view-card">
        <dl class="reservation-detail-view-details">
          <div class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.restaurant') }}</dt>
            <dd>{{ reservation.restaurantName }}</dd>
          </div>
          <div class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.date') }}</dt>
            <dd>{{ reservation.date }}</dd>
          </div>
          <div class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.time') }}</dt>
            <dd>{{ reservation.timeSlot }}</dd>
          </div>
          <div class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.partySize') }}</dt>
            <dd>{{ reservation.partySize }}</dd>
          </div>
          <div class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.code') }}</dt>
            <dd class="reservation-detail-view-code">{{ reservation.confirmationCode }}</dd>
          </div>
          <div v-if="reservation.notes" class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.notes') }}</dt>
            <dd>{{ reservation.notes }}</dd>
          </div>
          <div v-if="reservation.tables?.length" class="reservation-detail-view-detail-row">
            <dt>{{ t('reservationDetail.tables') }}</dt>
            <dd>{{ reservation.tables.map((tb) => `Mesa ${tb.tableNumber}`).join(', ') }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="reservation.status === 'CONFIRMED'" class="reservation-detail-view-cancel-section">
        <BaseButton variant="danger" @click="openCancel">
          {{ t('reservationDetail.cancel') }}
        </BaseButton>
      </div>
    </div>

    <!-- Cancel modal -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="reservation-detail-view-modal-overlay" @click.self="closeCancel">
        <div class="reservation-detail-view-modal">
          <h3 class="reservation-detail-view-modal-title">{{ t('reservationDetail.cancel') }}</h3>
          <BaseInput
            v-model="cancelReason"
            :label="t('reservationDetail.cancelReason')"
          />
          <div class="reservation-detail-view-modal-actions">
            <BaseButton variant="ghost" @click="closeCancel">{{ t('common.cancel') }}</BaseButton>
            <BaseButton variant="danger" @click="confirmCancel">{{ t('common.confirm') }}</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/ReservationDetailView.css" scoped></style>
