import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'abricot_cart'

export interface CartEntry {
  id: string
  name: string
  price: number
  qty: number
  notes: string
}

interface PersistedCart {
  restaurantId: string
  items: CartEntry[]
  orderNotes: string
}

function loadFromStorage(): PersistedCart | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PersistedCart
  } catch {
    return null
  }
}

export const useCartStore = defineStore('cart', () => {
  const saved = loadFromStorage()

  const restaurantId = ref<string | null>(saved?.restaurantId ?? null)
  const items = ref<CartEntry[]>(saved?.items ?? [])
  const orderNotes = ref<string>(saved?.orderNotes ?? '')

  const total = computed(() =>
    items.value.reduce((sum, e) => sum + e.price * e.qty, 0),
  )
  const itemCount = computed(() =>
    items.value.reduce((sum, e) => sum + e.qty, 0),
  )

  function _persist() {
    if (!restaurantId.value || items.value.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    const data: PersistedCart = {
      restaurantId: restaurantId.value,
      items: items.value,
      orderNotes: orderNotes.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  function ensureRestaurant(id: string) {
    if (restaurantId.value !== id) {
      restaurantId.value = id
      items.value = []
      orderNotes.value = ''
    }
  }

  function add(entry: Omit<CartEntry, 'qty' | 'notes'>) {
    const existing = items.value.find(e => e.id === entry.id)
    if (existing) {
      existing.qty++
    } else {
      items.value.push({ ...entry, qty: 1, notes: '' })
    }
    _persist()
  }

  function decrement(itemId: string) {
    const idx = items.value.findIndex(e => e.id === itemId)
    if (idx === -1) return
    if (items.value[idx]!.qty > 1) {
      items.value[idx]!.qty--
    } else {
      items.value.splice(idx, 1)
    }
    _persist()
  }

  function increment(itemId: string) {
    const entry = items.value.find(e => e.id === itemId)
    if (entry) {
      entry.qty++
      _persist()
    }
  }

  function setItemNotes(itemId: string, notes: string) {
    const entry = items.value.find(e => e.id === itemId)
    if (entry) {
      entry.notes = notes
      _persist()
    }
  }

  function setOrderNotes(notes: string) {
    orderNotes.value = notes
    _persist()
  }

  function qty(itemId: string): number {
    return items.value.find(e => e.id === itemId)?.qty ?? 0
  }

  function clear() {
    items.value = []
    orderNotes.value = ''
    restaurantId.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    restaurantId,
    items,
    orderNotes,
    total,
    itemCount,
    ensureRestaurant,
    add,
    decrement,
    increment,
    setItemNotes,
    setOrderNotes,
    qty,
    clear,
  }
})
