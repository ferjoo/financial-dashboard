import { useState, useRef, type DragEvent } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUploadCsv } from '@/hooks/use-reports'
import { useUploadAffiliateCsv } from '@/hooks/use-affiliate-reports'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

export type UploadType = 'financial' | 'affiliate'

interface UploadFormProps {
  onSuccess?: (reportId: string) => void
  uploadType?: UploadType
}

export default function UploadForm({ onSuccess, uploadType = 'financial' }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const financialUpload = useUploadCsv()
  const affiliateUpload = useUploadAffiliateCsv()
  const { toast } = useToast()

  const upload = uploadType === 'affiliate' ? affiliateUpload : financialUpload

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped)
    } else {
      toast('Please select a CSV file', 'error')
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  // Demo: lets visitors try the flow without having a CSV at hand. Headers only, no real rows.
  function pickSampleFile() {
    const header = uploadType === 'affiliate'
      ? 'Partner ID,Partner Name,Partner Status,First purchases,First purchase value,Currency\n'
      : 'Transaction ID,Date,Amount,Transaction Type,Owner Type,Owner Name,Currency\n'
    setFile(new File([header], uploadType === 'affiliate' ? 'sample-partners.csv' : 'sample-week.csv', { type: 'text/csv' }))
  }

  async function handleUpload() {
    if (!file) return
    try {
      const result = await upload.mutateAsync(file)
      toast('Demo mode: your file stayed in the browser and a sample report was generated.', 'success')
      setFile(null)
      onSuccess?.(result.reportId)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      toast(message, 'error')
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Choose a CSV file to upload"
        className={cn(
          'rounded-lg border-2 border-dashed p-6 sm:p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors bg-white',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {dragOver ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
          </p>
          <p className="text-xs text-gray-500 mt-1">or click to browse</p>
        </div>
      </div>

      {!file && (
        <button
          type="button"
          onClick={pickSampleFile}
          className="w-full text-sm text-primary-700 hover:text-primary-800 font-medium inline-flex items-center justify-center gap-1.5 rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          No CSV at hand? Use a sample file
        </button>
      )}

      {file && (
        <div className="rounded-lg border border-gray-200 bg-white p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-primary-50 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null) }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Remove selected file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {upload.isError && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Upload failed. Please try again.</span>
        </div>
      )}

      {upload.isSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Sample report generated. Nothing left your browser.</span>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || upload.isPending}
        className="w-full"
        size="lg"
      >
        {upload.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload CSV
          </>
        )}
      </Button>
    </div>
  )
}
