<script setup lang="ts">
import { ref, watch } from "vue"
import { ImagePlus, X } from "lucide-vue-next"
import type { Restaurant, RestaurantCreateRequest } from "@/types"

interface Props {
  restaurant?: Restaurant | null
}

const props = withDefaults(defineProps<Props>(), { restaurant: null })
const emit = defineEmits<{
  (e: "save", payload: RestaurantCreateRequest, photo: File | null): void
  (e: "close"): void
}>()

const name = ref("")
const address = ref("")
const phone = ref("")
const email = ref("")
const description = ref("")
const photoFile = ref<File | null>(null)
const photoPreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.restaurant,
  (r) => {
    name.value = r?.name ?? ""
    address.value = r?.address ?? ""
    phone.value = r?.phone ?? ""
    email.value = r?.email ?? ""
    description.value = r?.description ?? ""
    photoFile.value = null
    photoPreview.value = r?.photoUrl ?? null
  },
  { immediate: true },
)

function onFileChange(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

function removePhoto(): void {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) fileInput.value.value = ""
}

function handleSubmit(): void {
  const payload: RestaurantCreateRequest = {
    name: name.value,
    address: address.value,
    phone: phone.value,
  }
  if (email.value) payload.email = email.value
  if (description.value) payload.description = description.value
  emit("save", payload, photoFile.value)
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
    @click.self="emit('close')"
  >
      <div class="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-full flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-gray-800">
        <h2 class="text-lg font-semibold text-white">
          {{ restaurant ? "Editar restaurante" : "Nuevo restaurante" }}
        </h2>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-white transition-colors text-xl leading-none"
        >
          ✕
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 py-6 flex flex-col gap-4 overflow-y-auto">

        <!-- Photo -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Foto (opcional)</label>
          <div class="relative group w-full h-36 rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
            <img
              v-if="photoPreview"
              :src="photoPreview"
              alt="Preview"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500 cursor-pointer"
              @click="fileInput?.click()"
            >
              <ImagePlus :size="28" />
              <span class="text-xs">Seleccionar imagen</span>
            </div>

            <!-- Overlay on hover when there's a photo -->
            <div
              v-if="photoPreview"
              class="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                type="button"
                @click="fileInput?.click()"
                class="text-white text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Cambiar
              </button>
              <button
                type="button"
                @click="removePhoto"
                class="text-white text-xs font-medium bg-red-500/70 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors"
              >
                <X :size="14" />
              </button>
            </div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="hidden"
            @change="onFileChange"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Nombre <span class="text-red-400">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="La Parolaccia"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Dirección <span class="text-red-400">*</span>
          </label>
          <input
            v-model="address"
            type="text"
            required
            placeholder="Av. Corrientes 1234, CABA"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Teléfono <span class="text-red-400">*</span>
          </label>
          <input
            v-model="phone"
            type="text"
            required
            placeholder="+54 11 4444-5555"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Email (opcional)</label>
          <input
            v-model="email"
            type="email"
            placeholder="reservas@restaurante.com"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Descripción (opcional)
          </label>
          <textarea
            v-model="description"
            rows="3"
            placeholder="Breve descripción del restaurante..."
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none"
          />
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            @click="emit('close')"
            class="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex-1 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white text-sm font-semibold transition-colors"
          >
            {{ restaurant ? "Guardar cambios" : "Crear restaurante" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
