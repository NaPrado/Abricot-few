<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { RotatingText } from '@/components/base'
import {
  Package, TrendingUp, LayoutDashboard, Calendar,
  ShoppingCart, Target, BarChart3, Search, ArrowRight, ChevronDown,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const searchQuery = ref('')
const glowX = ref(50)
const glowY = ref(50)

function onHeroMouseMove(e: MouseEvent): void {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const cursorX = ((e.clientX - rect.left) / rect.width) * 100
  const cursorY = ((e.clientY - rect.top) / rect.height) * 100
  // Repel: glow drifts away from cursor like fog pushed by a hand
  glowX.value = 50 + (50 - cursorX) * 0.55
  glowY.value = 50 + (50 - cursorY) * 0.55
}

const expandedFaq = ref<number | null>(null)

const faqs = [
  {
    q: '¿Necesito conocimientos técnicos para usar Abricot?',
    a: 'Para nada. El panel fue diseñado pensando en dueños y encargados de restaurantes, no en ingenieros. Si sabés usar un smartphone, podés configurar tu local en menos de 10 minutos.',
  },
  {
    q: '¿Puedo gestionar varias sucursales desde el mismo panel?',
    a: 'Sí. Una sola cuenta te da visibilidad sobre todos tus locales en tiempo real: reservas, pedidos activos, ocupación por turno y métricas comparativas entre sucursales.',
  },
  {
    q: '¿Qué pasa si el internet se cae durante el servicio?',
    a: 'Usamos colas de mensajes en la nube que retienen los pedidos aunque haya un corte temporal. Cuando la conexión se restablece, todo se sincroniza automáticamente sin pérdida de datos.',
  },
  {
    q: '¿Se integra con mi sistema de punto de venta actual?',
    a: 'Ofrecemos conectores nativos para los sistemas más usados en Argentina y una API REST documentada para integraciones a medida. Nuestro equipo te acompaña en el proceso de migración.',
  },
  {
    q: '¿Hay un período de prueba sin costo?',
    a: 'Sí. Podés registrarte y operar con el plan gratuito sin límite de tiempo para un local. Los planes de pago desbloquean múltiples sucursales, analítica avanzada y soporte prioritario.',
  },
]

function toggleFaq(i: number): void {
  expandedFaq.value = expandedFaq.value === i ? null : i
}

const heroRotatingPhrases = [
  'una reserva',
  'tu mesa ideal',
  'un pedido',
  'tu restaurante favorito',
  'un cliente',
  'tu lugar favorito',
]
</script>

<template>
  <div class="landing-view-wrapper">

    <!-- Navbar -->
    <header class="landing-navbar">
      <img src="/abricot.png" alt="Abricot" class="landing-navbar-logo" />
      <nav class="landing-navbar-actions">
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/app/restaurants"
          class="landing-navbar-cta-button"
        >
          Ir al panel
        </RouterLink>
        <template v-else>
          <RouterLink to="/login" class="landing-navbar-login-link">Iniciar sesión</RouterLink>
          <RouterLink to="/register" class="landing-navbar-register-link">Empezar gratis</RouterLink>
        </template>
      </nav>
    </header>

    <!-- Hero -->
    <section class="landing-hero-section" @mousemove="onHeroMouseMove">
      <!-- Multi-layer repelling glow -->
      <div class="landing-hero-glow-a" aria-hidden="true" :style="{ '--glow-x': glowX + '%', '--glow-y': glowY + '%' }" />
      <div class="landing-hero-glow-b" aria-hidden="true" :style="{ '--glow-x': glowX + '%', '--glow-y': glowY + '%' }" />
      <div class="landing-hero-glow-c" aria-hidden="true" :style="{ '--glow-x': glowX + '%', '--glow-y': glowY + '%' }" />

      <div class="landing-hero-content">
        <!-- Peach — brand mark, replaces chip -->
        <div class="landing-hero-peach-wrapper">
          <svg class="landing-hero-peach-icon" width="44" height="48" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <!-- body -->
            <ellipse cx="22" cy="32" rx="20" ry="16" fill="white" opacity="0.92"/>
            <!-- blush -->
            <ellipse cx="26" cy="30" rx="12" ry="9" fill="rgba(249,115,22,0.18)"/>
            <!-- cleft -->
            <path d="M22 16 C21 19 21 22 22 23.5 C23 22 23 19 22 16Z" fill="rgba(249,115,22,0.38)"/>
            <!-- stem -->
            <path d="M22 16 Q27 8 30 10" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
            <!-- leaf -->
            <path d="M30 10 Q37 5 33 11" fill="white" opacity="0.65"/>
          </svg>
        </div>

        <h1 class="landing-hero-headline">
          Nunca más pierdas<br />
          <RotatingText :phrases="heroRotatingPhrases" />
        </h1>

        <p class="landing-hero-description">
          Abricot centraliza reservas, pedidos y analítica en una sola plataforma cloud,
          para dueños de restaurantes y comensales que exigen lo mejor.
        </p>

        <!-- Search bar (decorative — backend coming soon) -->
        <div class="landing-hero-search-section">
          <p class="landing-hero-search-label">
            <Search :size="13" />
            Explorá restaurantes cerca tuyo
          </p>
          <div class="landing-hero-search-bar">
            <Search :size="16" class="landing-hero-search-icon" />
            <input
              v-model="searchQuery"
              class="landing-hero-search-input"
              placeholder="Buscá tu próxima experiencia gastronómica..."
            />
            <button class="landing-hero-search-button" disabled>
              Buscar
              <ArrowRight :size="14" />
            </button>
          </div>
          <p class="landing-hero-search-coming-soon">Búsqueda disponible próximamente</p>
        </div>

        <div class="landing-hero-cta-group">
          <RouterLink to="/register" class="landing-hero-cta-primary">
            Registrar mi restaurante
            <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink to="/login" class="landing-hero-cta-secondary">
            Ya tengo cuenta
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Value props -->
    <section class="landing-value-props-section">
      <div class="landing-value-props-grid">
        <div class="landing-value-prop-card">
          <div class="landing-value-prop-icon-wrapper"><Zap :size="18" /></div>
          <h3 class="landing-value-prop-title">Alta disponibilidad</h3>
          <p class="landing-value-prop-description">
            Tu canal digital sigue operativo los viernes a la noche, cuando más importa. Sin caídas
            que se traduzcan en pérdida de ingresos.
          </p>
        </div>
        <div class="landing-value-prop-card">
          <div class="landing-value-prop-icon-wrapper"><Package :size="18" /></div>
          <h3 class="landing-value-prop-title">Cero pedidos perdidos</h3>
          <p class="landing-value-prop-description">
            Las colas de mensajes cloud guardan los pedidos aunque el local tenga cortes de internet
            temporales. Nada se pierde en el camino.
          </p>
        </div>
        <div class="landing-value-prop-card">
          <div class="landing-value-prop-icon-wrapper"><TrendingUp :size="18" /></div>
          <h3 class="landing-value-prop-title">Escalabilidad sin servidores</h3>
          <p class="landing-value-prop-description">
            Abrís una nueva sucursal y la plataforma crece con vos. Sin comprar hardware, sin
            preocuparte por la infraestructura.
          </p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="landing-features-section">
      <div class="landing-features-inner">
        <div class="landing-features-header">
          <h2 class="landing-features-section-title">Todo lo que necesita tu restaurante</h2>
          <p class="landing-features-section-description">
            Cinco módulos integrados para profesionalizar tu operación digital de punta a punta.
          </p>
        </div>

        <div class="landing-features-grid">
          <div class="landing-feature-card">
            <div class="landing-feature-card-header">
              <div class="landing-feature-card-icon-wrapper"><LayoutDashboard :size="18" /></div>
              <h3 class="landing-feature-card-title">Dashboard en tiempo real</h3>
            </div>
            <p class="landing-feature-card-description">
              Configurá horarios, cantidad de mesas y capacidad máxima. El sistema bloquea
              automáticamente los bloques que llegan al cupo y evita el overbooking.
            </p>
          </div>

          <div class="landing-feature-card">
            <div class="landing-feature-card-header">
              <div class="landing-feature-card-icon-wrapper"><Calendar :size="18" /></div>
              <h3 class="landing-feature-card-title">Motor de reservas de autoservicio</h3>
            </div>
            <p class="landing-feature-card-description">
              Widget integrable en redes sociales o tu página web. Los clientes eligen fecha y
              hora, el sistema valida disponibilidad y envía la confirmación automática.
            </p>
          </div>

          <div class="landing-feature-card">
            <div class="landing-feature-card-header">
              <div class="landing-feature-card-icon-wrapper"><ShoppingCart :size="18" /></div>
              <h3 class="landing-feature-card-title">Pedidos con seguimiento</h3>
            </div>
            <p class="landing-feature-card-description">
              Menú digital con trazabilidad en tiempo real. El cliente recibe notificaciones
              en cada etapa: "En preparación", "Listo para retirar", "En camino".
            </p>
          </div>

          <div class="landing-feature-card">
            <div class="landing-feature-card-header">
              <div class="landing-feature-card-icon-wrapper"><Target :size="18" /></div>
              <h3 class="landing-feature-card-title">Promociones ad hoc</h3>
            </div>
            <p class="landing-feature-card-description">
              Creá y deshabilitá promociones en el momento que quieras. Notificá clientes por
              email automáticamente para impulsar el tráfico en horas bajas.
            </p>
          </div>
        </div>

        <!-- Feature 5 — full-width highlight -->
        <div class="landing-feature-card--highlight">
          <div class="landing-feature-card-header">
            <div class="landing-feature-card-icon-wrapper"><BarChart3 :size="18" /></div>
            <h3 class="landing-feature-card-title">Analítica predictiva de demanda</h3>
          </div>
          <p class="landing-feature-card-description">
            Procesá los datos históricos de reservas y pedidos para identificar patrones de
            consumo. Reportes visuales de ocupación, ranking de promociones por ingreso y
            sugerencias para optimizar la compra de insumos y la asignación de personal por turno.
          </p>
        </div>
      </div>
    </section>

    <!-- Stats bar -->
    <section class="landing-stats-section">
      <div class="landing-stats-inner">
        <div class="landing-stat-item">
          <span class="landing-stat-number">1.200+</span>
          <span class="landing-stat-label">Restaurantes activos</span>
        </div>
        <div class="landing-stat-divider" aria-hidden="true" />
        <div class="landing-stat-item">
          <span class="landing-stat-number">99.9%</span>
          <span class="landing-stat-label">Uptime garantizado</span>
        </div>
        <div class="landing-stat-divider" aria-hidden="true" />
        <div class="landing-stat-item">
          <span class="landing-stat-number">−40%</span>
          <span class="landing-stat-label">Menos overbooking</span>
        </div>
        <div class="landing-stat-divider" aria-hidden="true" />
        <div class="landing-stat-item">
          <span class="landing-stat-number">&lt; 3 min</span>
          <span class="landing-stat-label">Onboarding inicial</span>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="landing-faq-section">
      <div class="landing-faq-inner">
        <div class="landing-faq-header">
          <h2 class="landing-faq-title">Preguntas frecuentes</h2>
          <p class="landing-faq-subtitle">Todo lo que necesitás saber antes de empezar.</p>
        </div>

        <div class="landing-faq-list">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="landing-faq-item"
            :class="{ 'landing-faq-item--open': expandedFaq === i }"
            @click="toggleFaq(i)"
          >
            <div class="landing-faq-question">
              <span class="landing-faq-question-text">{{ faq.q }}</span>
              <ChevronDown class="landing-faq-chevron" :size="18" />
            </div>
            <Transition name="landing-faq">
              <div v-if="expandedFaq === i" class="landing-faq-answer">
                <p>{{ faq.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="landing-final-cta-section">
      <div class="landing-final-cta-glow" aria-hidden="true" />
      <div class="landing-final-cta-inner">
        <div class="landing-final-cta-badge">
          <svg width="14" height="15" viewBox="0 0 44 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="22" cy="32" rx="20" ry="16" fill="white" opacity="0.92"/>
            <ellipse cx="26" cy="30" rx="12" ry="9" fill="rgba(249,115,22,0.18)"/>
            <path d="M22 16 C21 19 21 22 22 23.5 C23 22 23 19 22 16Z" fill="rgba(249,115,22,0.38)"/>
            <path d="M22 16 Q27 8 30 10" stroke="white" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85"/>
            <path d="M30 10 Q37 5 33 11" fill="white" opacity="0.65"/>
          </svg>
          Abricot
        </div>
        <h2 class="landing-final-cta-title">Empezá a profesionalizar<br />tu restaurante hoy</h2>
        <p class="landing-final-cta-description">
          Registrate gratis. Sin tarjeta de crédito. Configuración en menos de 10 minutos.
        </p>
        <div class="landing-final-cta-actions">
          <RouterLink to="/register" class="landing-final-cta-button">
            Crear cuenta gratis
            <ArrowRight :size="16" />
          </RouterLink>
          <RouterLink to="/login" class="landing-final-cta-secondary">
            Ya tengo cuenta
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <img src="/abricot.png" alt="Abricot" class="landing-footer-logo" />
      <span class="landing-footer-copyright">© 2026 Abricot · SaaS B2B para gastronomía · Argentina</span>
    </footer>

  </div>
</template>

<style src="./styles/LandingView.css" scoped></style>
