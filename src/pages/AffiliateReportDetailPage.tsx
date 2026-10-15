import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Hash, DollarSign, Users, Trash2, ArrowLeft, ArrowUpDown } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import { Button } from '@/components/ui/button'
import { useAffiliateReport, useDeleteAffiliateReport } from '@/hooks/use-affiliate-reports'
import { useCurrency } from '@/context/currency'
import { useToast } from '@/components/ui/toast'
import { formatAffiliatePeriod } from '@/lib/period'
import type { AffiliateData } from '@/types/api'

type SortKey = 'username' | 'playerRegistrations' | 'ftdCount' | 'ftdAmount'
type SortDir = 'asc' | 'desc'

export default function AffiliateReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const { data: report, isLoading } = useAffiliateReport(reportId ?? '')
  const deleteReport = useDeleteAffiliateReport()
  const { fmt: format } = useCurrency()
  const { toast } = useToast()
  const [sortKey, setSortKey] = useState<SortKey>('ftdAmount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const affiliates = useMemo(() => {
    if (!report?.affiliates) return []
    const list = Object.values(report.affiliates) as AffiliateData[]
    list.sort((a, b) => {
      let cmp: number
      if (sortKey === 'username') {
        cmp = a.username.localeCompare(b.username)
      } else {
        cmp = a[sortKey] - b[sortKey]
      }
      return sortDir === 'desc' ? -cmp : cmp
    })
    return list
  }, [report, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function handleDelete() {
    if (!reportId) return
    deleteReport.mutate(reportId, {
      onSuccess: () => {
        toast('Partner report deleted', 'success')
        navigate('/partners/reports')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Report not found.</p>
        <Button variant="secondary" className="mt-3" onClick={() => navigate('/partners/reports')}>
          Back to reports
        </Button>
      </div>
    )
  }

  const totalFtdCount = report.totals?.ftdCount ?? 0
  const totalFtdAmount = report.totals?.ftdAmount ?? 0
  const affiliateCount = Object.keys(report.affiliates ?? {}).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/partners/reports')}
            aria-label="Back to partner reports"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Partners · {formatAffiliatePeriod(reportId!)}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              <span className="font-mono">{reportId}</span> · uploaded {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <>
              <span className="text-xs text-gray-500">Delete this report?</span>
              <Button
                variant="danger"
                size="sm"
                disabled={deleteReport.isPending}
                onClick={handleDelete}
              >
                {deleteReport.isPending ? 'Deleting...' : 'Yes, delete'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={deleteReport.isPending}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="First purchases"
          value={totalFtdCount.toLocaleString()}
          icon={<Hash className="w-5 h-5" />}
          color="primary"
        />
        <MetricCard
          title="First purchase value"
          value={format(totalFtdAmount)}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Partners"
          value={affiliateCount.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Partners Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Partners</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <SortableHeader
                  label="Partner"
                  sortKey="username"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <SortableHeader
                  label="Sign-ups"
                  sortKey="playerRegistrations"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                />
                <SortableHeader
                  label="First purchases"
                  sortKey="ftdCount"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                />
                <SortableHeader
                  label="First purchase value"
                  sortKey="ftdAmount"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">
                    No partners in this report.
                  </td>
                </tr>
              ) : (
                affiliates.map((aff) => (
                  <tr key={aff.affiliateId} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-medium text-gray-900">{aff.username}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={aff.status} />
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-gray-700">
                      {aff.playerRegistrations.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-gray-700">
                      {aff.ftdCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-gray-700">
                      {format(aff.ftdAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  align = 'left',
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey
  currentDir: SortDir
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  const isActive = currentKey === sortKey
  return (
    <th
      aria-sort={isActive ? (currentDir === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={`px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider select-none whitespace-nowrap ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-gray-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {label}
        <ArrowUpDown className={`w-3 h-3 ${isActive ? 'text-primary-600' : 'text-gray-300'}`} aria-hidden="true" />
        {isActive && (
          <span className="text-[10px] text-primary-600 font-normal lowercase">
            {currentDir}
          </span>
        )}
      </button>
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase() === 'active'
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      }`}
    >
      {status}
    </span>
  )
}
