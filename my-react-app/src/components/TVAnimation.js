import React, { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

function TVAnimation({ onAnimationComplete }) {
  const [animationState, setAnimationState] = useState('initial')

  useEffect(() => {
    // Initial state
    setTimeout(() => {
      console.log('Expanding')
      setAnimationState('expanding')
    }, 1000)
    
    // Hold expanded state
    setTimeout(() => {
      console.log('Holding')
      setAnimationState('holding')
    }, 2000)
    
    // Start sliding off screen
    setTimeout(() => {
      console.log('Separating')
      setAnimationState('separating')
    }, 5000)
    
    // Complete
    setTimeout(() => {
      console.log('Complete')
      setAnimationState('complete')
      onAnimationComplete()
    }, 6000)
  }, [])

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black",
      animationState === 'complete' && 'hidden'
    )}>
      <div className={cn(
        "flex w-full transition-all duration-1000",
        animationState === 'initial' && 'h-6 opacity-0',
        (animationState === 'expanding' || animationState === 'holding') && 'h-screen opacity-100',
        animationState === 'separating' && 'h-screen opacity-100 translate-x-full'
      )}>
        <div className="w-1/7 bg-yellow-300" />
        <div className="w-1/7 bg-cyan-300" />
        <div className="w-1/7 bg-lime-400" />
        <div className="w-1/7 bg-fuchsia-500" />
        <div className="w-1/7 bg-red-500" />
        <div className="w-1/7 bg-blue-600" />
        <div className="w-1/7 bg-black" />
      </div>
    </div>
  )
}

export default TVAnimation
