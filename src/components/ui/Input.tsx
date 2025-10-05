import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'block w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 text-base transition-all',
          error ? 'border-rose-300' : 'border-yellow-200',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'
export default Input