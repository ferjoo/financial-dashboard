import { Globe, Construction } from 'lucide-react'

export default function OnlineDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-500" />
          Online Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Website channel reporting.</p>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-16 text-center">
        <Construction className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-700">Online reporting coming soon</p>
        <p className="text-xs text-gray-400 mt-1">
          Upload your online channel CSV to get started.
        </p>
      </div>
    </div>
  )
}
