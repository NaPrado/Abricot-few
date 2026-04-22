<script setup lang="ts">
import { useNotificationPreferencesView } from './scripts/NotificationPreferencesView'

const {
  t,
  prefs,
  loading,
  savingId,
  togglePref,
  EmptyState,
  BaseSpinner,
} = useNotificationPreferencesView()
</script>

<template>
  <div class="notifications-view">
    <header class="notifications-view-header">
      <h1 class="notifications-view-title">{{ t('notifications.title') }}</h1>
      <p class="notifications-view-subtitle">{{ t('notifications.subtitle') }}</p>
    </header>

    <div v-if="loading" class="notifications-view-loading">
      <BaseSpinner />
    </div>

    <EmptyState
      v-else-if="prefs.length === 0"
      :message="t('notifications.empty')"
      :hint="t('notifications.emptyHint')"
    />

    <ul v-else class="notifications-view-list">
      <li v-for="pref in prefs" :key="pref.restaurantId" class="notifications-view-card">
        <h3 class="notifications-view-card-name">{{ pref.restaurantName }}</h3>
        <div class="notifications-view-toggles">
          <label class="notifications-view-toggle-row">
            <span class="notifications-view-toggle-label">{{ t('notifications.receivePromotions') }}</span>
            <input
              type="checkbox"
              class="notifications-view-checkbox"
              :checked="pref.receivePromotions"
              :disabled="savingId === pref.restaurantId"
              @change="togglePref(pref, 'receivePromotions')"
            />
          </label>
          <label class="notifications-view-toggle-row">
            <span class="notifications-view-toggle-label">{{ t('notifications.receiveOrderUpdates') }}</span>
            <input
              type="checkbox"
              class="notifications-view-checkbox"
              :checked="pref.receiveOrderUpdates"
              :disabled="savingId === pref.restaurantId"
              @change="togglePref(pref, 'receiveOrderUpdates')"
            />
          </label>
          <label class="notifications-view-toggle-row">
            <span class="notifications-view-toggle-label">{{ t('notifications.receiveReservationReminders') }}</span>
            <input
              type="checkbox"
              class="notifications-view-checkbox"
              :checked="pref.receiveReservationReminders"
              :disabled="savingId === pref.restaurantId"
              @change="togglePref(pref, 'receiveReservationReminders')"
            />
          </label>
        </div>
        <p v-if="savingId === pref.restaurantId" class="notifications-view-saving">
          {{ t('notifications.saving') }}
        </p>
      </li>
    </ul>
  </div>
</template>

<style src="./styles/NotificationPreferencesView.css" scoped></style>
