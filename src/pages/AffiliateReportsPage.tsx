import { formatAffiliatePeriod } from '@/lib/period'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAffiliateReports, useDeleteAffiliateReport } from '@/hooks/use-affiliate-reports'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload, ChevronRight, RefreshCw, Trash2 } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AffiliateReportsPage() {
  const { data: reports, isLoading, isError, refetch } = useAffiliateReports()
  const deleteReport = useDeleteAffiliateReport()
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Affiliate Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {reports ? `${reports.length} report${reports.length !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Link to="/upload">
            <Button>
              <Upload className="w-4 h-4" />
              Upload CSV
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 text-sm">Failed to load reports.</p>
          <Button variant="secondary" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((report) => {
            const isConfirming = confirmingId === report.reportId
            const isDeleting = deleteReport.isPending && deleteReport.variables === report.reportId
            return (
              <div
                key={report.reportId}
                className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-gray-500" />
                </div>
                <Link to={`/affiliates/reports/${report.reportId}`} className="flex-1 min-w-0 hover:opacity-80 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
                  <p className="text-sm text-gray-800 font-medium truncate">
                    {formatAffiliatePeriod(report.reportId)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    <span className="font-mono">{report.reportId}</span> · uploaded {formatDateTime(report.createdAt)}
                  </p>
                </Link>
                {isConfirming ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">Delete?</span>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => {
                        deleteReport.mutate(report.reportId, {
                          onSuccess: () => setConfirmingId(null),
                        })
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Yes'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isDeleting}
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="primary">View</Badge>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => setConfirmingId(report.reportId)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900">No affiliate reports yet</h3>
          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
            Upload your first affiliate performance CSV to get started.
          </p>
          <Link to="/upload">
            <Button className="mt-4">
              <Upload className="w-4 h-4" />
              Upload your first CSV
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
