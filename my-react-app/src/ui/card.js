// src/ui/card.js
import React from 'react'
import { cn } from '../lib/utils'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-lg border shadow-sm transition-colors p-4',
        // Light mode
        'border-gray-200 bg-white text-gray-900',
        // Dark mode
        'dark:border-gray-700 dark:bg-[hsl(var(--muted)/0.5)] dark:text-white dark:backdrop-blur-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }) {
  return (
    <div
      className={cn('mb-2 flex items-center justify-between', className)}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }) {
  return (
    <h2
      className={cn('text-base font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }) {
  return (
    <p
      className={cn('text-sm opacity-80', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }) {
  return (
    <div className={cn('text-sm', className)} {...props} />
  )
}
