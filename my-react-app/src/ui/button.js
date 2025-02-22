// src/ui/button.js
import React from 'react'
import { cn } from '../lib/utils'

export function Button({ variant = 'default', className, ...props }) {
  const variants = {
    default:
      'inline-flex items-center justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400',
      outline: cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium bg-transparent',
        // Light mode
        'border-gray-200 text-gray-700 hover:bg-gray-100',
        // Dark mode
        'dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800',
        // Focus ring
        'focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700'
      ),
    // Add more variants if needed
  }

  return (
    <button
      className={cn(variants[variant], className)}
      {...props}
    />
  )
}
