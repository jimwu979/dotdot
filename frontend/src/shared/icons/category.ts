import type { App, Component } from 'vue'
import {
  Phone, Smartphone, CupSoda, Wine, Martini,
  Cat, PawPrint, Bone, Zap, Hamburger,
  Utensils, Apple, Cookie, Milk, Car,
  CarFront, Droplet, Beer, LayoutDashboard, GraduationCap,
  Book, BookOpen, Trash2, House, Building2,
  Bus, TrainFront, Plane, Bike, Ship,
  Fuel, CircleParking, MapPin, Coffee, CakeSlice,
  Pizza, IceCreamBowl, Soup, ShoppingCart, ShoppingBag,
  Shirt, Gift, Baby, Gamepad2, Dumbbell,
  Music, Film, Ticket, HeartPulse, Pill,
  Stethoscope, Hospital, BriefcaseBusiness, WalletCards, Banknote,
  ReceiptText, PiggyBank, CircleDollarSign, Dog, Flower2,
  Receipt, TrendingUp,
} from '@lucide/vue'

export const categoryIcons = {
  Phone, Smartphone, CupSoda, Wine, Martini,
  Cat, PawPrint, Bone, Zap, Hamburger,
  Utensils, Apple, Cookie, Milk, Car,
  CarFront, Droplet, Beer, LayoutDashboard, GraduationCap,
  Book, BookOpen, Trash2, House, Building2,
  Bus, TrainFront, Plane, Bike, Ship,
  Fuel, CircleParking, MapPin, Coffee, CakeSlice,
  Pizza, IceCreamBowl, Soup, ShoppingCart, ShoppingBag,
  Shirt, Gift, Baby, Gamepad2, Dumbbell,
  Music, Film, Ticket, HeartPulse, Pill,
  Stethoscope, Hospital, BriefcaseBusiness, WalletCards, Banknote,
  ReceiptText, PiggyBank, CircleDollarSign, Dog, Flower2,
  Receipt, TrendingUp,
} satisfies Record<string, Component>

export type CategoryIconName = keyof typeof categoryIcons

export const categoryIconList: CategoryIconName[] = [
  'Utensils', 'Hamburger', 'Pizza', 'Soup', 'Apple',
  'Cookie', 'CakeSlice', 'IceCreamBowl', 'Milk', 'CupSoda',
  'Coffee', 'Beer', 'Wine', 'Martini', 'Ticket',
  'Cat', 'Dog', 'PawPrint', 'Bone', 'Flower2',
  'Car', 'CarFront', 'Bus', 'Bike', 'Fuel',
  'TrainFront', 'Plane', 'Ship', 'CircleParking', 'MapPin',
  'House', 'Building2', 'GraduationCap', 'Book', 'BookOpen',
  'ShoppingCart', 'ShoppingBag', 'Shirt', 'Gift', 'ReceiptText',
  'Baby', 'Gamepad2', 'Dumbbell', 'Music', 'Film',
  'HeartPulse', 'Pill', 'Stethoscope', 'Hospital', 'Droplet',
  'BriefcaseBusiness', 'WalletCards', 'Banknote', 'PiggyBank', 'CircleDollarSign',
  'Phone', 'Smartphone', 'Zap', 'LayoutDashboard', 'Trash2',
]

export default {
  install(app: App) {
    Object.entries(categoryIcons).forEach(([name, icon]) => {
      app.component(name, icon)
    })
  },
}
