import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Notification } from '@/types/index'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  function addNotification(message: string): void {
    notifications.value.unshift({
      id: crypto.randomUUID(),
      message,
      timestamp: new Date(),
      read: false,
    })
  }

  function markAsRead(id: string): void {
    const notification = notifications.value.find((n) => n.id === id)
    if (notification) notification.read = true
  }

  function clearAll(): void {
    notifications.value = []
  }

  return { notifications, unreadCount, addNotification, markAsRead, clearAll }
})
