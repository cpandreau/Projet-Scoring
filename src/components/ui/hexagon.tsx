import { cn } from '@/lib/utils'

interface HexagonProps {
  className?: string
  /** Filled shape or outline only */
  filled?: boolean
  /** Show internal bars like the logo */
  withBars?: boolean
  /** Stroke width for outline mode */
  strokeWidth?: number
}

/**
 * Decorative hexagon SVG component
 * Can be used as filled shape or outline, with optional internal bars
 */
export function Hexagon({
  className,
  filled = false,
  withBars = false,
  strokeWidth = 2,
}: HexagonProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn('text-current', className)}
      aria-hidden="true"
    >
      <polygon
        points="50,2 95,25 95,75 50,98 5,75 5,25"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      {withBars && (
        <>
          {/* Internal balance bars like the BILANTIA logo */}
          <line
            x1="30"
            y1="60"
            x2="50"
            y2="40"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1="50"
            y1="40"
            x2="70"
            y2="60"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <circle cx="50" cy="40" r="4" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

/**
 * Animated floating hexagon for decorative backgrounds
 */
interface FloatingHexagonProps extends HexagonProps {
  /** Animation delay in seconds */
  delay?: number
  /** Animation duration in seconds */
  duration?: number
  /** Size in pixels or CSS value */
  size?: string | number
}

export function FloatingHexagon({
  delay = 0,
  duration = 6,
  size = 100,
  className,
  ...props
}: FloatingHexagonProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size

  return (
    <div
      className={cn('animate-float', className)}
      style={{
        width: sizeValue,
        height: sizeValue,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      <Hexagon {...props} className="w-full h-full" />
    </div>
  )
}
