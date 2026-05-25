<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { restaurantRatingLabel } from '@/utils/restaurantRatingLabel'
import { useRestaurantPublicView } from './scripts/RestaurantPublicView'

const authStore = useAuthStore()

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
  subscriptionRefreshLoading,
  snsSubscriptionStatus,
  canReserveWithEmail,
  cart,
  orderLoading,
  orderSuccess,
  orderError,
  orderNotes,
  cartTotal,
  colorBg,
  availableSlots,
  tabs,
  loadSlots,
  confirmReservation,
  refreshEmailSubscription,
  adjustParty,
  addToCart,
  removeFromCart,
  incrementInCart,
  cartQty,
  formatMoney,
  placeOrder,
  goToOrderTracking,
  reviewLoading,
  reviewError,
  lastSavedReviewScore,
  starScores,
  submitMyReview,
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
                <span style="color:#f97316">★</span> {{ restaurantRatingLabel(restaurant) }}
              </span>
              <span v-if="restaurant.cuisineTypes?.[0]">{{ restaurant.cuisineTypes[0]?.label }}</span>
              <span v-if="restaurant.priceRange">{{ restaurant.priceRange.label }}</span>
              <span>{{ restaurant.address }}</span>
            </div>
          </div>

          <p class="restaurant-desc">{{ restaurant.description }}</p>

          <div v-if="authStore.isAuthenticated" class="restaurant-review-panel">
            <div class="restaurant-review-panel-title">Valorar este restaurante</div>
            <p class="restaurant-review-panel-hint">Elegí de 1 a 5 estrellas. Podés cambiar tu nota cuando quieras.</p>
            <div class="restaurant-review-stars">
              <button
                v-for="s in starScores"
                :key="s"
                type="button"
                class="restaurant-review-star-btn"
                :disabled="reviewLoading"
                :class="{ 'restaurant-review-star-btn--active': lastSavedReviewScore === s }"
                :aria-label="`Puntuación ${s} de 5`"
                @click="submitMyReview(s)"
              >
                {{ s }}★
              </button>
            </div>
            <p v-if="reviewError" class="restaurant-review-error">{{ reviewError }}</p>
            <p v-else-if="reviewLoading" class="restaurant-review-loading">Guardando…</p>
          </div>

          <!-- Top tabs: Menú | Reservar | Para llevar -->
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

          <!-- Food menu: shown for Menú and Para llevar tabs -->
          <div v-if="activeTab === 'Menú' || activeTab === 'Para llevar'">
            <div v-if="!menu" style="color:var(--text-muted);font-size:0.875rem">Sin carta disponible.</div>
            <div v-else>
              <div
                v-for="category in (menu.categories ?? [])"
                :key="category.id"
                class="restaurant-menu-category"
              >
                <div class="restaurant-menu-cat-name">{{ category.name }}</div>
                <div
                  v-for="item in (category.items ?? [])"
                  :key="item.id"
                  class="restaurant-menu-item"
                  :class="{ 'restaurant-menu-item--unavailable': item.isAvailable === false }"
                >
                  <div class="restaurant-menu-item-info">
                    <div class="restaurant-menu-item-name">{{ item.name }}</div>
                    <div class="restaurant-menu-item-desc">{{ item.description }}</div>
                    <div v-if="item.isAvailable === false" class="restaurant-menu-item-unavail">No disponible</div>
                  </div>
                  <div class="restaurant-menu-item-right">
                    <div class="restaurant-menu-item-price">
                      ${{ Math.round(Number(item.price)).toLocaleString('es-AR') }}
                    </div>
                    <!-- Add-to-cart controls (Para llevar mode only) -->
                    <div v-if="activeTab === 'Para llevar' && item.isAvailable !== false" class="restaurant-menu-item-controls">
                      <button
                        class="restaurant-menu-qty-btn"
                        :disabled="cartQty(item.id as string) === 0"
                        @click="removeFromCart(item.id as string)"
                      >−</button>
                      <span class="restaurant-menu-qty-val">{{ cartQty(item.id as string) }}</span>
                      <button class="restaurant-menu-qty-btn" @click="addToCart(item)">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Booking panel (right column, always visible) -->
        <div class="restaurant-booking-panel">

          <!-- Menú tab → guide the user to act -->
          <template v-if="activeTab === 'Menú'">
            <div class="restaurant-panel-cta-title">¿Qué querés hacer?</div>
            <div class="restaurant-panel-cta-sub">Reservá una mesa o pedí para llevar.</div>
            <button
              class="restaurant-confirm-btn"
              style="margin-bottom:0.625rem"
              @click="activeTab = 'Reservar'"
            >
              Reservar una mesa
            </button>
            <button
              class="restaurant-confirm-btn restaurant-confirm-btn--outline"
              @click="activeTab = 'Para llevar'"
            >
              Pedir para llevar
            </button>
          </template>

          <!-- Reservar tab → reservation form -->
          <template v-else-if="activeTab === 'Reservar'">
            <template v-if="!authStore.isAuthenticated">
              <div class="restaurant-cart-empty">
                <div style="margin-bottom:0.75rem">Iniciá sesión para reservar una mesa.</div>
                <router-link to="/login" class="restaurant-confirm-btn restaurant-confirm-btn--link">
                  Iniciar sesión
                </router-link>
              </div>
            </template>
            <template v-if="bookingSuccess">
              <div class="restaurant-panel-success">
                <div class="restaurant-panel-success-icon">✓</div>
                <div class="restaurant-panel-success-title">¡Reserva confirmada!</div>
                <div class="restaurant-panel-success-sub">
                  Te llegará una confirmación por email.
                </div>
              </div>
            </template>
            <template v-else-if="authStore.isAuthenticated && !canReserveWithEmail">
              <div class="restaurant-cart-empty">
                <div style="margin-bottom:0.75rem">
                  Confirmá la suscripción de email de AWS SNS antes de reservar.
                </div>
                <div style="margin-bottom:0.75rem;color:var(--text-muted);font-size:0.875rem">
                  Estado actual: {{ snsSubscriptionStatus || 'PENDING_CONFIRMATION' }}.
                </div>
                <button
                  class="restaurant-confirm-btn"
                  :disabled="subscriptionRefreshLoading"
                  @click="refreshEmailSubscription"
                >
                  {{ subscriptionRefreshLoading ? 'Verificando…' : 'Ya confirmé, verificar' }}
                </button>
              </div>
              <p v-if="bookingError" class="restaurant-panel-error">{{ bookingError }}</p>
            </template>
            <template v-else-if="authStore.isAuthenticated">
              <div class="restaurant-panel-field">
                <div class="restaurant-panel-label">Fecha</div>
                <input
                  v-model="bookingDate"
                  class="restaurant-panel-input"
                  type="date"
                  @change="loadSlots"
                />
              </div>
              <div class="restaurant-panel-field">
                <div class="restaurant-panel-label">Personas</div>
                <div class="restaurant-party-row">
                  <button class="restaurant-party-btn" type="button" @click="adjustParty(-1)">−</button>
                  <span class="restaurant-party-val">{{ partySize }}</span>
                  <button class="restaurant-party-btn" type="button" @click="adjustParty(1)">+</button>
                </div>
              </div>
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
                :disabled="!selectedSlot || bookingLoading || !canReserveWithEmail"
                @click="confirmReservation"
              >
                {{ bookingLoading ? 'Confirmando…' : 'Confirmar reserva' }}
              </button>
            </template>
          </template>

          <!-- Para llevar tab → cart -->
          <template v-else>
            <!-- Not authenticated: prompt login -->
            <template v-if="!authStore.isAuthenticated">
              <div class="restaurant-cart-empty">
                <div style="margin-bottom:0.75rem">Iniciá sesión para hacer un pedido para llevar.</div>
                <router-link to="/login" class="restaurant-confirm-btn restaurant-confirm-btn--link">
                  Iniciar sesión
                </router-link>
              </div>
            </template>

            <template v-else-if="orderSuccess">
              <div class="restaurant-panel-success">
                <div class="restaurant-panel-success-icon">✓</div>
                <div class="restaurant-panel-success-title">¡Pedido confirmado!</div>
                <div class="restaurant-panel-success-sub">
                  Podés seguir el estado en tiempo real.
                </div>
                <button class="restaurant-confirm-btn" style="margin-top:1.25rem" @click="goToOrderTracking">
                  Seguir mi pedido
                </button>
              </div>
            </template>

            <template v-else>
              <div v-if="cart.length === 0" class="restaurant-cart-empty">
                Seleccioná ítems del menú para armar tu pedido.
              </div>
              <div v-else>
                <div class="restaurant-panel-label" style="margin-bottom:0.75rem">Tu pedido</div>
                <div
                  v-for="entry in cart"
                  :key="entry.id"
                  class="restaurant-cart-item"
                >
                  <span class="restaurant-cart-item-name">{{ entry.name }}</span>
                  <div class="restaurant-cart-item-controls">
                    <button class="restaurant-menu-qty-btn" @click="removeFromCart(entry.id)">−</button>
                    <span class="restaurant-cart-qty-val">{{ entry.qty }}</span>
                    <button class="restaurant-menu-qty-btn" @click="incrementInCart(entry.id)">+</button>
                  </div>
                  <span class="restaurant-cart-item-price">{{ formatMoney(entry.price * entry.qty) }}</span>
                </div>
                <div class="restaurant-cart-total">
                  <span>Total</span>
                  <span>{{ formatMoney(cartTotal) }}</span>
                </div>

                <!-- Order notes -->
                <div class="restaurant-panel-field" style="margin-top:0.25rem">
                  <div class="restaurant-panel-label">Notas del pedido</div>
                  <textarea
                    v-model="orderNotes"
                    class="restaurant-panel-input restaurant-panel-textarea"
                    placeholder="Ej: sin cebolla, alergia al maní…"
                    maxlength="1000"
                    rows="2"
                  />
                </div>
              </div>
              <p v-if="orderError" class="restaurant-panel-error">{{ orderError }}</p>
              <button
                class="restaurant-confirm-btn"
                :disabled="cart.length === 0 || orderLoading"
                @click="placeOrder"
              >
                {{ orderLoading ? 'Enviando…' : 'Confirmar pedido' }}
              </button>
            </template>
          </template>

        </div>
      </div>
    </template>
  </div>
</template>

<style src="./styles/RestaurantPublicView.css" scoped></style>
