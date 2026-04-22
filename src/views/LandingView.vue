<script setup lang="ts">
import { useLandingView } from './scripts/LandingView'

const {
  t,
  RouterLink,
  PublicMarketingNav,
  authStore,
  searchQuery,
  ArrowRight,
} = useLandingView()
</script>

<template>
  <div class="landing-view">
    <PublicMarketingNav />

    <section class="landing-hero-split">
      <div class="landing-hero-split-pattern" aria-hidden="true" />

      <div class="landing-hero-split-left">
        <div class="landing-hero-split-content">
          <h1 class="landing-hero-split-title">
            <span class="landing-hero-split-title-line">{{ t('landing.hero.splitBefore') }}</span>
            <span class="landing-hero-split-title-accent">{{ t('landing.hero.splitHighlight') }}</span>
            <span class="landing-hero-split-title-line">{{ t('landing.hero.splitAfter') }}</span>
          </h1>
          <p class="landing-hero-split-sub">{{ t('landing.hero.splitSubline') }}</p>

          <div class="landing-hero-split-search">
            <div class="landing-hero-split-search-inner">
              <input
                v-model="searchQuery"
                type="search"
                class="landing-hero-split-input"
                :placeholder="t('landing.hero.searchPlaceholderShort')"
                autocomplete="off"
              />
              <RouterLink
                :to="{ path: '/explore', query: searchQuery.trim() ? { name: searchQuery.trim() } : {} }"
                class="landing-hero-split-submit"
              >
                {{ t('landing.hero.searchAction') }}
                <ArrowRight :size="16" aria-hidden="true" />
              </RouterLink>
            </div>
          </div>

          <div class="landing-hero-split-ctas">
            <RouterLink v-if="!authStore.isAuthenticated" to="/register" class="landing-hero-split-cta-primary">
              {{ t('landing.nav.registerFree') }}
            </RouterLink>
            <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="landing-hero-split-cta-ghost">
              {{ t('landing.nav.login') }}
            </RouterLink>
            <RouterLink
              v-else-if="authStore.isOwner"
              to="/app/restaurants"
              class="landing-hero-split-cta-primary"
            >
              {{ t('landing.nav.goToPanel') }}
            </RouterLink>
            <RouterLink v-else to="/explore" class="landing-hero-split-cta-primary">
              {{ t('nav.explore') }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="landing-hero-split-right" aria-hidden="true">
        <div class="landing-hero-split-image-bg" />
        <img
          src="/Night-Rooster-Dining-Room_Samantha-Marie-Photography.jpg"
          alt=""
          class="landing-hero-split-image"
        />
      </div>
    </section>

    <footer class="landing-footer">
      <img src="/abricot.png" :alt="t('landing.brandAlt')" class="landing-footer-logo" />
      <span class="landing-footer-copy">{{ t('landing.footer.copyright') }}</span>
    </footer>
  </div>
</template>

<style src="./styles/LandingView.css" scoped></style>
