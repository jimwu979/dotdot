import type { App, Component } from 'vue'
import {
  Banknote,
  Bus,
  CircleDollarSign,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PawPrint,
  Plane,
  Receipt,
  Shirt,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Utensils,
} from '@lucide/vue'

const categoryIcons = {
  Banknote,
  Bus,
  CircleDollarSign,
  Coffee,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  PawPrint,
  Plane,
  Receipt,
  Shirt,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Utensils,
} satisfies Record<string, Component>

export type CategoryIconName = keyof typeof categoryIcons

export default {
  install(app: App) {
    Object.entries(categoryIcons).forEach(([name, icon]) => {
      app.component(name, icon)
    })
  },
}
