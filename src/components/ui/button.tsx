import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { buttonClass, type ButtonSize, type ButtonVariant } from './button-class'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={buttonClass(variant, size, className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'
