import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Reservation } from '@/types/index'
import { fetchReservations } from '@/services/mock/reservationService'

export const useReservationStore = defineStore('reservation', () => {
  const reservations = ref<Reservation[]>([])
  const isLoading = ref(false)

  async function loadReservations(): Promise<void> {
    isLoading.value = true
    reservations.value = await fetchReservations()
    isLoading.value = false
  }

  function addReservation(
    customerName: string,
    date: string,
    time: string,
    guests: number,
  ): void {
    reservations.value.unshift({
      id: crypto.randomUUID(),
      customerName,
      date,
      time,
      guests,
      status: 'PENDING',
    })
  }

  return { reservations, isLoading, loadReservations, addReservation }
})
