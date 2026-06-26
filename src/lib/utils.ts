import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
}

export function formatTime(dateStr: string): string {
  // Soporta strings de solo hora "09:00:00" o "09:00" además de ISO completos
  const normalized = /^\d{2}:\d{2}/.test(dateStr) && !dateStr.includes('T')
    ? `2000-01-01T${dateStr}`
    : dateStr
  return new Date(normalized).toLocaleTimeString('es-CL', {
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateTime(dateStr: string): string {
  return `${formatDate(dateStr)} a las ${formatTime(dateStr)}`
}

export function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    hatch_sedan: 'Hatch / Sedán',
    suv_camioneta: 'SUV / Camioneta',
    pickup_xl: 'Pickup XL',
  }
  return labels[type] ?? type
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    in_progress: 'En progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  }
  return labels[status] ?? status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}
