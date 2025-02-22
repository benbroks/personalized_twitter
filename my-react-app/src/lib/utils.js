import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to conditionally join classNames together, 
 * merging tailwind classes properly when needed.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
