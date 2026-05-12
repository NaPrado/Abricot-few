<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables'
import { HttpError } from '@/services/http'
import { orderService } from '@/services'
import type { Order } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string
const toast = useToast()

const orders = ref<Order[]>([])
const loading = ref(true)

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PREPARATION: 'En preparación',
  READY: 'Listo',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
}

const NEXT_STATUS: Record<string, string> = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'IN_PREPARATION',
  IN_PREPARATION: 'READY',
  READY: 'COMPLETED',
}

function statusLabel(s: string): string { return STATUS_LABEL[s] ?? s }
function nextAction(s: string): string { return STATUS_LABEL[NEXT_STATUS[s] ?? ''] ?? '' }
function formatMoney(n: string | number): string { return `$${Math.round(Number(n)).toLocaleString('es-AR')}` }
function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

async function advance(order: Order) {
  const next = NEXT_STATUS[order.status]
  if (!next) return
  try {
    const updated = await orderService.patchInRestaurant(restaurantId, order.id, {
      status: next as Order['status'],
    })
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = updated
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('No se puede cambiar a ese estado desde el actual.', 'error')
      return
    }
    toast.show('No se pudo actualizar el pedido.', 'error')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await orderService.getByRestaurant(restaurantId, { page: 1, perPage: 50 })
    orders.value = res.data
  } catch {
    // silently degrade
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="owner-orders-view">
    <h1 class="owner-sub-title">Pedidos</h1>
    <p class="owner-sub-desc">Seguí y actualizá el estado de los pedidos.</p>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="orders.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      Sin pedidos.
    </div>
    <div v-else class="owner-orders-grid">
      <div v-for="o in orders" :key="o.id" class="owner-order-card">
        <div class="owner-order-header">
          <span class="owner-order-time">{{ formatTime(o.createdAt) }}</span>
          <span :class="['owner-order-status', `owner-order-status--${o.status}`]">{{ statusLabel(o.status) }}</span>
        </div>
        <div class="owner-order-items">
          <div v-for="item in o.items ?? []" :key="item.id" class="owner-order-item">
            <span class="owner-order-item-name">{{ item.menuItemName }}</span>
            <span class="owner-order-item-qty">×{{ item.quantity }}</span>
          </div>
        </div>
        <div class="owner-order-footer">
          <span class="owner-order-total">{{ formatMoney(o.totalAmount) }}</span>
          <button
            v-if="NEXT_STATUS[o.status]"
            class="owner-order-advance-btn"
            @click="advance(o)"
          >
            → {{ nextAction(o.status) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-orders-view { padding: 2.5rem; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.owner-orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.owner-order-card { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.125rem; display: flex; flex-direction: column; gap: 0.75rem; }
.owner-order-header { display: flex; justify-content: space-between; align-items: center; }
.owner-order-time { font-size: 0.75rem; color: var(--text-muted); }
.owner-order-status { font-size: 0.5625rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 99px; }
.owner-order-status--PENDING { color: #888; background: #0a0a0a; border: 1px solid #111; }
.owner-order-status--CONFIRMED { color: var(--brand); background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.15); }
.owner-order-status--IN_PREPARATION { color: #f59e0b; background: rgba(245,158,11,0.06); border: 1px solid rgba(245,158,11,0.15); }
.owner-order-status--READY { color: #22c55e; background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15); }
.owner-order-status--COMPLETED { color: #333; background: #080808; border: 1px solid #0d0d0d; }
.owner-order-status--CANCELLED { color: var(--danger); background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.12); }
.owner-order-items { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.owner-order-item { display: flex; justify-content: space-between; font-size: 0.8125rem; }
.owner-order-item-name { color: #444; }
.owner-order-item-qty { color: var(--text-muted); }
.owner-order-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 0.625rem; border-top: 1px solid #0a0a0a; }
.owner-order-total { font-size: 0.9375rem; font-weight: 700; color: #666; }
.owner-order-advance-btn { background: transparent; border: 1px solid #161616; color: #333; border-radius: var(--radius-sm); padding: 4px 10px; font-size: 0.6875rem; font-family: inherit; cursor: pointer; transition: all var(--dur-fast); white-space: nowrap; }
.owner-order-advance-btn:hover { color: #888; border-color: #222; }
</style>
