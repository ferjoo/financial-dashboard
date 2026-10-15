import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useReportMetrics, useDeleteReport, useReports } from '@/hooks/use-reports'
import { formatPeriod } from '@/lib/period'
import { useCurrency } from '@/context/currency'
import MetricCard from '@/components/dashboard/MetricCard'
import { ByEntityBarChart, DistributionPieChart } from '@/components/dashboard/Charts'
import TopsTable from '@/components/dashboard/TopsTable'
import CashierStatsTable from '@/components/dashboard/CashierStatsTable'
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { buttonClass } from '@/components/ui/button-class'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  Store,
  Coins,
  Wallet,
  Trophy,
  Banknote,
  Download,
  Trash2,
  XCircle,
  DollarSign,
} from 'lucide-react'
import type { TransactionTypeTotals } from '@/types/api'
import type { TopEntry } from '@/types/api'
import { useDownloadReportMetricsCsv } from '@/hooks/use-download-csv'

type ViewTab = 'cashier' | 'betshop'

function sumTotals(data: Record<string, TransactionTypeTotals>): TransactionTypeTotals {
  const result: TransactionTypeTotals = {}
  for (const totals of Object.values(data)) {
    for (const [key, value] of Object.entries(totals)) {
      if (typeof value === 'number') {
        result[key] = (result[key] ?? 0) + value
      }
    }
  }
  return result
}

function deriveTops(
  data: Record<string, TransactionTypeTotals> | undefined,
  type: 'deposits' | 'withdrawals',
  limit: number,
): TopEntry[] {
  if (!data || Object.keys(data).length === 0) return []
  const key = type === 'deposits' ? 'deposits' : 'withdrawals'
  const entries: TopEntry[] = Object.entries(data).map(([name, totals]) => ({
    name,
    value: typeof totals?.[key] === 'number' ? totals[key]! : 0,
  }))
  return entries
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

export default function ReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>()
  const navigate = useNavigate()
  const [tab, setTab] = useState<ViewTab>('cashier')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { currency, toggle: toggleCurrency, fmt } = useCurrency()

  const metrics = useReportMetrics(reportId!)
  const meta = useReports().data?.find((r) => r.reportId === reportId)
  const m = metrics.data
  const downloadMetrics = useDownloadReportMetricsCsv(reportId!)
  const deleteReport = useDeleteReport()
  const activeData = tab === 'cashier' ? m?.byCashier : m?.byBetshop
  const totals = activeData ? sumTotals(activeData) : null

  // Aggregate totals matching backend logic: byCashier for most metrics, byBetshop for winnings only
  const cashierTotals = m?.byCashier ? sumTotals(m.byCashier) : null
  const betshopTotals = m?.byBetshop ? sumTotals(m.byBetshop) : null
  const betshopCount = m?.byBetshop ? Object.keys(m.byBetshop).length : 0
  const cashierCount = m?.byCashier ? Object.keys(m.byCashier).length : 0
  const totalBets = cashierTotals?.bets ?? 0
  const betsCount = cashierTotals?.betsCount ?? 0
  const totalDepositsReport = cashierTotals?.deposits ?? 0
  const depositsCount = cashierTotals?.depositsCount ?? 0
  const totalWithdrawalsReport = cashierTotals?.withdrawals ?? 0
  const withdrawalsCount = cashierTotals?.withdrawalsCount ?? 0
  const totalPayouts = cashierTotals?.payouts ?? 0
  const payoutsCount = cashierTotals?.payoutsCount ?? 0
  const totalWon = betshopTotals?.winnings ?? 0
  const wonCount = betshopTotals?.winningsCount ?? 0
  const totalCancellations = cashierTotals?.cancellations ?? 0
  const cancellationsCount = cashierTotals?.cancellationsCount ?? 0
  const ggr = totalBets - totalPayouts
  const totalBonuses = 0 // TODO: replace with real bonuses when available
  const ngr = ggr - totalBonuses
  const moneyIn = totalBets + totalDepositsReport
  const moneyOut = totalPayouts + totalWithdrawalsReport

  const depositsTopEntries = useMemo(
    () => deriveTops(activeData, 'deposits', 10),
    [activeData],
  )
  const withdrawalsTopEntries = useMemo(
    () => deriveTops(activeData, 'withdrawals', 10),
    [activeData],
  )

  const totalDeposits = totals?.deposits ?? totalDepositsReport
  const totalWithdrawals = totals?.withdrawals ?? totalWithdrawalsReport

  // Amount keys only: mixing transaction counts (depositsCount…) into an amount pie distorts it
  const PIE_SLICES = [
    { key: 'deposits', name: 'Deposits', color: '#16a34a' },
    { key: 'withdrawals', name: 'Withdrawals', color: '#c026d3' },
    { key: 'bets', name: 'Bets', color: '#2563eb' },
    { key: 'payouts', name: 'Payouts', color: '#ea580c' },
    { key: 'winnings', name: 'Winnings', color: '#0891b2' },
    { key: 'cancellations', name: 'Cancellations', color: '#dc2626' },
  ]
  const pieData = totals
    ? PIE_SLICES.map(({ key, name, color }) => ({ name, value: totals[key] ?? 0, color })).filter((d) => d.value > 0)
    : []

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/reports" className={buttonClass('ghost', 'icon')} aria-label="Back to reports">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
        <div className="flex-1 min-w-[12rem]">
          <h1 className="text-lg font-semibold text-gray-900">{meta ? formatPeriod(meta) : 'Report detail'}</h1>
          <p className="text-xs text-gray-500 font-mono">{reportId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={toggleCurrency} aria-label={currency === 'Q' ? 'Show amounts in US dollars' : 'Show amounts in quetzales'}>
          <DollarSign className="w-4 h-4" />
          {currency === 'Q' ? 'USD' : 'Q'}
        </Button>
        {m && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadMetrics(m, tab === 'cashier' ? 'byCashier' : 'byBetshop')}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        )}
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Delete this report?</span>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteReport.isPending}
              onClick={() =>
                deleteReport.mutate(reportId!, { onSuccess: () => navigate('/reports') })
              }
            >
              {deleteReport.isPending ? 'Deleting…' : 'Yes, delete'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(true)} title="Delete report" aria-label="Delete report">
            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" aria-hidden="true" />
          </Button>
        )}
        </div>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => setTab('cashier')}
          aria-pressed={tab === 'cashier'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            tab === 'cashier'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
          )}
        >
          <Users className="w-3.5 h-3.5" />
          By Cashier
        </button>
        <button
          onClick={() => setTab('betshop')}
          aria-pressed={tab === 'betshop'}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            tab === 'betshop'
              ? 'bg-primary-600 text-white'
              : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
          )}
        >
          <Store className="w-3.5 h-3.5" />
          By Betshop
        </button>
      </div>

      {metrics.isLoading ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TableSkeleton />
            <TableSkeleton />
          </div>
        </>
      ) : metrics.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 text-sm">Failed to load report metrics.</p>
          <Button variant="secondary" className="mt-3" onClick={() => metrics.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              title="Betshops"
              value={String(betshopCount)}
              icon={<Store className="w-5 h-5" />}
              color="primary"
            />
            <MetricCard
              title="Cashiers"
              value={String(cashierCount)}
              icon={<Users className="w-5 h-5" />}
              color="accent"
            />
            <MetricCard
              title="Money In"
              value={fmt(moneyIn)}
              description="Bets + Deposits"
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              title="Money Out"
              value={fmt(moneyOut)}
              description="Payouts + Withdrawals"
              icon={<ArrowDownRight className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              title="Bets"
              value={fmt(totalBets)}
              description={betsCount > 0 ? `${betsCount.toLocaleString()} transactions` : undefined}
              icon={<Coins className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              title="Deposits"
              value={fmt(totalDeposits)}
              description={depositsCount > 0 ? `${depositsCount.toLocaleString()} transactions` : undefined}
              icon={<ArrowUpRight className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              title="Withdrawals"
              value={fmt(totalWithdrawals)}
              description={withdrawalsCount > 0 ? `${withdrawalsCount.toLocaleString()} transactions` : undefined}
              icon={<ArrowDownRight className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              title="Payouts"
              value={fmt(totalPayouts)}
              description={payoutsCount > 0 ? `${payoutsCount.toLocaleString()} transactions` : undefined}
              icon={<Wallet className="w-5 h-5" />}
              color="orange"
            />
            <MetricCard
              title="Won"
              value={fmt(totalWon)}
              description={wonCount > 0 ? `${wonCount.toLocaleString()} transactions` : undefined}
              icon={<Trophy className="w-5 h-5" />}
              color="cyan"
            />
            <MetricCard
              title="Cancellations"
              value={fmt(totalCancellations)}
              description={cancellationsCount > 0 ? `${cancellationsCount.toLocaleString()} transactions` : undefined}
              icon={<XCircle className="w-5 h-5" />}
              color="orange"
            />
            <MetricCard
              title="NGR"
              value={fmt(ngr)}
              icon={<Banknote className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              title="GGR"
              value={fmt(ggr)}
              icon={<TrendingUp className="w-5 h-5" />}
              color="blue"
            />
          </div>

          {tab === 'cashier' && m?.byCashier && Object.keys(m.byCashier).length > 0 && (
            <CashierStatsTable data={m.byCashier} />
          )}

          {tab === 'betshop' && m?.byBetshop && Object.keys(m.byBetshop).length > 0 && (
            <CashierStatsTable
              data={m.byBetshop}
              title="Betshop breakdown"
              entityLabel="Betshop"
              icon={Store}
            />
          )}

          {activeData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ByEntityBarChart
                  title={`Deposits & Withdrawals by ${tab === 'cashier' ? 'Cashier' : 'Betshop'}`}
                  data={activeData}
                  metricKey="deposits_withdrawals"
                />
                <ByEntityBarChart
                  title={`Bets & Payouts by ${tab === 'cashier' ? 'Cashier' : 'Betshop'}`}
                  data={activeData}
                  metricKey="bets_payouts"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DistributionPieChart
                  title="Transaction Type Distribution"
                  data={pieData}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopsTable
              title={`Top ${tab === 'cashier' ? 'Cashiers' : 'Betshops'} by Deposits`}
              entries={depositsTopEntries}
              type="deposits"
            />
            <TopsTable
              title={`Top ${tab === 'cashier' ? 'Cashiers' : 'Betshops'} by Withdrawals`}
              entries={withdrawalsTopEntries}
              type="withdrawals"
            />
          </div>
        </>
      )}
    </div>
  )
}
