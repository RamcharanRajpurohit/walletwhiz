'use client'

import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface ExportButtonProps {
  data: any[]
  filename: string
}

export default function ExportButton({ data, filename }: ExportButtonProps) {
  const handleExport = () => {
    try {
      const csv = convertToCSV(data)
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Report exported successfully!')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return ''
    
    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    )
    
    return [headers, ...rows].join('\n')
  }

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
    >
      <Download className="h-4 w-4" />
      <span>Export CSV</span>
    </button>
  )
}