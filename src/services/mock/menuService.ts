import type { MenuItem } from '@/types/index'

const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Pizza Casera',
    description: 'Masa artesanal con salsa pomodoro, mozzarella fresca y albahaca. Cocinada en horno de barro.',
    price: 3200,
    category: 'Principales',
  },
  {
    id: '2',
    name: 'Hamburguesa Clásica',
    description: 'Medallón de 200g de res, cheddar derretido, lechuga, tomate y salsa de la casa.',
    price: 2800,
    category: 'Principales',
  },
  {
    id: '3',
    name: 'Empanadas (x4)',
    description: 'Rellenas de carne cortada a cuchillo con aceitunas y huevo. Horneadas al momento.',
    price: 1600,
    category: 'Entradas',
  },
  {
    id: '4',
    name: 'Gaseosa 500ml',
    description: 'Coca-Cola, Sprite o Fanta. Bien fría.',
    price: 800,
    category: 'Bebidas',
  },
]

export function fetchMenuItems(): Promise<MenuItem[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_MENU_ITEMS), 800)
  })
}
