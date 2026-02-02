'use client'

import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
  duration?: number
  delay?: number
  decimals?: number
  easing?: 'linear' | 'easeOut' | 'easeInOut'
}

/**
 * Hook for animating a number counting up from 0 to target
 * Respects prefers-reduced-motion
 */
export function useCountUp(
  target: number,
  start: boolean = true,
  options: UseCountUpOptions = {}
) {
  const { duration = 1500, delay = 0, decimals = 1, easing = 'easeOut' } = options
  const [count, setCount] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!start) {
      setCount(0)
      setIsComplete(false)
      return
    }

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setCount(target)
      setIsComplete(true)
      return
    }

    const timeout = setTimeout(() => {
      let startTime: number | null = null

      const easingFunctions = {
        linear: (t: number) => t,
        easeOut: (t: number) => 1 - Math.pow(1 - t, 4),
        easeInOut: (t: number) =>
          t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
      }

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        const easedProgress = easingFunctions[easing](progress)
        const currentValue = easedProgress * target

        setCount(currentValue)

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        } else {
          setIsComplete(true)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, start, duration, delay, easing])

  // Format the count with specified decimals
  const formattedCount = count.toFixed(decimals)

  return { count, formattedCount, isComplete }
}
