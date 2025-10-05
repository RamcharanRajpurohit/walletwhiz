import { InputHTMLAttributes, forwardRef } from 'react'
import Input from './Input'

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ ...props }, ref) => {
    return <Input ref={ref} type="date" {...props} />
  }
)

DatePicker.displayName = 'DatePicker'
export default DatePicker