import { ref, onMounted, onUnmounted } from 'vue'

interface Particle {
  hx: number; hy: number
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  phase: number; speed: number
}

export function useSmokeCanvas() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let raf: number | null = null
  let t = 0
  let particles: Particle[] = []
  const mouse = { x: -1000, y: -1000 }

  function initParticles(W: number, H: number) {
    const NUM = 18
    particles = Array.from({ length: NUM }, (_, i) => {
      const rx = 0.22 + Math.random() * 0.56
      const ry = 0.15 + Math.random() * 0.55
      return {
        hx: rx, hy: ry,
        x: rx * W, y: ry * H,
        vx: 0, vy: 0,
        size: 90 + Math.random() * 140,
        opacity: 0.035 + Math.random() * 0.05,
        phase: Math.random() * Math.PI * 2 + i,
        speed: 0.15 + Math.random() * 0.2,
      }
    })
  }

  function animate(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)
    t += 0.012

    for (const p of particles) {
      const tx = p.hx * W + Math.sin(t * p.speed + p.phase) * 28
      const ty = p.hy * H + Math.cos(t * p.speed * 0.7 + p.phase) * 18
      const dx = p.x - mouse.x
      const dy = p.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const repelR = 200
      if (dist < repelR && mouse.x > 0) {
        const force = Math.pow((repelR - dist) / repelR, 1.6) * 4.5
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
      }
      p.vx += (tx - p.x) * 0.012
      p.vy += (ty - p.y) * 0.012
      p.vx *= 0.88
      p.vy *= 0.88
      p.x += p.vx
      p.y += p.vy

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size)
      g.addColorStop(0, `rgba(249,115,22,${p.opacity})`)
      g.addColorStop(0.4, `rgba(200,80,10,${p.opacity * 0.4})`)
      g.addColorStop(1, `rgba(0,0,0,0)`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    }

    raf = requestAnimationFrame(() => animate(canvas, ctx))
  }

  function onMouseMove(e: MouseEvent) {
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouse.x = e.clientX - rect.left
    mouse.y = e.clientY - rect.top
  }

  function onMouseLeave() {
    mouse.x = -1000
    mouse.y = -1000
  }

  onMounted(() => {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      initParticles(canvas.width, canvas.height)
    }

    window.addEventListener('resize', resize)
    canvas.parentElement?.addEventListener('mousemove', onMouseMove)
    canvas.parentElement?.addEventListener('mouseleave', onMouseLeave)
    resize()
    animate(canvas, ctx)

    onUnmounted(() => {
      if (raf !== null) cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      canvas.parentElement?.removeEventListener('mousemove', onMouseMove)
      canvas.parentElement?.removeEventListener('mouseleave', onMouseLeave)
    })
  })

  return { canvasRef }
}
