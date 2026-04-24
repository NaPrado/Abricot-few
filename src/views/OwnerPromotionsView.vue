<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { promotionService } from '@/services'
import type { Promotion } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string

const promotions = ref<Promotion[]>([])
const loading = ref(true)

function discountDisplay(p: Promotion): string {
  if (p.discountType === 'PERCENTAGE') return `${p.discountValue}% dto.`
  return `$${Math.round(Number(p.discountValue)).toLocaleString('es-AR')} dto.`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

async function toggleActive(promo: Promotion) {
  const updated = { ...promo, isActive: !promo.isActive }
  const idx = promotions.value.findIndex(p => p.id === promo.id)
  if (idx !== -1) promotions.value[idx] = updated
  try {
    await promotionService.update(restaurantId, promo.id, {
      title: promo.title,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      startDate: promo.startDate,
      endDate: promo.endDate,
      notifyUsers: promo.notifyUsers,
    })
  } catch {
    if (idx !== -1) promotions.value[idx] = promo
  }
}

onMounted(async () => {
  loading.value = true
  try {
    promotions.value = await promotionService.getByRestaurant(restaurantId)
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="owner-promos-view">
    <h1 class="owner-sub-title">Promociones</h1>
    <p class="owner-sub-desc">Creá y activá descuentos para tus clientes.</p>

    <div v-if="loading" style="color:#2a2a2a;font-size:0.875rem">Cargando…</div>
    <div v-else-if="promotions.length === 0" style="color:#2a2a2a;font-size:0.875rem;padding:2rem 0">
      Sin promociones configuradas.
    </div>
    <div v-else class="promos-list">
      <div v-for="p in promotions" :key="p.id" :class="['promo-card', !p.isActive && 'promo-card--inactive']">
        <div class="promo-card-top">
          <div>
            <div class="promo-card-title">{{ p.title }}</div>
            <div class="promo-card-dates">{{ formatDate(p.startDate) }} — {{ formatDate(p.endDate) }}</div>
          </div>
          <div class="promo-card-discount">{{ discountDisplay(p) }}</div>
        </div>
        <p v-if="p.description" class="promo-card-desc">{{ p.description }}</p>
        <div class="promo-card-footer">
          <span class="promo-card-notify">
            <span style="color:#1a1a1a">Notificar usuarios:</span>
            {{ p.notifyUsers ? 'Sí' : 'No' }}
          </span>
          <label class="owner-toggle">
            <input type="checkbox" :checked="p.isActive" @change="toggleActive(p)" />
            <span class="owner-toggle-track" />
            <span class="owner-toggle-thumb" />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-promos-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: #2a2a2a; margin-bottom: 2rem; }
.promos-list { display: flex; flex-direction: column; gap: 10px; }
.promo-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.25rem; transition: opacity var(--dur-fast); }
.promo-card--inactive { opacity: 0.5; }
.promo-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.promo-card-title { font-size: 1rem; font-weight: 600; color: #bbb; margin-bottom: 2px; }
.promo-card-dates { font-size: 0.75rem; color: #2a2a2a; }
.promo-card-discount { font-size: 1.25rem; font-weight: 800; color: var(--brand); letter-spacing: -0.02em; }
.promo-card-desc { font-size: 0.8125rem; color: #2a2a2a; line-height: 1.6; margin: 0 0 0.875rem; }
.promo-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid #0a0a0a; }
.promo-card-notify { font-size: 0.75rem; color: #2a2a2a; }
.owner-toggle { position: relative; width: 34px; height: 18px; cursor: pointer; }
.owner-toggle input { opacity: 0; width: 0; height: 0; }
.owner-toggle-track { position: absolute; inset: 0; background: #111; border-radius: 99px; transition: background var(--dur-fast); }
.owner-toggle input:checked + .owner-toggle-track { background: var(--brand); }
.owner-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: #333; border-radius: 50%; transition: transform var(--dur-fast), background var(--dur-fast); }
.owner-toggle input:checked ~ .owner-toggle-thumb { transform: translateX(16px); background: #000; }
</style>
