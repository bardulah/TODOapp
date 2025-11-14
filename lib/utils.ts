import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return 'P1 - Urgent'
    case 2: return 'P2 - High'
    case 3: return 'P3 - Medium'
    case 4: return 'P4 - Low'
    default: return 'P4 - Low'
  }
}

export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return 'text-red-600 dark:text-red-400'
    case 2: return 'text-orange-600 dark:text-orange-400'
    case 3: return 'text-yellow-600 dark:text-yellow-400'
    case 4: return 'text-blue-600 dark:text-blue-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
