<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Restaurant } from '@/types'

const props = defineProps<{
  restaurant: Restaurant
}>()

const router = useRouter()

function navigate() {
  void router.push(`/restaurants/${props.restaurant.id}`)
}

function getNeighbourhood(): string {
  return props.restaurant.neighbourhood?.name ?? props.restaurant.city.name ?? ''
}

function getCuisineAndPrice(): string {
  const cuisine = props.restaurant.cuisineTypes[0]?.label ?? ''
  const price = props.restaurant.priceRange?.label ?? ''
  return [cuisine, price].filter(Boolean).join(' · ')
}

function getColorBg(): string {
  const colors = ['#1a1208', '#0a0f1a', '#120a08', '#100808', '#080f0a', '#0f0f08']
  const idx = (props.restaurant.id as string).charCodeAt(0) % colors.length
  return colors[idx] ?? '#111'
}
</script>

<template>
  <div class="list-card" @click="navigate">
    <div
      class="list-card-img"
      :style="{ background: restaurant.photoUrl ? `url(${restaurant.photoUrl}) center/cover` : getColorBg() }"
    >
      <div class="list-card-img-stripe" />
      <div class="list-card-img-overlay" />
      <div class="list-card-img-bottom">
        <span class="list-card-img-location">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" style="color:#555"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {{ getNeighbourhood() }}
        </span>
      </div>
    </div>
    <div class="list-card-body">
      <div class="list-card-row">
        <div class="list-card-name">{{ restaurant.name }}</div>
        <div class="list-card-rating"><span style="color:#f97316">★</span> 4.8</div>
      </div>
      <div class="list-card-meta">{{ getCuisineAndPrice() }}</div>
      <div class="list-card-desc">{{ restaurant.description }}</div>
    </div>
  </div>
</template>

<style src="./styles/ListCard.css" scoped></style>
