import { useNotificationStore } from '@/stores/notificationStore'

const MESSAGES = [
  'Nuevo pedido recibido en mesa 4',
  'La mesa 2 canceló su reserva',
  'El pedido de la mesa 12 está listo para servir',
  'Nueva reserva confirmada para las 21:00',
  'El pedido de la mesa 7 lleva más de 30 minutos',
  'Mesa 5 solicita la cuenta',
  'Pago recibido de la mesa 9',
]

let intervalId: ReturnType<typeof setTimeout> | null = null

function scheduleNext(): void {
  const delay = 5000 + Math.random() * 5000
  intervalId = setTimeout(() => {
    const store = useNotificationStore()
    const idx = Math.floor(Math.random() * MESSAGES.length)
    const message: string = MESSAGES[idx] ?? 'Nueva notificación'
    store.addNotification(message)
    scheduleNext()
  }, delay)
}

export function start(): void {
  if (intervalId !== null) return
  scheduleNext()
}

export function stop(): void {
  if (intervalId !== null) {
    clearTimeout(intervalId)
    intervalId = null
  }
}
