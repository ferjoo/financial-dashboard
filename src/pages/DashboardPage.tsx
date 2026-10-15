import { useEffect, useState } from 'react'
import { useGerencia, useReports } from '@/hooks/use-reports'
import { useAuth } from '@/hooks/use-auth'
import { useCurrency } from '@/context/currency'
import { Link } from 'react-router-dom'
import MetricCard from '@/components/dashboard/MetricCard'
import { ByEntityBarChart, DistributionPieChart } from '@/components/dashboard/Charts'
import { MetricCardSkeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Upload,
  Store,
  Users,
  Coins,
  Wallet,
  Banknote,
  X,
  XCircle,
  DollarSign,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { formatPeriod } from '@/lib/period'
import { Button } from '@/components/ui/button'
import { buttonClass } from '@/components/ui/button-class'

interface BetshopDetail {
  name: string
  cashiers: Record<string, Record<string, number>>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { currency, toggle: toggleCurrency, fmt } = useCurrency()
  const gerencia = useGerencia()
  const reports = useReports()
  const [selectedBetshop, setSelectedBetshop] = useState<BetshopDetail | null>(null)
  const canManage = user?.role === 'superadmin' || user?.role === 'offline_admin'

  useEffect(() => {
    if (!selectedBetshop) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelectedBetshop(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedBetshop])

  const g = gerencia.data

  const totalDeposits = g?.totals?.deposits ?? 0
  const totalWithdrawals = g?.totals?.withdrawals ?? 0
  const betshopCount = g?.betshopCount ?? Object.keys(g?.byBetshop ?? {}).length
  const cashierCount = g?.cashierCount ?? Object.keys(g?.byCashier ?? {}).length
  const totalBets = g?.totals?.bets ?? 0
  const betsCount = g?.totals?.betsCount ?? 0
  const depositsCount = g?.totals?.depositsCount ?? 0
  const withdrawalsCount = g?.totals?.withdrawalsCount ?? 0
  const totalPayouts = g?.totals?.payouts ?? 0
  const payoutsCount = g?.totals?.payoutsCount ?? 0
  const totalCancellations = g?.totals?.cancellations ?? 0
  const cancellationsCount = g?.totals?.cancellationsCount ?? 0
  const ggr = totalBets - totalPayouts
  const totalBonuses = 0 // TODO: replace with real bonuses when available
  const ngr = ggr - totalBonuses
  const revenueShare = totalBets + totalDeposits
  const wAndP = totalWithdrawals + totalPayouts

  const pieData = g
    ? [
        { name: 'Deposits',      value: totalDeposits,      color: '#16a34a' },
        { name: 'Withdrawals',   value: totalWithdrawals,   color: '#c026d3' },
        { name: 'Bets',          value: totalBets,          color: '#2563eb' },
        { name: 'Payouts',       value: totalPayouts,       color: '#ea580c' },
        { name: 'Cancellations', value: totalCancellations, color: '#dc2626' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Financial Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bet-shop totals across {g?.reportCount ?? '…'} weekly reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={toggleCurrency} aria-label={currency === 'Q' ? 'Show amounts in US dollars' : 'Show amounts in quetzales'}>
            <DollarSign className="w-4 h-4" aria-hidden="true" />
            {currency === 'Q' ? 'Show in USD' : 'Show in Q'}
          </Button>
          {canManage && (
            <Link to="/upload" className={buttonClass('primary', 'sm')}>
              <Upload className="w-4 h-4" aria-hidden="true" />
              Upload CSV
            </Link>
          )}
        </div>
      </div>

      {gerencia.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      ) : gerencia.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 text-sm">Failed to load dashboard data.</p>
          <Button variant="secondary" className="mt-3" onClick={() => gerencia.refetch()}>
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
              title="Total Reports"
              value={String(g?.reportCount ?? 0)}
              icon={<FileText className="w-5 h-5" />}
              color="primary"
            />
            <MetricCard
              title="Money In"
              value={fmt(revenueShare)}
              description="Bets + Deposits"
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <MetricCard
              title="Money Out"
              value={fmt(wAndP)}
              description="Payouts + Withdrawals"
              icon={<Wallet className="w-5 h-5" />}
              color="purple"
            />
            <MetricCard
              title="Profit"
              value={fmt(revenueShare - wAndP)}
              description="Money In − Money Out"
              icon={<DollarSign className="w-5 h-5" />}
              color={revenueShare - wAndP >= 0 ? 'green' : 'red'}
              valueClassName={revenueShare - wAndP >= 0 ? 'text-green-700' : 'text-red-700'}
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

          {g && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ByEntityBarChart
                  title="Deposits & Withdrawals by Cashier"
                  data={Object.fromEntries(
                    Object.entries(g.byCashier ?? {}).map(([k, v]) => [k, v.totals]),
                  )}
                  metricKey="deposits_withdrawals"
                />
                <ByEntityBarChart
                  title="Bets & Payouts by Cashier"
                  data={Object.fromEntries(
                    Object.entries(g.byCashier ?? {}).map(([k, v]) => [k, v.totals]),
                  )}
                  metricKey="bets_payouts"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ByEntityBarChart
                  title="Deposits & Withdrawals by Betshop"
                  data={Object.fromEntries(
                    Object.entries(g.byBetshop ?? {}).map(([k, v]) => [k, v.totals]),
                  )}
                  metricKey="deposits_withdrawals"
                />
                <ByEntityBarChart
                  title="Bets & Payouts by Betshop"
                  data={Object.fromEntries(
                    Object.entries(g.byBetshop ?? {}).map(([k, v]) => [k, v.totals]),
                  )}
                  metricKey="bets_payouts"
                />
              </div>

              {/* Betshop cards */}
              {g.byBetshopCashier && Object.keys(g.byBetshopCashier).length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-medium text-gray-900">Betshops</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                    {Object.entries(g.byBetshopCashier).map(([betshopName, cashiers]) => {
                      const cashiersTyped = cashiers as Record<string, Record<string, number>>
                      const bsRevShare = Object.values(cashiersTyped).reduce(
                        (sum, t) => sum + (t.bets ?? 0) + (t.deposits ?? 0), 0,
                      )
                      const bsWP = Object.values(cashiersTyped).reduce(
                        (sum, t) => sum + (t.withdrawals ?? 0) + (t.payouts ?? 0), 0,
                      )
                      return (
                        <button
                          key={betshopName}
                          onClick={() => setSelectedBetshop({ name: betshopName, cashiers: cashiersTyped })}
                          className="flex flex-col gap-2 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-primary-50 hover:border-primary-200 transition-colors text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="text-sm font-semibold text-gray-800 truncate">{betshopName}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Money In</p>
                              <p className="text-sm font-mono font-semibold text-primary-700">{fmt(bsRevShare)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Money Out</p>
                              <p className="text-sm font-mono font-semibold text-purple-700">{fmt(bsWP)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Profit</p>
                              <p className={`text-sm font-mono font-semibold ${bsRevShare - bsWP >= 0 ? 'text-green-700' : 'text-red-700'}`}>{fmt(bsRevShare - bsWP)}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <DistributionPieChart title="Transaction Distribution" data={pieData} />
            </>
          )}
        </>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            Recent Reports
          </h2>
          {canManage && (
            <Link to="/reports" className="text-sm font-medium text-primary-700 hover:text-primary-800 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
              View all
            </Link>
          )}
        </div>
        {reports.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        ) : reports.data && reports.data.length > 0 ? (
          <div className="space-y-2">
            {reports.data.slice(0, 5).map((report) => {
              const content = (
                <>
                  <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-gray-500" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">{formatPeriod(report)}</p>
                    <p className="text-xs text-gray-500 truncate">
                      <span className="font-mono">{report.reportId}</span> · uploaded {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                </>
              )
              return canManage ? (
                <Link
                  key={report.reportId}
                  to={`/reports/${report.reportId}`}
                  className="rounded-lg border border-gray-200 bg-white p-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  {content}
                  <Badge variant="primary">View</Badge>
                </Link>
              ) : (
                <div key={report.reportId} className="rounded-lg border border-gray-200 bg-white p-3.5 flex items-center gap-3">
                  {content}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
            <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium">No reports yet</p>
            <p className="text-xs text-gray-500 mt-1">
              {canManage ? 'Upload your first CSV to get started.' : 'An admin has not uploaded any reports yet.'}
            </p>
            {canManage && (
              <Link to="/upload" className={buttonClass('primary', 'md', 'mt-4')}>
                <Upload className="w-4 h-4" aria-hidden="true" />
                Upload CSV
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Betshop detail modal */}
      {selectedBetshop && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedBetshop(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="betshop-dialog-title"
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-gray-400" />
                <h3 id="betshop-dialog-title" className="text-base font-semibold text-gray-900">{selectedBetshop.name}</h3>
              </div>
              <button
                autoFocus
                onClick={() => setSelectedBetshop(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="overflow-auto p-5">
              <table className="w-full min-w-[560px] text-sm table-fixed">
                <colgroup>
                  <col className="w-[35%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[16%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-2 pr-4 text-left">Cashier</th>
                    <th className="pb-2 pr-4 text-right">Bets</th>
                    <th className="pb-2 pr-4 text-right">Deposits</th>
                    <th className="pb-2 pr-4 text-right">Payouts</th>
                    <th className="pb-2 text-right">Withdrawals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {Object.entries(selectedBetshop.cashiers)
                    .sort(([, a], [, b]) =>
                      ((b.bets ?? 0) + (b.deposits ?? 0)) - ((a.bets ?? 0) + (a.deposits ?? 0)),
                    )
                    .map(([cashierName, t]) => (
                      <tr key={cashierName}>
                        <td className="py-2 pr-4 text-gray-700 font-medium truncate">{cashierName}</td>
                        <td className="py-2 pr-4 text-right font-mono text-blue-700">{fmt(t.bets ?? 0)}</td>
                        <td className="py-2 pr-4 text-right font-mono text-green-700">{fmt(t.deposits ?? 0)}</td>
                        <td className="py-2 pr-4 text-right font-mono text-orange-700">{fmt(t.payouts ?? 0)}</td>
                        <td className="py-2 text-right font-mono text-purple-700">{fmt(t.withdrawals ?? 0)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
