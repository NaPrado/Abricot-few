<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Restaurant } from '@/types'
import { restaurantRatingLabel } from '@/utils/restaurantRatingLabel'

const props = defineProps<{
  restaurant: Restaurant
  small?: boolean
}>()

const router = useRouter()

function navigate() {
  void router.push(`/restaurants/${props.restaurant.id}`)
}

function getNeighbourhood(): string {
  return props.restaurant.neighbourhood?.name ?? props.restaurant.city.name ?? ''
}

function getCuisine(): string {
  return props.restaurant.cuisineTypes[0]?.label ?? ''
}

function getColorBg(): string {
  const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
  const idx = (props.restaurant.id as string).charCodeAt(0) % colors.length
  return colors[idx] ?? '#111'
}
</script>

<template>
  <div :class="['premium-card']" @click="navigate">
    <div
      :class="['premium-card-img', small && 'premium-card-img--small']"
      :style="{ background: restaurant.photoUrl ? `url(${restaurant.photoUrl}) center/cover` : getColorBg() }"
    >
      <div class="premium-card-stripe" />
      <div class="premium-card-overlay" />

      <div class="premium-card-overlay-top">
        <span class="premium-card-rating">
          <span style="color: #f97316;">★</span> {{ restaurantRatingLabel(restaurant) }}
        </span>
      </div>

      <div class="premium-card-overlay-bottom">
        <div class="premium-card-location">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style="color:#666"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {{ getNeighbourhood() }}
        </div>
        <div class="premium-card-name">{{ restaurant.name }}</div>
        <div class="premium-card-cuisine">{{ getCuisine() }}</div>
      </div>

      <button class="premium-card-arrow" @click.stop="navigate">↗</button>
    </div>
  </div>
</template>

<style src="./styles/PremiumCard.css" scoped></style>
