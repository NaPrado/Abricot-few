import { ref, reactive, watch, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, X } from 'lucide-vue-next'
import { BaseInput, BaseButton } from '@/components/base'
import type { Restaurant, RestaurantCreateRequest } from '@/types'

export interface RestaurantModalProps {
  restaurant?: Restaurant | null
}

export type RestaurantModalEmit = {
  (e: 'save', payload: RestaurantCreateRequest, photo: File | null): void
  (e: 'close'): void
}

export function useRestaurantModal(
  props: RestaurantModalProps,
  emit: RestaurantModalEmit,
): {
  t: ReturnType<typeof useI18n>['t']
  form: { name: string; address: string; cityId: string; phone: string; email: string; description: string }
  photoFile: Ref<File | null>
  photoPreview: Ref<string | null>
  fileInput: Ref<HTMLInputElement | null>
  BaseInput: typeof BaseInput
  BaseButton: typeof BaseButton
  ImagePlus: typeof ImagePlus
  X: typeof X
  onFileChange: (event: Event) => void
  removePhoto: () => void
  handleSubmit: () => void
} {
  const { t } = useI18n()

  const form = reactive({ name: '', address: '', cityId: '', phone: '', email: '', description: '' })
  const photoFile = ref<File | null>(null)
  const photoPreview = ref<string | null>(null)
  const fileInput = ref<HTMLInputElement | null>(null)

  watch(
    () => props.restaurant,
    (r) => {
      Object.assign(form, {
        name:        r?.name        ?? '',
        address:     r?.address     ?? '',
        cityId:      r?.city?.id   ?? '',
        phone:       r?.phone       ?? '',
        email:       r?.email       ?? '',
        description: r?.description ?? '',
      })
      photoFile.value    = null
      photoPreview.value = r?.photoUrl ?? null
    },
    { immediate: true },
  )

  function onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    photoFile.value    = file
    photoPreview.value = URL.createObjectURL(file)
  }

  function removePhoto(): void {
    photoFile.value    = null
    photoPreview.value = null
    if (fileInput.value) fileInput.value.value = ''
  }

  function handleSubmit(): void {
    const payload: RestaurantCreateRequest = {
      name:    form.name,
      address: form.address,
      cityId:  form.cityId,
      phone:   form.phone,
      ...(form.email       && { email:       form.email }),
      ...(form.description && { description: form.description }),
    }
    emit('save', payload, photoFile.value)
  }

  return {
    t,
    form,
    photoFile,
    photoPreview,
    fileInput,
    BaseInput,
    BaseButton,
    ImagePlus,
    X,
    onFileChange,
    removePhoto,
    handleSubmit,
  }
}
