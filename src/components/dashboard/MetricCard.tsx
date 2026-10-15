import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ColorKey = 'primary' | 'accent' | 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red'

interface MetricCardProps {
  title: string
  value: string
  icon: ReactNode
  color: ColorKey
  description?: string
  valueClassName?: string
}

const colorMap: Record<ColorKey, { icon: string }> = {
  primary: { icon: 'text-primary-600 bg-primary-50' },
  accent: { icon: 'text-accent-600 bg-accent-50' },
  blue: { icon: 'text-blue-600 bg-blue-50' },
  green: { icon: 'text-green-600 bg-green-50' },
  orange: { icon: 'text-orange-600 bg-orange-50' },
  purple: { icon: 'text-purple-600 bg-purple-50' },
  cyan: { icon: 'text-cyan-600 bg-cyan-50' },
  red: { icon: 'text-red-600 bg-red-50' },
}

export default function MetricCard({ title, value, icon, color, description, valueClassName }: MetricCardProps) {
  const colors = colorMap[color]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs sm:text-sm text-gray-500 truncate">{title}</p>
        <div className={cn('rounded-md p-1.5 shrink-0 [&_svg]:w-4 [&_svg]:h-4', colors.icon)} aria-hidden="true">
          {icon}
        </div>
      </div>
      {/* Values never truncate: a clipped amount is worse than a wrapped one */}
      <p className={cn('text-base sm:text-xl xl:text-2xl font-semibold mt-2 tabular-nums break-words leading-tight', valueClassName ?? 'text-gray-900')}>
        {value}
      </p>
      {description && (
        <p className="text-[11px] sm:text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  )
}

