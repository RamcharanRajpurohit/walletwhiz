import { Category } from '@/types/category'
import { UtensilsCrossed, Plane, FileText, ShoppingBag, Clapperboard, HeartPulse, BookOpen, Package } from 'lucide-react'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food',          name: 'Food & Dining',    icon: UtensilsCrossed, color: '#f97316' },
  { id: 'travel',        name: 'Travel',            icon: Plane,           color: '#3b82f6' },
  { id: 'bills',         name: 'Bills & Utilities', icon: FileText,        color: '#ef4444' },
  { id: 'shopping',      name: 'Shopping',          icon: ShoppingBag,     color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment',     icon: Clapperboard,    color: '#8b5cf6' },
  { id: 'health',        name: 'Health & Fitness',  icon: HeartPulse,      color: '#10b981' },
  { id: 'education',     name: 'Education',         icon: BookOpen,        color: '#6366f1' },
  { id: 'others',        name: 'Others',            icon: Package,         color: '#64748b' },
]
