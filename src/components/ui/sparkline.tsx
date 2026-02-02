'use client'

import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: 'auto' | 'green' | 'red' | 'blue' | 'current'
  showArea?: boolean
  showEndpoint?: boolean
  className?: string
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = 'auto',
  showArea = true,
  showEndpoint = true,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const padding = 2
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Generate points
  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth
    const y = padding + innerHeight - ((value - min) / range) * innerHeight
    return { x, y }
  })

  // Line path
  const linePath = points
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

  // Area path (closes the shape at the bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${height - padding} L ${padding} ${height - padding} Z`

  // Determine color based on trend
  const trend = data[data.length - 1] - data[0]
  const getColors = () => {
    switch (color) {
      case 'green':
        return { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)' }
      case 'red':
        return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }
      case 'blue':
        return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)' }
      case 'current':
        return { stroke: 'currentColor', fill: 'currentColor' }
      case 'auto':
      default:
        if (trend > 0) return { stroke: '#22c55e', fill: 'rgba(34, 197, 94, 0.1)' }
        if (trend < 0) return { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.1)' }
        return { stroke: '#6b7280', fill: 'rgba(107, 114, 128, 0.1)' }
    }
  }

  const colors = getColors()
  const lastPoint = points[points.length - 1]

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
    >
      {/* Area fill */}
      {showArea && <path d={areaPath} fill={colors.fill} opacity={color === 'current' ? 0.1 : 1} />}

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Endpoint */}
      {showEndpoint && <circle cx={lastPoint.x} cy={lastPoint.y} r={2.5} fill={colors.stroke} />}
    </svg>
  )
}

/**
 * Larger sparkline with labels for detailed view
 */
interface DetailedSparklineProps extends SparklineProps {
  label?: string
  value?: number
  unit?: string
}

export function DetailedSparkline({
  data,
  label,
  value,
  unit = '',
  ...props
}: DetailedSparklineProps) {
  return (
    <div className="flex items-center gap-3">
      <Sparkline data={data} width={100} height={32} {...props} />
      {(label || value !== undefined) && (
        <div className="text-right">
          {value !== undefined && (
            <div className="text-lg font-semibold">
              {value}
              {unit && <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>}
            </div>
          )}
          {label && <div className="text-xs text-muted-foreground">{label}</div>}
        </div>
      )}
    </div>
  )
}
