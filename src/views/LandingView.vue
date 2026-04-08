<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore"

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <!-- Navbar -->
    <header class="sticky top-0 z-40 flex items-center justify-between px-8 py-4 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-sm">
      <img src="/abricot.png" alt="Abricot" class="h-9 w-auto" />
      <div class="flex gap-3">
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/app/restaurants"
          class="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors"
        >
          Ir al panel
        </RouterLink>
        <template v-else>
          <RouterLink
            to="/login"
            class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Iniciar sesión
          </RouterLink>
          <RouterLink
            to="/register"
            class="px-4 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-400 rounded-lg transition-colors"
          >
            Empezar gratis
          </RouterLink>
        </template>
      </div>
    </header>

    <!-- Hero -->
    <section class="px-6 py-28 max-w-5xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 font-medium mb-8">
        SaaS B2B para gastronomía
      </div>
      <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
        Tu restaurante nunca más<br />
        <span class="text-orange-400">pierde una reserva</span>
      </h1>
      <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Abricot centraliza reservas, pedidos y analítica en una sola plataforma cloud. Eliminá las
        planillas de papel, los WhatsApps manuales y el overbooking de una vez por todas.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <RouterLink
          to="/register"
          class="px-7 py-3.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Registrar mi restaurante
        </RouterLink>
        <RouterLink
          to="/login"
          class="px-7 py-3.5 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold rounded-xl transition-colors text-base"
        >
          Ya tengo cuenta
        </RouterLink>
      </div>
    </section>

    <!-- Problem / Value props -->
    <section class="border-t border-gray-800 px-8 py-16">
      <div class="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div class="text-2xl mb-3">⚡</div>
          <h3 class="font-semibold text-white mb-2">Alta disponibilidad</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            Tu canal digital sigue operativo los viernes a la noche, cuando más importa. Sin caídas
            que se traduzcan en pérdida de ingresos.
          </p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div class="text-2xl mb-3">📦</div>
          <h3 class="font-semibold text-white mb-2">Cero pedidos perdidos</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            Las colas de mensajes cloud guardan los pedidos aunque el local tenga cortes de internet
            temporales. Nada se pierde en el camino.
          </p>
        </div>
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div class="text-2xl mb-3">📈</div>
          <h3 class="font-semibold text-white mb-2">Escalabilidad sin servidores</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            Abrís una nueva sucursal y la plataforma crece con vos. Sin comprar hardware, sin
            preocuparte por la infraestructura.
          </p>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="border-t border-gray-800 px-8 py-20">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-3xl font-bold text-white mb-3">Todo lo que necesita tu restaurante</h2>
          <p class="text-gray-400 max-w-xl mx-auto">
            Cinco módulos integrados para profesionalizar tu operación digital de punta a punta.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Feature 1 -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-7">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                🏠
              </div>
              <h3 class="font-semibold text-white">Dashboard en tiempo real</h3>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Configurá horarios, cantidad de mesas y capacidad máxima. El sistema bloquea
              automáticamente los bloques que llegan al cupo y evita el overbooking sin margen
              de error.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-7">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                📅
              </div>
              <h3 class="font-semibold text-white">Motor de reservas de autoservicio</h3>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Widget integrable en redes sociales o tu página web. Los clientes eligen fecha y
              hora, el sistema valida disponibilidad y envía la confirmación automática por email.
              Sin intervención del staff.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-7">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                🛒
              </div>
              <h3 class="font-semibold text-white">Pedidos con seguimiento</h3>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Menú digital para takeout con trazabilidad en tiempo real. El cliente recibe
              notificaciones en cada etapa: "En preparación", "Listo para retirar", "En camino".
              Menos llamadas, menos carga operativa.
            </p>
          </div>

          <!-- Feature 4 -->
          <div class="bg-gray-900 border border-gray-800 rounded-2xl p-7">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                🎯
              </div>
              <h3 class="font-semibold text-white">Promociones ad hoc</h3>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed">
              Creá y deshabilité promociones en el momento que quieras. Los clientes las ven en
              la app y podés notificarlos por email de manera automática para impulsar el tráfico
              en horas bajas.
            </p>
          </div>
        </div>

        <!-- Feature 5 full width -->
        <div class="mt-6 bg-gradient-to-r from-orange-500/5 to-orange-500/10 border border-orange-500/20 rounded-2xl p-7">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl">
              📊
            </div>
            <h3 class="font-semibold text-white">Analítica predictiva de demanda</h3>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed max-w-2xl">
            Procesá los datos históricos de reservas y pedidos para identificar patrones de
            consumo. Reportes visuales de ocupación, ranking de promociones por ingreso y
            sugerencias para optimizar la compra de insumos y la asignación de personal por turno.
          </p>
        </div>
      </div>
    </section>

    <!-- CTA final -->
    <section class="border-t border-gray-800 px-8 py-24 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">
        Empezá a profesionalizar tu restaurante hoy
      </h2>
      <p class="text-gray-400 mb-8 max-w-md mx-auto">
        Registrate gratis y gestioná tus locales desde un panel centralizado en la nube.
      </p>
      <RouterLink
        to="/register"
        class="inline-block px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-colors text-base"
      >
        Crear cuenta gratis
      </RouterLink>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-800 px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <img src="/abricot.png" alt="Abricot" class="h-8 w-auto" />
      <span class="text-gray-500 text-sm">© 2026 Abricot · SaaS B2B para gastronomía · Argentina</span>
    </footer>
  </div>
</template>
