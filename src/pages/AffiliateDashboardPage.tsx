import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Users, DollarSign, Hash, FileText, ArrowUpDown } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import { useAffiliateSummary, useAffiliateReports } from '@/hooks/use-affiliate-reports'
import { useCurrency } from '@/context/currency'
import { useAuth } from '@/hooks/use-auth'
import type { AffiliateData } from '@/types/api'
import { formatAffiliatePeriod } from '@/lib/period'

type SortKey = 'username' | 'playerRegistrations' | 'ftdCount' | 'ftdAmount'
type SortDir = 'asc' | 'desc'

export default function AffiliateDashboardPage() {
  const { data: summary, isLoading } = useAffiliateSummary()
  const { data: reports } = useAffiliateReports()
  const { fmt: format } = useCurrency()
  const { user } = useAuth()
  const canManage = user?.role === 'superadmin' || user?.role === 'offline_admin'
  const [sortKey, setSortKey] = useState<SortKey>('ftdAmount')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const affiliates = useMemo(() => {
    if (!summary?.affiliates) return []
    const list = Object.values(summary.affiliates) as AffiliateData[]
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
  }, [summary, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalFtdCount = summary?.totals.ftdCount ?? 0
  const totalFtdAmount = summary?.totals.ftdAmount ?? 0
  const affiliateCount = summary ? Object.keys(summary.affiliates).length : 0
  const reportCount = summary?.reportCount ?? 0
  const recentReports = (reports ?? []).slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Affiliate Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aggregated affiliate performance across all uploaded reports
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total FTD Count"
          value={totalFtdCount.toLocaleString()}
          icon={<Hash className="w-5 h-5" />}
          color="primary"
          description="First-time depositors"
        />
        <MetricCard
          title="Total FTD Amount"
          value={format(totalFtdAmount)}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
          description="First-time deposit value"
        />
        <MetricCard
          title="Affiliates"
          value={affiliateCount.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Reports"
          value={reportCount.toLocaleString()}
          icon={<FileText className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Affiliates Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">All Affiliates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <SortableHeader
                  label="Username"
                  sortKey="username"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                />
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <SortableHeader
                  label="Player Reg."
                  sortKey="playerRegistrations"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                />
                <SortableHeader
                  label="FTD Count"
                  sortKey="ftdCount"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={toggleSort}
                  align="right"
                />
                <SortableHeader
                  label="FTD Amount"
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
                    No affiliate data yet. Upload an affiliate report to get started.
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

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Affiliate Reports</h2>
            {canManage && (
              <Link
                to="/affiliates/reports"
                className="text-xs text-primary-700 hover:text-primary-800 font-medium rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                View all
              </Link>
            )}
          </div>
          <div className="divide-y divide-gray-100">
            {recentReports.map((r) => {
              const content = (
                <>
                  <FileText className="w-4 h-4 text-gray-400" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{formatAffiliatePeriod(r.reportId)}</p>
                    <p className="text-xs text-gray-500">
                      Uploaded {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </>
              )
              // Viewers can't open report details, so their list is informational only
              return canManage ? (
                <Link
                  key={r.reportId}
                  to={`/affiliates/reports/${r.reportId}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
                >
                  {content}
                </Link>
              ) : (
                <div key={r.reportId} className="flex items-center gap-3 px-5 py-3">
                  {content}
                </div>
              )
            })}
          </div>
        </div>
      )}
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
