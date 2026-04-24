<script setup lang="ts">
import { useMyReservationsView } from './scripts/MyReservationsView'

const {
  reservations,
  loading,
  selected,
  statusLabel,
  formatDate,
  formatTime,
  colorBg,
  cancelReservation,
  navigateToRestaurant,
} = useMyReservationsView()
</script>

<template>
  <div class="my-reservations">
    <h1 class="my-reservations-title">Mis reservas</h1>
    <p class="my-reservations-sub">Historial y estado de tus reservas.</p>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <div v-else-if="reservations.length === 0" class="my-reservations-empty">
      No tenés reservas todavía.
    </div>
    <template v-else>
      <div
        v-for="r in reservations"
        :key="r.id"
        class="reservation-card"
        @click="selected = r"
      >
        <div
          class="reservation-card-img"
          :style="{ background: colorBg(r.restaurantId as string) }"
        />
        <div>
          <div class="reservation-card-name">{{ r.restaurantName }}</div>
          <div class="reservation-card-meta">
            {{ formatDate(r.date) }} · {{ formatTime(r.timeSlot) }} · {{ r.partySize }} personas
          </div>
        </div>
        <span :class="['reservation-card-status', `reservation-card-status--${r.status}`]">
          {{ statusLabel(r.status) }}
        </span>
      </div>
    </template>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="selected" class="reservation-modal-backdrop" @click.self="selected = null">
        <div class="reservation-modal">
          <!-- Hero -->
          <div
            class="reservation-modal-hero"
            :style="{ background: colorBg(selected.restaurantId as string) }"
          >
            <div class="reservation-modal-stripe" />
            <div class="reservation-modal-gradient" />
          </div>

          <div class="reservation-modal-body">
            <div class="reservation-modal-restaurant">{{ selected.restaurantName }}</div>

            <div class="reservation-modal-grid">
              <div>
                <div class="reservation-modal-field-label">Fecha</div>
                <div class="reservation-modal-field-val">{{ formatDate(selected.date) }}</div>
              </div>
              <div>
                <div class="reservation-modal-field-label">Hora</div>
                <div class="reservation-modal-field-val">{{ formatTime(selected.timeSlot) }}</div>
              </div>
              <div>
                <div class="reservation-modal-field-label">Personas</div>
                <div class="reservation-modal-field-val">{{ selected.partySize }}</div>
              </div>
              <div>
                <div class="reservation-modal-field-label">Estado</div>
                <div class="reservation-modal-field-val">{{ statusLabel(selected.status) }}</div>
              </div>
            </div>

            <div>
              <div class="reservation-modal-field-label">Código de confirmación</div>
              <div class="reservation-modal-code">{{ selected.confirmationCode }}</div>
            </div>
          </div>

          <div class="reservation-modal-actions">
            <button
              class="reservation-modal-btn reservation-modal-btn--cancel"
              @click="navigateToRestaurant(selected!.restaurantId as string)"
            >
              Ver restaurante
            </button>
            <button
              v-if="selected.status === 'CONFIRMED'"
              class="reservation-modal-btn reservation-modal-btn--danger"
              @click="cancelReservation(selected!.id as string)"
            >
              Cancelar reserva
            </button>
            <button
              class="reservation-modal-btn reservation-modal-btn--cancel"
              @click="selected = null"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style src="./styles/MyReservationsView.css" scoped></style>
