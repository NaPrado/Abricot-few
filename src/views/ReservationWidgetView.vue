<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { availabilityService, reservationService, restaurantService } from '@/services'
import { HttpError } from '@/services/http'
import type { AvailabilitySlot, Reservation, Restaurant } from '@/types'

const route = useRoute()
const restaurantId = computed(() => String(route.params.restaurantId ?? ''))

const today = new Date().toISOString().slice(0, 10)
const restaurant = ref<Restaurant | null>(null)
const date = ref(today)
const partySize = ref(2)
const selectedSlot = ref('')
const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')
const notes = ref('')
const slots = ref<AvailabilitySlot[]>([])
const loadingRestaurant = ref(true)
const loadingSlots = ref(false)
const submitting = ref(false)
const loadError = ref('')
const submitError = ref('')
const createdReservation = ref<Reservation | null>(null)

const availableSlots = computed(() => slots.value.filter(slot => slot.isAvailable))
const canSubmit = computed(() => (
  Boolean(selectedSlot.value)
  && guestName.value.trim().length > 1
  && guestEmail.value.trim().length > 3
  && !submitting.value
))

function formatSlot(slot: string): string {
  return slot.slice(0, 5)
}

async function loadRestaurant(): Promise<void> {
  loadingRestaurant.value = true
  loadError.value = ''
  try {
    restaurant.value = await restaurantService.getById(restaurantId.value)
  } catch {
    loadError.value = 'No pudimos cargar el restaurante.'
  } finally {
    loadingRestaurant.value = false
  }
}

async function loadSlots(): Promise<void> {
  if (!restaurantId.value || !date.value || partySize.value < 1) return

  loadingSlots.value = true
  loadError.value = ''
  selectedSlot.value = ''
  try {
    const response = await availabilityService.getPublicByRestaurant(restaurantId.value, {
      date: date.value,
      partySize: partySize.value,
    })
    slots.value = response.slots
  } catch {
    slots.value = []
    loadError.value = 'No pudimos consultar la disponibilidad.'
  } finally {
    loadingSlots.value = false
  }
}

async function submitReservation(): Promise<void> {
  if (!canSubmit.value) return

  submitting.value = true
  submitError.value = ''
  try {
    const trimmedGuestPhone = guestPhone.value.trim()
    const trimmedNotes = notes.value.trim()
    createdReservation.value = await reservationService.createPublic(restaurantId.value, {
      partySize: partySize.value,
      date: date.value,
      timeSlot: selectedSlot.value,
      guestName: guestName.value.trim(),
      guestEmail: guestEmail.value.trim(),
      ...(trimmedGuestPhone ? { guestPhone: trimmedGuestPhone } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    })
  } catch (error) {
    if (error instanceof HttpError) {
      if (error.status === 404) {
        submitError.value = 'No encontramos este restaurante o el backend todavía no tiene el endpoint público activo.'
      } else if (error.status === 409) {
        submitError.value = 'Ese horario se acaba de ocupar. Elegí otro turno disponible.'
      } else {
        submitError.value = error.message || 'No se pudo confirmar la reserva.'
      }
    } else {
      submitError.value = 'No se pudo conectar con el servidor de reservas.'
    }
  } finally {
    submitting.value = false
  }
}

function changePartySize(delta: number): void {
  partySize.value = Math.max(1, Math.min(20, partySize.value + delta))
}

watch([date, partySize], () => {
  void loadSlots()
})

onMounted(async () => {
  await loadRestaurant()
  await loadSlots()
})
</script>

<template>
  <main class="reservation-widget">
    <section class="reservation-widget__panel">
      <div class="reservation-widget__header">
        <p class="reservation-widget__eyebrow">Reservas online</p>
        <h1>{{ restaurant?.name ?? 'Reservá tu mesa' }}</h1>
        <p>Elegí fecha, horario y cantidad de personas.</p>
      </div>

      <div v-if="loadingRestaurant" class="reservation-widget__state">
        Cargando restaurante...
      </div>

      <div v-else-if="createdReservation" class="reservation-widget__success">
        <p class="reservation-widget__eyebrow">Reserva confirmada</p>
        <h2>Código {{ createdReservation.confirmationCode }}</h2>
        <p>
          Te enviamos la confirmación a {{ createdReservation.guestEmail }}.
        </p>
      </div>

      <form v-else class="reservation-widget__form" @submit.prevent="submitReservation">
        <div class="reservation-widget__grid">
          <label>
            <span>Fecha</span>
            <input v-model="date" type="date" :min="today" required>
          </label>

          <div class="reservation-widget__counter">
            <span>Personas</span>
            <div>
              <button type="button" aria-label="Restar persona" @click="changePartySize(-1)">-</button>
              <strong>{{ partySize }}</strong>
              <button type="button" aria-label="Sumar persona" @click="changePartySize(1)">+</button>
            </div>
          </div>
        </div>

        <div class="reservation-widget__slots">
          <span>Horarios disponibles</span>
          <div v-if="loadingSlots" class="reservation-widget__state">
            Buscando horarios...
          </div>
          <div v-else-if="availableSlots.length" class="reservation-widget__slot-list">
            <button
              v-for="slot in availableSlots"
              :key="slot.timeSlot"
              type="button"
              :class="{ 'reservation-widget__slot--selected': selectedSlot === slot.timeSlot }"
              @click="selectedSlot = slot.timeSlot"
            >
              {{ formatSlot(slot.timeSlot) }}
            </button>
          </div>
          <p v-else class="reservation-widget__hint">
            No hay cupos para esa fecha y cantidad de personas.
          </p>
        </div>

        <div class="reservation-widget__grid">
          <label>
            <span>Nombre</span>
            <input v-model="guestName" type="text" autocomplete="name" required>
          </label>
          <label>
            <span>Email</span>
            <input v-model="guestEmail" type="email" autocomplete="email" required>
          </label>
        </div>

        <label>
          <span>Teléfono</span>
          <input v-model="guestPhone" type="tel" autocomplete="tel">
        </label>

        <label>
          <span>Notas</span>
          <textarea v-model="notes" rows="3" placeholder="Opcional" />
        </label>

        <p v-if="loadError" class="reservation-widget__error">{{ loadError }}</p>
        <p v-if="submitError" class="reservation-widget__error">{{ submitError }}</p>

        <button class="reservation-widget__submit" type="submit" :disabled="!canSubmit">
          {{ submitting ? 'Confirmando...' : 'Confirmar reserva' }}
        </button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.reservation-widget {
  min-height: 100vh;
  background: #050505;
  color: #f5f5f5;
  padding: 18px;
}

.reservation-widget__panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 22px;
  border: 1px solid #1d1d1d;
  border-radius: 8px;
  background: #080808;
}

.reservation-widget__header {
  margin-bottom: 22px;
}

.reservation-widget__eyebrow,
.reservation-widget__header p,
.reservation-widget__hint,
.reservation-widget__state {
  color: #aeb6c2;
  font-size: 0.875rem;
}

.reservation-widget__eyebrow {
  margin: 0 0 6px;
  color: #ff7a1a;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.reservation-widget h1,
.reservation-widget h2 {
  margin: 0 0 8px;
  font-size: 1.65rem;
  line-height: 1.15;
}

.reservation-widget__form {
  display: grid;
  gap: 16px;
}

.reservation-widget__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.reservation-widget label,
.reservation-widget__counter,
.reservation-widget__slots {
  display: grid;
  gap: 8px;
}

.reservation-widget label span,
.reservation-widget__counter > span,
.reservation-widget__slots > span {
  color: #cfd5df;
  font-size: 0.84rem;
  font-weight: 700;
}

.reservation-widget input,
.reservation-widget textarea {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid #252525;
  border-radius: 8px;
  background: #0d0d0d;
  color: #f5f5f5;
  padding: 10px 12px;
  font: inherit;
}

.reservation-widget textarea {
  resize: vertical;
}

.reservation-widget__counter > div {
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  min-height: 44px;
  border: 1px solid #252525;
  border-radius: 8px;
  background: #0d0d0d;
}

.reservation-widget__counter button,
.reservation-widget__slot-list button,
.reservation-widget__submit {
  border: 0;
  border-radius: 8px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
}

.reservation-widget__counter button {
  height: 42px;
  background: transparent;
  color: #ff7a1a;
  font-size: 1.25rem;
}

.reservation-widget__counter strong {
  text-align: center;
}

.reservation-widget__slot-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
  gap: 8px;
}

.reservation-widget__slot-list button {
  min-height: 42px;
  border: 1px solid #252525;
  background: #101010;
  color: #f5f5f5;
}

.reservation-widget__slot-list .reservation-widget__slot--selected {
  border-color: #ff7a1a;
  background: #ff7a1a;
  color: #111;
}

.reservation-widget__submit {
  min-height: 48px;
  background: #ff7a1a;
  color: #111;
}

.reservation-widget__submit:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.reservation-widget__error {
  margin: 0;
  color: #ff8b8b;
  font-size: 0.875rem;
}

.reservation-widget__success {
  display: grid;
  gap: 8px;
  padding: 16px 0;
}

@media (max-width: 560px) {
  .reservation-widget {
    padding: 10px;
  }

  .reservation-widget__panel {
    padding: 16px;
  }

  .reservation-widget__grid {
    grid-template-columns: 1fr;
  }
}
</style>
