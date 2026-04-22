import { ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, X, MapPin, Phone, Mail, Calendar } from 'lucide-vue-next'
export type RestaurantDetailModalEmit = {
  (e: 'close'): void
  (e: 'upload-photo', file: File): void
}

export function useRestaurantDetailModal(emit: RestaurantDetailModalEmit): {
  t: ReturnType<typeof useI18n>['t']
  fileInput: Ref<HTMLInputElement | null>
  ImagePlus: typeof ImagePlus
  X: typeof X
  MapPin: typeof MapPin
  Phone: typeof Phone
  Mail: typeof Mail
  Calendar: typeof Calendar
  formatDate: (iso: string) => string
  onFileChange: (event: Event) => void
} {
  const { t } = useI18n()
  const fileInput = ref<HTMLInputElement | null>(null)

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
  }

  function onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) emit('upload-photo', file)
  }

  return {
    t,
    fileInput,
    ImagePlus,
    X,
    MapPin,
    Phone,
    Mail,
    Calendar,
    formatDate,
    onFileChange,
  }
}
