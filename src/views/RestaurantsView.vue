<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRestaurantStore } from "@/stores/restaurantStore"
import { useToast } from "@/composables/useToast"
import RestaurantModal from "@/components/RestaurantModal.vue"
import { Eye, Pencil, Trash2 } from "lucide-vue-next"
import RestaurantDetailModal from "@/components/RestaurantDetailModal.vue"
import type { Restaurant, RestaurantCreateRequest } from "@/types"

const store = useRestaurantStore()
const { show } = useToast()

const showModal = ref(false)
const editingRestaurant = ref<Restaurant | null>(null)
const viewingRestaurant = ref<Restaurant | null>(null)
const deletingId = ref<number | null>(null)

onMounted(() => store.fetchAll())

function openCreate(): void {
  editingRestaurant.value = null
  showModal.value = true
}

function openEdit(restaurant: Restaurant): void {
  editingRestaurant.value = restaurant
  showModal.value = true
}

function closeModal(): void {
  showModal.value = false
  editingRestaurant.value = null
}

async function handleSave(payload: RestaurantCreateRequest): Promise<void> {
  try {
    if (editingRestaurant.value) {
      await store.update(editingRestaurant.value.id, payload)
      show("Restaurante actualizado correctamente", "success")
    } else {
      await store.create(payload)
      show("Restaurante creado correctamente", "success")
    }
    closeModal()
  } catch (e) {
    show(e instanceof Error ? e.message : "Error al guardar", "error")
  }
}

async function handleDelete(id: number): Promise<void> {
  if (!confirm("¿Eliminar este restaurante? Esta acción no se puede deshacer.")) return
  deletingId.value = id
  try {
    await store.remove(id)
    show("Restaurante eliminado", "success")
  } catch (e) {
    show(e instanceof Error ? e.message : "Error al eliminar", "error")
  } finally {
    deletingId.value = null
  }
}

</script>

<template>
  <div class="max-w-5xl mx-auto">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Restaurantes</h1>
        <p class="text-gray-400 text-sm mt-1">Gestioná todos tus locales</p>
      </div>
      <button
        @click="openCreate"
        class="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <span>+</span> Nuevo restaurante
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.isLoading" class="flex justify-center py-20">
      <div class="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>

    <!-- Fetch error -->
    <div v-else-if="store.error" class="text-center py-20">
      <p class="text-4xl mb-4">⚠️</p>
      <p class="font-medium text-gray-300">{{ store.error }}</p>
      <button
        @click="store.fetchAll()"
        class="mt-4 text-orange-500 hover:text-orange-400 text-sm font-medium"
      >
        Reintentar
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="store.restaurants.length === 0" class="text-center py-20">
      <p class="text-5xl mb-4">🏠</p>
      <p class="font-medium text-gray-300 text-lg">Sin restaurantes aún</p>
      <p class="text-gray-400 text-sm mt-1 mb-6">Creá tu primer local para comenzar</p>
      <button
        @click="openCreate"
        class="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Crear restaurante
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-800 bg-gray-800/50">
            <th class="text-left px-6 py-4 font-medium text-gray-400">Nombre</th>
            <th class="text-left px-6 py-4 font-medium text-gray-400">Dirección</th>
            <th class="text-left px-6 py-4 font-medium text-gray-400">Teléfono</th>
            <th class="px-6 py-4" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in store.restaurants"
            :key="r.id"
            class="border-b border-gray-800 hover:bg-gray-800/40 transition-colors last:border-0"
          >
            <td class="px-6 py-4 font-medium text-white">{{ r.name }}</td>
            <td class="px-6 py-4 text-gray-400">{{ r.address }}</td>
            <td class="px-6 py-4 text-gray-400">{{ r.phone }}</td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2 justify-end">
                <button
                  @click="viewingRestaurant = r"
                  class="p-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
                >
                  <Eye :size="14" />
                </button>
                <button
                  @click="openEdit(r)"
                  class="p-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
                >
                  <Pencil :size="14" />
                </button>
                <button
                  @click="handleDelete(r.id)"
                  :disabled="deletingId === r.id"
                  class="p-2 text-red-500 hover:text-red-400 border border-red-900 hover:border-red-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail modal -->
    <RestaurantDetailModal
      v-if="viewingRestaurant"
      :restaurant="viewingRestaurant"
      @close="viewingRestaurant = null"
    />

    <!-- Edit/Create modal -->
    <RestaurantModal
      v-if="showModal"
      :restaurant="editingRestaurant"
      @save="handleSave"
      @close="closeModal"
    />
  </div>
</template>
