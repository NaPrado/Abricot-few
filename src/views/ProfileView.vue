<script setup lang="ts">
import { useProfileView } from './scripts/ProfileView'

const {
  name, surname, email,
  saving, saveSuccess, saveError, saveProfile,
  currentPassword, newPassword, passwordSaving, passwordSuccess, passwordError, savePassword,
} = useProfileView()
</script>

<template>
  <div class="profile-view">
    <h1 class="profile-title">Mi perfil</h1>
    <p class="profile-sub">Administrá tu información personal.</p>

    <!-- Personal info -->
    <div class="profile-section">
      <div class="profile-section-title">Información personal</div>
      <form class="profile-form" @submit="saveProfile">
        <div class="profile-form-row">
          <div class="profile-field">
            <label class="profile-label">Nombre</label>
            <input v-model="name" class="profile-input" type="text" />
          </div>
          <div class="profile-field">
            <label class="profile-label">Apellido</label>
            <input v-model="surname" class="profile-input" type="text" />
          </div>
        </div>
        <div class="profile-field">
          <label class="profile-label">Email</label>
          <input class="profile-input profile-input--disabled" type="email" :value="email" disabled />
        </div>
        <p v-if="saveError" class="profile-error">{{ saveError }}</p>
        <p v-if="saveSuccess" class="profile-success">Cambios guardados.</p>
        <button class="profile-save-btn" type="submit" :disabled="saving">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </form>
    </div>

    <!-- Password -->
    <div class="profile-section">
      <div class="profile-section-title">Cambiar contraseña</div>
      <form class="profile-form" @submit="savePassword">
        <div class="profile-field">
          <label class="profile-label">Contraseña actual</label>
          <input v-model="currentPassword" class="profile-input" type="password" autocomplete="current-password" />
        </div>
        <div class="profile-field">
          <label class="profile-label">Nueva contraseña</label>
          <input v-model="newPassword" class="profile-input" type="password" autocomplete="new-password" minlength="8" />
        </div>
        <p v-if="passwordError" class="profile-error">{{ passwordError }}</p>
        <p v-if="passwordSuccess" class="profile-success">Contraseña actualizada.</p>
        <button class="profile-save-btn" type="submit" :disabled="passwordSaving">
          {{ passwordSaving ? 'Actualizando…' : 'Actualizar contraseña' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-view { padding: 2.5rem; max-width: 640px; }
.profile-title { font-size: 1.5rem; font-weight: 700; color: #ccc; margin: 0 0 0.375rem; letter-spacing: -0.02em; }
.profile-sub { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 2rem; }
.profile-section { background: #060606; border: 1px solid #0d0d0d; border-radius: var(--radius-lg); padding: 1.5rem; margin-bottom: 1rem; }
.profile-section-title { font-size: 0.875rem; font-weight: 600; color: #888; margin-bottom: 1.25rem; }
.profile-form { display: flex; flex-direction: column; gap: 0.875rem; }
.profile-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.profile-field { display: flex; flex-direction: column; gap: 5px; }
.profile-label { font-size: 0.5625rem; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; }
.profile-input { background: #080808; border: 1px solid #111; border-radius: var(--radius-md); padding: 0.625rem 0.875rem; color: #ccc; font-size: 0.875rem; font-family: inherit; outline: none; transition: border-color var(--dur-fast); }
.profile-input:focus { border-color: #1a1a1a; }
.profile-input--disabled { color: var(--text-muted); cursor: not-allowed; }
.profile-error { font-size: 0.8125rem; color: var(--danger); }
.profile-success { font-size: 0.8125rem; color: var(--brand); }
.profile-save-btn { align-self: flex-start; padding: 0.625rem 1.5rem; background: #e8e8e8; border: none; border-radius: var(--radius-md); color: #060606; font-weight: 700; font-size: 0.8125rem; font-family: inherit; cursor: pointer; transition: opacity var(--dur-fast); }
.profile-save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
