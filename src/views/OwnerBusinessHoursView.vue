<script setup lang="ts">
import { useOwnerBusinessHoursView } from './scripts/OwnerBusinessHoursView'

const {
  t,
  hours,
  loading,
  saving,
  dayLabels,
  save,
  BaseButton,
  BaseSpinner,
} = useOwnerBusinessHoursView()
</script>

<template>
  <div class="owner-hours-view">
    <header class="owner-hours-view-header">
      <h1 class="owner-hours-view-title">{{ t('ownerHours.title') }}</h1>
      <p class="owner-hours-view-subtitle">{{ t('ownerHours.subtitle') }}</p>
    </header>

    <div v-if="loading" class="owner-hours-view-loading">
      <BaseSpinner />
    </div>

    <form v-else class="owner-hours-view-form" @submit.prevent="save">
      <ul class="owner-hours-view-days">
        <li v-for="(hour, idx) in hours" :key="idx" class="owner-hours-view-day-row">
          <span class="owner-hours-view-day-name">{{ dayLabels[idx] }}</span>

          <label class="owner-hours-view-closed-toggle">
            <input type="checkbox" :checked="hour.isClosed" @change="hour.isClosed = !hour.isClosed" />
            {{ t('ownerHours.closed') }}
          </label>

          <template v-if="!hour.isClosed">
            <label class="owner-hours-view-time-field">
              <span>{{ t('ownerHours.opens') }}</span>
              <input
                type="time"
                class="owner-hours-view-time-input"
                :value="hour.opensAt ?? ''"
                @change="hour.opensAt = ($event.target as HTMLInputElement).value || null"
              />
            </label>
            <label class="owner-hours-view-time-field">
              <span>{{ t('ownerHours.closes') }}</span>
              <input
                type="time"
                class="owner-hours-view-time-input"
                :value="hour.closesAt ?? ''"
                @change="hour.closesAt = ($event.target as HTMLInputElement).value || null"
              />
            </label>
          </template>
        </li>
      </ul>

      <div class="owner-hours-view-submit">
        <BaseButton type="submit" variant="primary" :loading="saving">
          {{ saving ? t('ownerHours.saving') : t('ownerHours.save') }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<style src="./styles/OwnerBusinessHoursView.css" scoped></style>
