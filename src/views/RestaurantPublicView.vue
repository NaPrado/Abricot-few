<script setup lang="ts">
import { useRestaurantPublicView } from './scripts/RestaurantPublicView'

const {
  BaseButton,
  BaseSpinner,
  EmptyState,
  RouterLink,
  StatusBadge,
  t,
  restaurant,
  loadingRestaurant,
  restaurantError,
  menus,
  activeMenuId,
  menuCategories,
  loadingMenu,
  menuError,
  visiblePromotions,
  loadingPromotions,
  promotionsError,
  sortedBusinessHours,
  loadingBusinessHours,
  businessHoursError,
  visitDate,
  partySize,
  availability,
  availableSlots,
  availabilitySummary,
  loadingAvailability,
  availabilityError,
  formatCurrency,
  formatDate,
  businessHourLabel,
  promotionDiscountLabel,
  loadRestaurant,
  loadMenus,
  loadPromotions,
  loadBusinessHours,
  checkAvailability,
  selectMenu,
} = useRestaurantPublicView()
</script>

<template>
  <div class="restaurant-public-view">
    <RouterLink to="/explore" class="restaurant-public-back">{{ t('restaurantPublic.backExplore') }}</RouterLink>

    <div v-if="loadingRestaurant" class="restaurant-public-state">
      <BaseSpinner :size="28" :label="t('restaurantPublic.loading')" />
    </div>

    <EmptyState
      v-else-if="restaurantError || !restaurant"
      :title="t('restaurantPublic.errorTitle')"
      :description="restaurantError || t('restaurantPublic.errorLoad')"
    >
      <template #action>
        <BaseButton variant="outline" @click="loadRestaurant">{{ t('common.retry') }}</BaseButton>
      </template>
    </EmptyState>

    <template v-else>
      <div class="restaurant-public-layout">
        <section class="restaurant-public-main">
          <article class="restaurant-public-hero">
            <div v-if="restaurant.photoUrl" class="restaurant-public-hero-image">
              <img :src="restaurant.photoUrl" :alt="restaurant.name" />
            </div>
            <div v-else class="restaurant-public-hero-image restaurant-public-hero-image--placeholder">
              {{ restaurant.name.charAt(0).toUpperCase() }}
            </div>
            <div class="restaurant-public-hero-body">
              <h1 class="restaurant-public-title">{{ restaurant.name }}</h1>
              <p class="restaurant-public-meta">
                {{ restaurant.address }} · {{ restaurant.city.name }}
              </p>
              <p class="restaurant-public-description">
                {{ restaurant.description || t('restaurantPublic.noDescription') }}
              </p>
              <div class="restaurant-public-tags">
                <span class="restaurant-public-tag">{{ restaurant.priceRange?.label || t('restaurantPublic.noPriceRange') }}</span>
                <span
                  v-for="cuisine in restaurant.cuisineTypes"
                  :key="cuisine.id"
                  class="restaurant-public-tag"
                >
                  {{ cuisine.label }}
                </span>
              </div>
            </div>
          </article>

          <section class="restaurant-public-section">
            <header class="restaurant-public-section-header">
              <h2>{{ t('restaurantPublic.menuTitle') }}</h2>
              <div v-if="menus.length > 1" class="restaurant-public-menu-switcher">
                <button
                  v-for="menu in menus"
                  :key="menu.id"
                  type="button"
                  :class="[
                    'restaurant-public-menu-tab',
                    { 'restaurant-public-menu-tab--active': menu.id === activeMenuId },
                  ]"
                  @click="selectMenu(menu.id)"
                >
                  {{ menu.name }}
                </button>
              </div>
            </header>

            <div v-if="loadingMenu" class="restaurant-public-state-inline">
              <BaseSpinner :label="t('restaurantPublic.loading')" />
            </div>

            <EmptyState
              v-else-if="menuError"
              :title="t('restaurantPublic.sectionErrorTitle')"
              :description="menuError"
            >
              <template #action>
                <BaseButton variant="outline" @click="loadMenus">{{ t('common.retry') }}</BaseButton>
              </template>
            </EmptyState>

            <EmptyState
              v-else-if="menuCategories.length === 0"
              :title="t('restaurantPublic.emptyMenuTitle')"
              :description="t('restaurantPublic.emptyMenuHint')"
            />

            <div v-else class="restaurant-public-menu-grid">
              <article
                v-for="category in menuCategories"
                :key="category.id"
                class="restaurant-public-menu-category"
              >
                <h3>{{ category.name }}</h3>
                <ul>
                  <li v-for="item in category.items" :key="item.id" class="restaurant-public-menu-item">
                    <div>
                      <div class="restaurant-public-menu-name-row">
                        <h4>{{ item.name }}</h4>
                        <StatusBadge
                          :label="item.isAvailable ? t('restaurantPublic.available') : t('restaurantPublic.unavailable')"
                          :tone="item.isAvailable ? 'success' : 'neutral'"
                        />
                      </div>
                      <p v-if="item.description" class="restaurant-public-menu-description">{{ item.description }}</p>
                    </div>
                    <strong>{{ formatCurrency(item.price) }}</strong>
                  </li>
                </ul>
              </article>
            </div>
          </section>

          <section class="restaurant-public-section">
            <header class="restaurant-public-section-header">
              <h2>{{ t('restaurantPublic.promotionsTitle') }}</h2>
            </header>

            <div v-if="loadingPromotions" class="restaurant-public-state-inline">
              <BaseSpinner :label="t('restaurantPublic.loading')" />
            </div>

            <EmptyState
              v-else-if="promotionsError"
              :title="t('restaurantPublic.sectionErrorTitle')"
              :description="promotionsError"
            >
              <template #action>
                <BaseButton variant="outline" @click="loadPromotions">{{ t('common.retry') }}</BaseButton>
              </template>
            </EmptyState>

            <EmptyState
              v-else-if="visiblePromotions.length === 0"
              :title="t('restaurantPublic.emptyPromotionsTitle')"
              :description="t('restaurantPublic.emptyPromotionsHint')"
            />

            <div v-else class="restaurant-public-promotions-grid">
              <article
                v-for="promotion in visiblePromotions"
                :key="promotion.id"
                class="restaurant-public-promo-card"
              >
                <p class="restaurant-public-promo-value">{{ promotionDiscountLabel(promotion) }}</p>
                <h3>{{ promotion.title }}</h3>
                <p class="restaurant-public-promo-description">
                  {{ promotion.description || t('restaurantPublic.noPromotionDescription') }}
                </p>
                <p class="restaurant-public-promo-dates">
                  {{ t('restaurantPublic.validity') }} {{ formatDate(promotion.startDate) }} - {{ formatDate(promotion.endDate) }}
                </p>
                <StatusBadge
                  :label="promotion.isActive ? t('restaurantPublic.active') : t('restaurantPublic.inactive')"
                  :tone="promotion.isActive ? 'success' : 'neutral'"
                />
              </article>
            </div>
          </section>

          <section class="restaurant-public-section">
            <header class="restaurant-public-section-header">
              <h2>{{ t('restaurantPublic.hoursTitle') }}</h2>
            </header>

            <div v-if="loadingBusinessHours" class="restaurant-public-state-inline">
              <BaseSpinner :label="t('restaurantPublic.loading')" />
            </div>

            <EmptyState
              v-else-if="businessHoursError"
              :title="t('restaurantPublic.sectionErrorTitle')"
              :description="businessHoursError"
            >
              <template #action>
                <BaseButton variant="outline" @click="loadBusinessHours">{{ t('common.retry') }}</BaseButton>
              </template>
            </EmptyState>

            <EmptyState
              v-else-if="sortedBusinessHours.length === 0"
              :title="t('restaurantPublic.emptyHoursTitle')"
              :description="t('restaurantPublic.emptyHoursHint')"
            />

            <ul v-else class="restaurant-public-hours-list">
              <li v-for="hour in sortedBusinessHours" :key="hour.id">
                <span>{{ hour.dayName }}</span>
                <strong>{{ businessHourLabel(hour) }}</strong>
              </li>
            </ul>
          </section>
        </section>

        <aside class="restaurant-public-side">
          <section class="restaurant-public-reserve-card">
            <h2>{{ t('restaurantPublic.availabilityTitle') }}</h2>
            <p>{{ t('restaurantPublic.availabilityHint') }}</p>

            <label class="restaurant-public-form-field">
              <span>{{ t('restaurantPublic.dateLabel') }}</span>
              <input v-model="visitDate" type="date" />
            </label>

            <label class="restaurant-public-form-field">
              <span>{{ t('restaurantPublic.partySizeLabel') }}</span>
              <input v-model.number="partySize" type="number" min="1" step="1" />
            </label>

            <BaseButton variant="primary" @click="checkAvailability">
              {{ t('restaurantPublic.checkAvailability') }}
            </BaseButton>

            <div v-if="loadingAvailability" class="restaurant-public-state-inline">
              <BaseSpinner :label="t('restaurantPublic.loading')" />
            </div>

            <p v-else-if="availabilityError" class="restaurant-public-inline-error">{{ availabilityError }}</p>

            <template v-else-if="availability">
              <p class="restaurant-public-availability-summary">{{ availabilitySummary }}</p>
              <p class="restaurant-public-availability-note">
                {{ availability.allowTableJoining ? t('restaurantPublic.allowJoin') : t('restaurantPublic.noJoin') }}
              </p>
              <ul v-if="availableSlots.length > 0" class="restaurant-public-slot-list">
                <li v-for="slot in availableSlots" :key="slot.timeSlot">
                  <button type="button">{{ slot.timeSlot.slice(0, 5) }}</button>
                </li>
              </ul>
            </template>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>

<style src="./styles/RestaurantPublicView.css" scoped></style>
