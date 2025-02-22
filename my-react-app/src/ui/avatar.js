// src/ui/avatar.js
import React from 'react'
import { cn } from '../lib/utils'

export function Avatar({ src, alt, className, ...props }) {
  return (
    <div className={cn('inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}>
      <img
        className="h-full w-full object-cover"
        src={src}
        alt={alt}
        {...props}
      />
    </div>
  )
}
