export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-IN', {  // <-- fixed here
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export const formatMonth = (date: Date | string): string => {
  return new Intl.DateTimeFormat('en-IN', {  // <-- fixed here
    year: 'numeric',
    month: 'long',
  }).format(new Date(date))
}
