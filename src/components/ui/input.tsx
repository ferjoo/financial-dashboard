import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900',
      'placeholder:text-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500',
      'disabled:bg-gray-50 disabled:cursor-not-allowed',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
