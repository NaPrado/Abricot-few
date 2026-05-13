<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HttpError } from '@/services/http'
import { restaurantAdminService } from '@/services'
import { useToast } from '@/composables'
import { useAuthStore } from '@/stores/authStore'
import type { RestaurantAdmin } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string
const toast = useToast()
const authStore = useAuthStore()

const admins = ref<RestaurantAdmin[]>([])
const loading = ref(true)
const newAdminUserId = ref('')
const submitting = ref(false)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  loading.value = true
  try {
    const res = await restaurantAdminService.listByRestaurant(restaurantId)
    admins.value = res.data
  } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para ver los administradores.', 'error')
    } else if (!(e instanceof HttpError)) {
      toast.show('No pudimos cargar los administradores.', 'error')
    }
    admins.value = []
  } finally {
    loading.value = false
  }
}

async function assign() {
  const userId = newAdminUserId.value.trim()
  if (!userId) {
    toast.show('Ingresá el UUID del usuario.', 'error')
    return
  }
  submitting.value = true
  try {
    const created = await restaurantAdminService.assign(restaurantId, { userId })
    admins.value = [...admins.value.filter(a => a.id !== created.id), created]
    newAdminUserId.value = ''
    toast.show('Administrador asignado.', 'success')
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      toast.show('No encontramos un usuario con ese ID.', 'error')
    } else if (e instanceof HttpError && e.status === 409) {
      toast.show('Ese usuario ya es administrador.', 'error')
    } else if (e instanceof HttpError && e.status === 400) {
      toast.show(e.message || 'UUID inválido.', 'error')
    } else if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para asignar administradores.', 'error')
    } else {
      toast.show('No pudimos asignar el administrador.', 'error')
    }
  } finally {
    submitting.value = false
  }
}

async function remove(admin: RestaurantAdmin) {
  if (admin.id === authStore.user?.id) {
    if (!window.confirm('Estás por quitarte como administrador. ¿Continuar?')) return
  } else if (!window.confirm(`¿Quitar a ${admin.name} ${admin.surname} como administrador?`)) {
    return
  }
  try {
    await restaurantAdminService.remove(restaurantId, admin.id)
    admins.value = admins.value.filter(a => a.id !== admin.id)
    toast.show('Administrador removido.', 'success')
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      toast.show('El administrador ya no existe.', 'error')
      admins.value = admins.value.filter(a => a.id !== admin.id)
      return
    }
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para remover administradores.', 'error')
      return
    }
    toast.show('No pudimos remover al administrador.', 'error')
  }
}

onMounted(load)
</script>

<template>
  <div class="owner-admins-view">
    <h1 class="owner-sub-title">Administradores</h1>
    <p class="owner-sub-desc">Asigná o quitá usuarios con permisos sobre este restaurante.</p>

    <form class="owner-admins-form" @submit.prevent="assign">
      <label class="owner-admins-field">
        <span>UUID del usuario</span>
        <input
          v-model="newAdminUserId"
          type="text"
          placeholder="018f1234-5678-7abc-8def-123456789abc"
          autocomplete="off"
          :disabled="submitting"
        />
      </label>
      <button type="submit" class="owner-admins-submit" :disabled="submitting">
        {{ submitting ? 'Asignando…' : 'Asignar administrador' }}
      </button>
    </form>

    <div v-if="loading" class="owner-admins-state">Cargando…</div>
    <div v-else-if="admins.length === 0" class="owner-admins-state">
      Todavía no hay administradores configurados.
    </div>
    <div v-else class="owner-admins-list">
      <div v-for="a in admins" :key="a.id" class="owner-admin-card">
        <div>
          <div class="owner-admin-name">{{ a.name }} {{ a.surname }}</div>
          <div class="owner-admin-meta">{{ a.email }} · {{ a.role }} · {{ formatDate(a.createdAt) }}</div>
        </div>
        <button
          type="button"
          class="owner-admin-remove"
          @click="remove(a)"
        >Quitar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.owner-admins-view { padding: 2.5rem; max-width: 720px; }
.owner-sub-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.owner-sub-desc { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.5rem; }
.owner-admins-form { display: grid; grid-template-columns: 1fr auto; align-items: end; gap: 0.75rem; margin-bottom: 1.5rem; }
.owner-admins-field { display: flex; flex-direction: column; gap: 0.35rem; color: var(--text-muted); font-size: 0.75rem; }
.owner-admins-field input { min-height: 2.5rem; padding: 0 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-default); background: var(--bg-input); color: var(--text-primary); font-family: inherit; font-size: 0.8125rem; outline: none; }
.owner-admins-field input:focus { border-color: var(--brand-border-hover); box-shadow: var(--brand-glow); }
.owner-admins-submit { min-height: 2.5rem; padding: 0 1.25rem; border-radius: var(--radius-md); border: none; background: var(--brand); color: #111; font-family: inherit; font-size: 0.8125rem; font-weight: 700; cursor: pointer; }
.owner-admins-submit:disabled { opacity: 0.55; cursor: not-allowed; }
.owner-admins-state { color: var(--text-muted); font-size: 0.875rem; padding: 1rem 0; }
.owner-admins-list { display: flex; flex-direction: column; gap: 10px; }
.owner-admin-card { display: flex; justify-content: space-between; align-items: center; gap: 1rem; background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1rem 1.25rem; }
.owner-admin-name { color: #bbb; font-size: 0.9375rem; font-weight: 600; }
.owner-admin-meta { color: var(--text-muted); font-size: 0.75rem; margin-top: 0.25rem; }
.owner-admin-remove { background: transparent; border: 1px solid rgba(239, 68, 68, 0.25); color: var(--danger); border-radius: var(--radius-sm); padding: 4px 12px; font-size: 0.75rem; font-family: inherit; cursor: pointer; }
.owner-admin-remove:hover { background: rgba(239, 68, 68, 0.06); border-color: rgba(239, 68, 68, 0.45); }

@media (max-width: 720px) {
  .owner-admins-form { grid-template-columns: 1fr; }
  .owner-admin-card { flex-direction: column; align-items: flex-start; }
}
</style>
