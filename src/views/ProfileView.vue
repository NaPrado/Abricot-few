<script setup lang="ts">
import { useProfileView } from './scripts/ProfileView'

const {
  t,
  form,
  passwordForm,
  saving,
  savingPassword,
  saveInfo,
  savePassword,
  BaseInput,
  BaseButton,
} = useProfileView()
</script>

<template>
  <div class="profile-view">
    <header class="profile-view-header">
      <h1 class="profile-view-title">{{ t('profile.title') }}</h1>
      <p class="profile-view-subtitle">{{ t('profile.subtitle') }}</p>
    </header>

    <section class="profile-view-card">
      <h2 class="profile-view-section-title">{{ t('profile.personalInfo') }}</h2>
      <form class="profile-view-form" @submit.prevent="saveInfo">
        <div class="profile-view-field-row">
          <BaseInput
            v-model="form.name"
            :label="t('profile.firstName')"
            required
          />
          <BaseInput
            v-model="form.surname"
            :label="t('profile.lastName')"
            required
          />
        </div>
        <div class="profile-view-field">
          <BaseInput
            v-model="form.email"
            :label="t('profile.email')"
            type="email"
            disabled
          />
          <p class="profile-view-hint">{{ t('profile.emailHint') }}</p>
        </div>
        <div class="profile-view-actions">
          <BaseButton type="submit" variant="primary" :loading="saving">
            {{ saving ? t('profile.savingInfo') : t('profile.saveInfo') }}
          </BaseButton>
        </div>
      </form>
    </section>

    <section class="profile-view-card">
      <h2 class="profile-view-section-title">{{ t('profile.changePassword') }}</h2>
      <form class="profile-view-form" @submit.prevent="savePassword">
        <BaseInput
          v-model="passwordForm.currentPassword"
          :label="t('profile.currentPassword')"
          type="password"
          required
        />
        <BaseInput
          v-model="passwordForm.newPassword"
          :label="t('profile.newPassword')"
          type="password"
          required
        />
        <BaseInput
          v-model="passwordForm.confirmPassword"
          :label="t('profile.confirmPassword')"
          type="password"
          required
        />
        <div class="profile-view-actions">
          <BaseButton type="submit" variant="secondary" :loading="savingPassword">
            {{ savingPassword ? t('profile.savingPassword') : t('profile.savePassword') }}
          </BaseButton>
        </div>
      </form>
    </section>
  </div>
</template>

<style src="./styles/ProfileView.css" scoped></style>
