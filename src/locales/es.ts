// Spanish (Argentina) — source of truth.
// The MessageSchema type is derived from this object, so every key added
// here must also be added to en.ts or the build will fail.
const es = {
  common: {
    save: 'Guardar cambios',
    cancel: 'Cancelar',
    retry: 'Reintentar',
    required: 'obligatorio',
  },
  nav: {
    restaurants: 'Restaurantes',
    logout: 'Cerrar sesión',
  },
  auth: {
    loginSubtitle: 'Iniciá sesión en tu cuenta',
    registerSubtitle: 'Creá tu cuenta gratis',
    email: 'Email',
    password: 'Contraseña',
    firstName: 'Nombre',
    lastName: 'Apellido',
    passwordHint: '(mín. 8 caracteres)',
    loginButton: 'Iniciar sesión',
    loginLoading: 'Ingresando...',
    registerButton: 'Crear cuenta',
    registerLoading: 'Creando cuenta...',
    noAccount: '¿No tenés cuenta?',
    signUp: 'Registrate',
    hasAccount: '¿Ya tenés cuenta?',
    signIn: 'Iniciar sesión',
    sessionExpired: 'Tu sesión expiró. Iniciá sesión nuevamente.',
    errors: {
      passwordLength: 'La contraseña debe tener al menos 8 caracteres',
      login: 'Error al iniciar sesi��n',
      register: 'Error al registrarse',
    },
  },
  restaurant: {
    title: 'Restaurantes',
    subtitle: 'Gestioná todos tus locales',
    new: 'Nuevo restaurante',
    edit: 'Editar restaurante',
    create: 'Crear restaurante',
    empty: 'Sin restaurantes aún',
    emptyHint: 'Creá tu primer local para comenzar',
    deleteConfirm: '¿Eliminar este restaurante? Esta acción no se puede deshacer.',
    fields: {
      name: 'Nombre',
      address: 'Dirección',
      phone: 'Teléfono',
      email: 'Email (opcional)',
      description: 'Descripción (opcional)',
      photo: 'Foto (opcional)',
    },
    photo: {
      select: 'Seleccionar imagen',
      change: 'Cambiar',
      upload: 'Subir foto',
      uploadChange: 'Cambiar foto',
    },
    detail: {
      createdAt: 'Alta',
    },
    toast: {
      created: 'Restaurante creado correctamente',
      updated: 'Restaurante actualizado correctamente',
      deleted: 'Restaurante eliminado',
      photoOk: 'Foto actualizada correctamente',
      saveError: 'Error al guardar',
      photoError: 'Error al subir la foto',
      deleteError: 'Error al eliminar',
    },
  },
  errors: {
    generic: 'Ocurrió un error inesperado.',
    network: 'Error de red. Verificá tu conexión.',
  },
} as const

export default es

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> }
export type MessageSchema = DeepString<typeof es>
