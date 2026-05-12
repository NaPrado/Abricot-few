<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Restaurant } from '@/types'
import { restaurantRatingLabel } from '@/utils/restaurantRatingLabel'

const props = defineProps<{
  restaurant: Restaurant
  index?: number
}>()

const router = useRouter()

function navigate() {
  if (!props.restaurant.id) return
  void router.push(`/restaurants/${props.restaurant.id}`)
}

function getColorBg(): string {
  const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
  const id = String(props.restaurant.id ?? 'restaurant')
  const idx = id.charCodeAt(0) % colors.length
  return colors[idx] ?? '#111'
}

function getCuisineAndAddress(): string {
  const cuisine = props.restaurant.cuisineTypes?.[0]?.label ?? ''
  return [cuisine, props.restaurant.address].filter(Boolean).join(' · ')
}
</script>

<template>
  <div
    class="explore-card"
    :style="{ animationDelay: `${(index ?? 0) * 55}ms` }"
    @click="navigate"
  >
    <div
      class="explore-card-img"
      :style="{ background: restaurant.photoUrl ? `url(${restaurant.photoUrl}) center/cover` : getColorBg() }"
    >
      <div class="explore-card-img-overlay" />
      <span v-if="restaurant.priceRange" class="explore-card-price-pill">{{ restaurant.priceRange.label }}</span>
    </div>
    <div class="explore-card-body">
      <div class="explore-card-top-row">
        <div class="explore-card-name">{{ restaurant.name }}</div>
        <div class="explore-card-rating"><span style="color:#f97316">★</span> {{ restaurantRatingLabel(restaurant) }}</div>
      </div>
      <div class="explore-card-meta">{{ getCuisineAndAddress() }}</div>
      <div class="explore-card-desc">{{ restaurant.description }}</div>
      <div class="explore-card-tags">
        <span
          v-for="ct in (restaurant.cuisineTypes ?? []).slice(0, 3)"
          :key="ct.id"
          class="explore-card-chip"
        >{{ ct.label }}</span>
      </div>
    </div>
  </div>
</template>

<style src="./styles/ExploreCard.css" scoped></style>
