import React from 'react'
import { CheckCircle } from 'lucide-react'

interface CompletionBannerProps {
  message: string
}

export default function CompletionBanner({ message }: CompletionBannerProps) {
  return (
    <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium px-4 py-2.5 rounded-lg mt-4">
      <CheckCircle size={15} className="text-emerald-600 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
