<script setup lang="ts">
import { useRestaurantSwitcher } from './scripts/RestaurantSwitcher'

const {
  ChevronDown,
  Check,
  Store,
  ctx,
  open,
  loading,
  restaurants,
  error,
  active,
  choose,
  load,
} = useRestaurantSwitcher()

defineExpose({ reload: load })
</script>

<template>
  <div class="restaurant-switcher">
    <button
      type="button"
      class="restaurant-switcher-button"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="restaurant-switcher-icon"><Store :size="14" /></span>
      <span class="restaurant-switcher-label">
        <span class="restaurant-switcher-label-caption">Restaurante activo</span>
        <span class="restaurant-switcher-label-name">
          {{ active?.name ?? (loading ? 'Cargando…' : 'Seleccionar restaurante') }}
        </span>
      </span>
      <ChevronDown :size="14" class="restaurant-switcher-chevron" />
    </button>

    <Transition name="restaurant-switcher">
      <div v-if="open" class="restaurant-switcher-menu" role="listbox">
        <div v-if="loading" class="restaurant-switcher-empty">Cargando…</div>
        <div v-else-if="error" class="restaurant-switcher-empty">{{ error }}</div>
        <div v-else-if="restaurants.length === 0" class="restaurant-switcher-empty">
          Aún no tenés restaurantes creados.
        </div>
        <button
          v-for="r in restaurants"
          :key="r.id"
          type="button"
          class="restaurant-switcher-option"
          :class="{ 'restaurant-switcher-option--active': r.id === ctx.activeRestaurantId }"
          role="option"
          :aria-selected="r.id === ctx.activeRestaurantId"
          @click="choose(r.id)"
        >
          <span class="restaurant-switcher-option-name">{{ r.name }}</span>
          <span class="restaurant-switcher-option-city">{{ r.city.name }}</span>
          <Check v-if="r.id === ctx.activeRestaurantId" :size="14" class="restaurant-switcher-option-check" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<style src="./styles/RestaurantSwitcher.css" scoped></style>
