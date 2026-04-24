<script setup lang="ts">
import { useRestaurantPublicView } from './scripts/RestaurantPublicView'

const {
  restaurant,
  menu,
  loading,
  activeTab,
  bookingDate,
  partySize,
  selectedSlot,
  bookingLoading,
  bookingSuccess,
  bookingError,
  colorBg,
  availableSlots,
  tabs,
  loadSlots,
  confirmReservation,
  adjustParty,
} = useRestaurantPublicView()
</script>

<template>
  <div class="restaurant-view">
    <div v-if="loading" class="restaurant-loading">Cargando…</div>
    <template v-else-if="restaurant">
      <!-- Gallery -->
      <div class="restaurant-gallery">
        <div
          class="restaurant-gallery-main"
          :style="{
            background: restaurant.photoUrl
              ? `url(${restaurant.photoUrl}) center/cover`
              : colorBg,
          }"
        />
        <div class="restaurant-gallery-stack">
          <div class="restaurant-gallery-thumb" :style="{ background: '#0a0a0a' }" />
          <div class="restaurant-gallery-thumb" :style="{ background: '#060606' }" />
        </div>
      </div>

      <!-- Body -->
      <div class="restaurant-body">
        <!-- Info column -->
        <div>
          <div class="restaurant-info-header">
            <h1 class="restaurant-name">{{ restaurant.name }}</h1>
            <div class="restaurant-meta-row">
              <span class="restaurant-rating">
                <span style="color:#f97316">★</span> 4.8
              </span>
              <span v-if="restaurant.cuisineTypes[0]">{{ restaurant.cuisineTypes[0].label }}</span>
              <span v-if="restaurant.priceRange">{{ restaurant.priceRange.label }}</span>
              <span>{{ restaurant.address }}</span>
            </div>
          </div>

          <p class="restaurant-desc">{{ restaurant.description }}</p>

          <!-- Tabs -->
          <div class="restaurant-tabs">
            <button
              v-for="tab in tabs"
              :key="tab"
              :class="['restaurant-tab', tab === activeTab && 'restaurant-tab--active']"
              @click="activeTab = tab"
            >
              {{ tab }}
            </button>
          </div>

          <!-- Menu tab -->
          <div v-if="activeTab === 'Menú'">
            <div v-if="!menu" style="color:#2a2a2a;font-size:0.875rem">Sin carta disponible.</div>
            <div v-else>
              <div
                v-for="category in menu.categories"
                :key="category.id"
                class="restaurant-menu-category"
              >
                <div class="restaurant-menu-cat-name">{{ category.name }}</div>
                <div
                  v-for="item in category.items"
                  :key="item.id"
                  class="restaurant-menu-item"
                >
                  <div>
                    <div class="restaurant-menu-item-name">{{ item.name }}</div>
                    <div class="restaurant-menu-item-desc">{{ item.description }}</div>
                  </div>
                  <div class="restaurant-menu-item-price">
                    ${{ Math.round(Number(item.price)).toLocaleString('es-AR') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking panel -->
        <div class="restaurant-booking-panel">
          <!-- Tab switcher -->
          <div class="restaurant-panel-tabs">
            <button
              :class="['restaurant-panel-tab', activeTab === 'Reservar' && 'restaurant-panel-tab--active']"
              @click="activeTab = 'Reservar'"
            >
              Reservar
            </button>
            <button
              :class="['restaurant-panel-tab', activeTab === 'Para llevar' && 'restaurant-panel-tab--active']"
              @click="activeTab = 'Para llevar'"
            >
              Para llevar
            </button>
          </div>

          <template v-if="activeTab !== 'Menú'">
            <template v-if="bookingSuccess">
              <div class="restaurant-panel-success">
                <div class="restaurant-panel-success-icon">✓</div>
                <div class="restaurant-panel-success-title">¡Reserva confirmada!</div>
                <div class="restaurant-panel-success-sub">
                  Te llegará una confirmación por email.
                </div>
              </div>
            </template>

            <template v-else>
              <!-- Date -->
              <div class="restaurant-panel-field">
                <div class="restaurant-panel-label">Fecha</div>
                <input
                  v-model="bookingDate"
                  class="restaurant-panel-input"
                  type="date"
                  @change="loadSlots"
                />
              </div>

              <!-- Party size -->
              <div class="restaurant-panel-field">
                <div class="restaurant-panel-label">Personas</div>
                <div class="restaurant-party-row">
                  <button class="restaurant-party-btn" type="button" @click="adjustParty(-1)">−</button>
                  <span class="restaurant-party-val">{{ partySize }}</span>
                  <button class="restaurant-party-btn" type="button" @click="adjustParty(1)">+</button>
                </div>
              </div>

              <!-- Time slots -->
              <div class="restaurant-panel-field">
                <div class="restaurant-panel-label">Horario</div>
                <div v-if="availableSlots.length === 0" class="restaurant-no-slots">
                  Sin disponibilidad para esta fecha.
                </div>
                <div v-else class="restaurant-slots-grid">
                  <button
                    v-for="slot in availableSlots"
                    :key="slot.timeSlot"
                    :class="['restaurant-slot-btn', slot.timeSlot === selectedSlot && 'restaurant-slot-btn--selected']"
                    @click="selectedSlot = slot.timeSlot"
                  >
                    {{ slot.timeSlot.slice(0, 5) }}
                  </button>
                </div>
              </div>

              <p v-if="bookingError" class="restaurant-panel-error">{{ bookingError }}</p>

              <button
                class="restaurant-confirm-btn"
                :disabled="!selectedSlot || bookingLoading"
                @click="confirmReservation"
              >
                {{ bookingLoading ? 'Confirmando…' : 'Confirmar reserva' }}
              </button>
            </template>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<style src="./styles/RestaurantPublicView.css" scoped></style>
