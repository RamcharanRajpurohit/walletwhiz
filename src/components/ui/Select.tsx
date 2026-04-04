import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full rounded-xl border bg-[var(--surface-strong)] px-4 py-3 text-base text-[var(--text-base)] transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]',
          error ? 'border-[var(--danger)]' : 'border-[var(--border-input)]',
          className
        )}
        {...props}
      >
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
export default Select
