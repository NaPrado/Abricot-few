<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HttpError } from '@/services/http'
import { tableService } from '@/services'
import { useToast } from '@/composables'
import BaseModal from '@/components/base/BaseModal.vue'
import type { Table } from '@/types'

const route = useRoute()
const restaurantId = route.params.restaurantId as string
const toast = useToast()

const tables = ref<Table[]>([])
const loading = ref(true)

const showCreateModal = ref(false)
const createLoading = ref(false)
const createError = ref('')

const formQuantity = ref(1)
const formCapacity = ref(2)
const formIsJoinable = ref(true)

async function loadTables() {
  loading.value = true
  try {
    const response = await tableService.getByRestaurant(restaurantId)
    tables.value = response.data.slice().sort((a, b) => a.number - b.number)
  } catch (e) {
    if (e instanceof HttpError && (e.status === 401 || e.status === 403)) {
      toast.show('No tenés permisos para ver las mesas.', 'error')
    } else {
      toast.show('No pudimos cargar las mesas.', 'error')
    }
  } finally {
    loading.value = false
  }
}

async function toggleActive(table: Table) {
  const updated = { ...table, isActive: !table.isActive }
  const idx = tables.value.findIndex(t => t.id === table.id)
  if (idx !== -1) tables.value[idx] = updated
  try {
    await tableService.update(restaurantId, table.id, {
      number: table.number,
      ...(table.name ? { name: table.name } : {}),
      capacity: table.capacity,
      isJoinable: table.isJoinable,
      isActive: updated.isActive,
    })
  } catch (e) {
    if (idx !== -1) tables.value[idx] = table
    if (e instanceof HttpError && e.status === 409) {
      toast.show('Esa mesa ya tiene reservas activas y no se puede desactivar.', 'error')
      return
    }
    toast.show('No pudimos actualizar la mesa.', 'error')
  }
}

async function removeTable(table: Table) {
  if (!window.confirm(`¿Eliminar la mesa ${table.number}?`)) return
  try {
    await tableService.delete(restaurantId, table.id)
    tables.value = tables.value.filter(t => t.id !== table.id)
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      toast.show('La mesa tiene reservas activas y no se puede eliminar.', 'error')
      return
    }
    toast.show('No pudimos eliminar la mesa.', 'error')
  }
}

async function submitCreateTables() {
  createError.value = ''

  if (formQuantity.value < 1 || formCapacity.value < 1) {
    createError.value = 'La cantidad y capacidad deben ser mayor a 0'
    return
  }

  createLoading.value = true
  try {
    if (formQuantity.value === 1) {
      const maxNumber = tables.value.reduce((max, t) => (t.number > max ? t.number : max), 0)
      await tableService.create(restaurantId, {
        number: maxNumber + 1,
        capacity: formCapacity.value,
        isJoinable: formIsJoinable.value,
        isActive: true,
      })
    } else {
      await tableService.bulkCreate(restaurantId, {
        groups: [
          {
            quantity: formQuantity.value,
            capacity: formCapacity.value,
            isJoinable: formIsJoinable.value,
          },
        ],
      })
    }

    await loadTables()
    closeCreateModal()
    toast.show('Mesas creadas correctamente.', 'success')
  } catch (e) {
    if (e instanceof HttpError && e.status === 409) {
      createError.value = 'Hay números de mesa duplicados. Probá con otro rango.'
    } else if (e instanceof HttpError && e.status === 400) {
      createError.value = e.message || 'Datos inválidos para crear mesas.'
    } else {
      createError.value = 'No pudimos crear las mesas. Intentá de nuevo.'
    }
  } finally {
    createLoading.value = false
  }
}

function openCreateModal() {
  showCreateModal.value = true
  createError.value = ''
}

function closeCreateModal() {
  showCreateModal.value = false
  formQuantity.value = 1
  formCapacity.value = 2
  formIsJoinable.value = true
}

onMounted(loadTables)
</script>

<template>
  <div class="tables-view">
    <div class="tables-view-header">
      <div>
        <h1 class="owner-sub-title">Mesas</h1>
        <p class="owner-sub-desc">Administrá la capacidad y disponibilidad de tus mesas.</p>
      </div>
      <button
        v-if="!loading && tables.length > 0"
        type="button"
        class="tables-view-btn"
        @click="openCreateModal"
      >
        + Agregar mesas
      </button>
    </div>

    <div v-if="loading" style="color:var(--text-muted);font-size:0.875rem">Cargando…</div>
    <div v-else-if="tables.length === 0" style="color:var(--text-muted);font-size:0.875rem;padding:2rem 0">
      <p>No hay mesas configuradas.</p>
      <button type="button" class="tables-view-btn" @click="openCreateModal">
        Crear tu primer grupo de mesas
      </button>
    </div>
    <div v-else class="tables-grid">
      <div v-for="t in tables" :key="t.id" :class="['table-card', !t.isActive && 'table-card--inactive']">
        <div class="table-card-number">Mesa {{ t.number }}</div>
        <div class="table-card-capacity">{{ t.capacity }} personas</div>
        <div v-if="t.name" class="table-card-name">{{ t.name }}</div>
        <div class="table-card-row">
          <span class="table-card-label">Unible</span>
          <span :class="['table-card-badge', t.isJoinable && 'table-card-badge--yes']">
            {{ t.isJoinable ? 'Sí' : 'No' }}
          </span>
        </div>
        <div class="table-card-toggle-row">
          <span class="table-card-label">{{ t.isActive ? 'Activa' : 'Inactiva' }}</span>
          <label class="owner-toggle">
            <input type="checkbox" :checked="t.isActive" @change="toggleActive(t)" />
            <span class="owner-toggle-track" />
            <span class="owner-toggle-thumb" />
          </label>
        </div>
        <button type="button" class="table-card-remove" @click="removeTable(t)">Eliminar</button>
      </div>
    </div>

    <BaseModal v-if="showCreateModal" @close="closeCreateModal">
      <div class="table-create-modal">
        <h2 class="table-create-title">Agregar mesas</h2>
        <p class="table-create-hint">Creá un grupo de mesas con las mismas características.</p>

        <form class="table-create-form" @submit.prevent="submitCreateTables">
          <label class="table-create-field">
            <span>Cantidad de mesas *</span>
            <input
              v-model.number="formQuantity"
              type="number"
              min="1"
              max="100"
              required
              autocomplete="off"
            />
          </label>

          <label class="table-create-field">
            <span>Capacidad por mesa *</span>
            <input
              v-model.number="formCapacity"
              type="number"
              min="1"
              max="20"
              required
              autocomplete="off"
            />
          </label>

          <label class="table-create-checkbox">
            <input v-model="formIsJoinable" type="checkbox" />
            <span>Permitir unir esta mesa con otras</span>
          </label>

          <div v-if="createError" class="table-create-error">
            {{ createError }}
          </div>

          <button
            type="submit"
            class="table-create-submit"
            :disabled="createLoading"
          >
            {{ createLoading ? 'Creando...' : 'Crear mesas' }}
          </button>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.tables-view {
  padding: 2.5rem;
}

.tables-view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2rem;
}

.owner-sub-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ccc;
  margin: 0 0 0.375rem;
  letter-spacing: -0.02em;
}

.owner-sub-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 0;
}

.tables-view-btn {
  padding: 0.5rem 1rem;
  background: var(--brand);
  color: #000;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--dur-fast);
  white-space: nowrap;
}

.tables-view-btn:hover {
  opacity: 0.9;
}

.tables-view-btn:active {
  opacity: 0.8;
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

.table-card {
  background: #060606;
  border: 1px solid #0d0d0d;
  border-radius: var(--radius-lg);
  padding: 1.25rem;
}

.table-card--inactive {
  opacity: 0.45;
}

.table-card-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #bbb;
  margin-bottom: 2px;
}

.table-card-capacity {
  font-size: 0.8125rem;
  color: var(--brand);
  margin-bottom: 0.625rem;
}

.table-card-name {
  font-size: 0.75rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.table-card-row,
.table-card-toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-top: 1px solid #0a0a0a;
}

.table-card-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.table-card-badge {
  font-size: 0.625rem;
  color: var(--text-muted);
  border: 1px solid #111;
  border-radius: 99px;
  padding: 2px 8px;
}

.table-card-badge--yes {
  color: var(--brand);
  border-color: rgba(249, 115, 22, 0.2);
}

.owner-toggle {
  position: relative;
  width: 34px;
  height: 18px;
  cursor: pointer;
}

.owner-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.owner-toggle-track {
  position: absolute;
  inset: 0;
  background: #111;
  border-radius: 99px;
  transition: background var(--dur-fast);
}

.owner-toggle input:checked + .owner-toggle-track {
  background: var(--brand);
}

.owner-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #333;
  border-radius: 50%;
  transition: transform var(--dur-fast), background var(--dur-fast);
}

.owner-toggle input:checked ~ .owner-toggle-thumb {
  transform: translateX(16px);
  background: #000;
}

.table-card-remove {
  align-self: flex-start;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: var(--danger);
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-size: 0.6875rem;
  font-family: inherit;
  cursor: pointer;
  margin-top: 0.5rem;
}

.table-card-remove:hover {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.45);
}

/* Modal styles */
.table-create-modal {
  padding: 2rem;
  max-width: 500px;
}

.table-create-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ccc;
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
}

.table-create-hint {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.table-create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-create-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-create-field span {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.table-create-field input {
  padding: 0.75rem;
  background: #0a0a0a;
  border: 1px solid #111;
  border-radius: var(--radius-md);
  color: #ccc;
  font-size: 0.875rem;
  transition: border-color var(--dur-fast);
}

.table-create-field input:focus {
  outline: none;
  border-color: var(--brand);
}

.table-create-field input::placeholder {
  color: var(--text-muted);
}

.table-create-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #ccc;
}

.table-create-checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.table-create-error {
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #ff6b6b;
  font-size: 0.8125rem;
}

.table-create-submit {
  padding: 0.75rem;
  background: var(--brand);
  color: #000;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity var(--dur-fast);
}

.table-create-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.table-create-submit:active:not(:disabled) {
  opacity: 0.8;
}

.table-create-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
