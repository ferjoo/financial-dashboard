import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadForm, { type UploadType } from '@/components/dashboard/UploadForm'
import { FileText } from 'lucide-react'

const REPORT_TYPES: { value: UploadType; label: string }[] = [
  { value: 'financial', label: 'Financial Report' },
  { value: 'affiliate', label: 'Affiliate Report' },
]

const FINANCIAL_COLUMNS = [
  'Transaction ID', 'Date', 'Amount', 'Transaction Type',
  'Owner Type', 'Owner Name', 'Currency',
]

const AFFILIATE_COLUMNS = [
  'Aff. ID', 'Affiliate Username', 'Affiliate Status',
  'FTD Count', 'FTD Amount', 'Currency',
]

export default function UploadPage() {
  const navigate = useNavigate()
  const [uploadType, setUploadType] = useState<UploadType>('financial')

  function handleSuccess(reportId: string) {
    if (uploadType === 'affiliate') {
      navigate(`/affiliates/reports/${reportId}`)
    } else {
      navigate(`/reports/${reportId}`)
    }
  }

  const columns = uploadType === 'affiliate' ? AFFILIATE_COLUMNS : FINANCIAL_COLUMNS

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Upload CSV Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Select the report type and upload a CSV file to process.
        </p>
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3">
          Demo mode: files are not sent anywhere. Uploading generates an extra week of sample data so you can see the full flow.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-2">
          Report Type
        </label>
        <select
          id="report-type"
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as UploadType)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          {REPORT_TYPES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <UploadForm onSuccess={handleSuccess} uploadType={uploadType} />

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Expected CSV Format</h3>
        <p className="text-xs text-gray-500">
          {uploadType === 'affiliate'
            ? 'Comma-delimited file with affiliate performance data including:'
            : 'Tab-delimited or comma-delimited file with headers including:'}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {columns.map((col) => (
            <span
              key={col}
              className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600 font-mono"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
