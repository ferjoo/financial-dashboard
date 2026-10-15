import { cn } from '@/lib/utils'

const variants = {
  primary: 'bg-primary-50 text-primary-700',
  secondary: 'bg-gray-100 text-gray-600',
  success: 'bg-green-50 text-green-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-yellow-50 text-yellow-700',
  accent: 'bg-accent-50 text-accent-700',
} as const

interface BadgeProps {
  children: React.ReactNode
  variant?: keyof typeof variants
  className?: string
}

export function Badge({ children, variant = 'secondary', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
