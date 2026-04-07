<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useReservationStore } from '@/stores/reservationStore'
import ReservationCard from '@/components/ReservationCard.vue'

const store = useReservationStore()

onMounted(() => {
  store.loadReservations()
})

const showForm = ref(false)
const customerName = ref('')
const date = ref('')
const time = ref('')
const guests = ref(2)

function openForm(): void {
  showForm.value = true
}

function closeForm(): void {
  showForm.value = false
  customerName.value = ''
  date.value = ''
  time.value = ''
  guests.value = 2
}

function submit(): void {
  if (!customerName.value.trim() || !date.value || !time.value || guests.value < 1) return
  store.addReservation(customerName.value.trim(), date.value, time.value, guests.value)
  closeForm()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Reservas</h1>
      <button
        class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        @click="openForm"
      >
        + Nueva Reserva
      </button>
    </div>

    <!-- Modal -->
    <Transition name="fade">
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        @click.self="closeForm"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <h2 class="mb-6 text-lg font-bold text-gray-900">Nueva Reserva</h2>

          <form class="flex flex-col gap-4" @submit.prevent="submit">
            <!-- Nombre -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600">
                Nombre del cliente
              </label>
              <input
                v-model="customerName"
                type="text"
                placeholder="Ej: Valentina Gómez"
                required
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-indigo-500 placeholder:text-gray-400 focus:ring-2"
              />
            </div>

            <!-- Fecha y Hora -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">Fecha</label>
                <input
                  v-model="date"
                  type="date"
                  required
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-indigo-500 focus:ring-2"
                />
              </div>
              <div>
                <label class="mb-1 block text-xs font-medium text-gray-600">Hora</label>
                <input
                  v-model="time"
                  type="time"
                  required
                  class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-indigo-500 focus:ring-2"
                />
              </div>
            </div>

            <!-- Comensales -->
            <div>
              <label class="mb-1 block text-xs font-medium text-gray-600">
                Cantidad de comensales
              </label>
              <input
                v-model.number="guests"
                type="number"
                min="1"
                max="20"
                required
                class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-indigo-500 focus:ring-2"
              />
            </div>

            <!-- Acciones -->
            <div class="mt-2 flex justify-end gap-3">
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                @click="closeForm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Lista -->
    <p v-if="store.isLoading" class="text-sm text-gray-500">Cargando datos desde la nube...</p>

    <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <ReservationCard
        v-for="reservation in store.reservations"
        :key="reservation.id"
        :reservation="reservation"
      />
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
