import { useState, useMemo } from 'react'
import { FlaskConical, DollarSign, Users, Store, Layers, ShieldAlert } from 'lucide-react'
import ComparisonWidget, {
  aggregateMetrics,
  aggregateByEntity,
  type Side,
  type ViewFilter,
} from '@/components/dashboard/ComparisonWidget'
import { ComparisonBarChart } from '@/components/dashboard/Charts'
import ComparisonBreakdownTable from '@/components/dashboard/ComparisonBreakdownTable'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import DayOverlayChart from '@/components/dashboard/DayOverlayChart'
import { ChartSkeleton } from '@/components/ui/skeleton'
import { useReports, useMultipleReportMetrics } from '@/hooks/use-reports'
import { useCurrency } from '@/context/currency'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ReportMeta, TransactionTypeTotals } from '@/types/api'

function filterByRange(reports: ReportMeta[], from: string, to: string): string[] {
  if (!from && !to) return []
  return reports
    .filter((r) => {
      const rFrom = r.dateFrom ?? new Date(r.createdAt).toLocaleDateString('en-CA')
      const rTo   = r.dateTo   ?? rFrom
      if (from && rTo   < from) return false
      if (to   && rFrom > to)   return false
      return true
    })
    .map((r) => r.reportId)
}

type AuditMetricKey = 'deposits' | 'bets' | 'withdrawals' | 'payouts' | 'winnings'
type AuditValueMode = 'amount' | 'count'

const AUDIT_TYPES: { key: AuditMetricKey; label: string }[] = [
  { key: 'deposits',    label: 'Deposits' },
  { key: 'bets',        label: 'Bets' },
  { key: 'withdrawals', label: 'Withdrawals' },
  { key: 'payouts',     label: 'Payouts' },
  { key: 'winnings',    label: 'Winnings' },
]

/** Merge multiple byDayHour maps into one, summing values for the same date+hour+key */
function mergeByDayHour(
  maps: (Record<string, Record<string, TransactionTypeTotals>> | undefined)[],
): Record<string, Record<string, TransactionTypeTotals>> {
  const result: Record<string, Record<string, TransactionTypeTotals>> = {}
  for (const map of maps) {
    if (!map) continue
    for (const [date, hours] of Object.entries(map)) {
      if (!result[date]) result[date] = {}
      for (const [hour, totals] of Object.entries(hours)) {
        if (!result[date][hour]) result[date][hour] = {}
        for (const [key, val] of Object.entries(totals)) {
          if (typeof val === 'number') {
            result[date][hour][key] = ((result[date][hour][key] as number | undefined) ?? 0) + val
          }
        }
      }
    }
  }
  return result
}

export default function PlaygroundPage() {
  // Demo: open with the last two sample weeks already compared, so the page is never empty on arrival
  const [sideA, setSideA] = useState<Side>({ from: '2026-03-16', to: '2026-03-22' })
  const [sideB, setSideB] = useState<Side>({ from: '2026-03-23', to: '2026-03-29' })
  const [nameA, setNameA] = useState('Week of Mar 16')
  const [nameB, setNameB] = useState('Week of Mar 23')
  const [viewFilter, setViewFilter] = useState<ViewFilter>('totals')
  const [auditType, setAuditType] = useState<AuditMetricKey>('deposits')
  const [auditMode, setAuditMode] = useState<AuditValueMode>('amount')

  const { currency, toggle: toggleCurrency } = useCurrency()

  const reports = useReports()
  const allReports = useMemo(() => reports.data ?? [], [reports.data])

  const idsA = useMemo(() => filterByRange(allReports, sideA.from, sideA.to), [allReports, sideA])
  const idsB = useMemo(() => filterByRange(allReports, sideB.from, sideB.to), [allReports, sideB])

  const metricsA = useMultipleReportMetrics(idsA, sideA)
  const metricsB = useMultipleReportMetrics(idsB, sideB)

  const isLoadingA = metricsA.some((q) => q.isLoading)
  const isLoadingB = metricsB.some((q) => q.isLoading)

  const rawA = useMemo(() => metricsA.map((q) => q.data), [metricsA])
  const rawB = useMemo(() => metricsB.map((q) => q.data), [metricsB])

  const totalsA = useMemo(() => aggregateMetrics(rawA, viewFilter), [rawA, viewFilter])
  const totalsB = useMemo(() => aggregateMetrics(rawB, viewFilter), [rawB, viewFilter])

  const byEntityA = useMemo(() => aggregateByEntity(rawA), [rawA])
  const byEntityB = useMemo(() => aggregateByEntity(rawB), [rawB])

  const byDayHourA = useMemo(
    () => mergeByDayHour(rawA.map((d) => d?.byDayHour)),
    [rawA],
  )
  const byDayHourB = useMemo(
    () => mergeByDayHour(rawB.map((d) => d?.byDayHour)),
    [rawB],
  )

  const hasAuditDataA = Object.keys(byDayHourA).length > 0
  const hasAuditDataB = Object.keys(byDayHourB).length > 0

  const hasA = idsA.length > 0
  const hasB = idsB.length > 0
  const canShowCharts = hasA && hasB && !isLoadingA && !isLoadingB

  const showCashier = viewFilter === 'totals' || viewFilter === 'cashier'
  const showBetshop = viewFilter === 'totals' || viewFilter === 'betshop'

  const labelA = nameA || 'Period A'
  const labelB = nameB || 'Period B'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-gray-400" />
          Playground
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Explore and compare your reporting data.</p>
      </div>

      {/* Comparison widget */}
      <ComparisonWidget
        sideA={sideA}
        setSideA={setSideA}
        sideB={sideB}
        setSideB={setSideB}
        nameA={nameA}
        setNameA={setNameA}
        nameB={nameB}
        setNameB={setNameB}
        idsA={idsA}
        idsB={idsB}
        totalsA={totalsA}
        totalsB={totalsB}
        isLoadingA={isLoadingA}
        isLoadingB={isLoadingB}
      />

      {/* Filter + Currency toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setViewFilter('totals')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              viewFilter === 'totals'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            Totals
          </button>
          <button
            onClick={() => setViewFilter('cashier')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              viewFilter === 'cashier'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
            )}
          >
            <Users className="w-3.5 h-3.5" />
            By Cashier
          </button>
          <button
            onClick={() => setViewFilter('betshop')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              viewFilter === 'betshop'
                ? 'bg-primary-600 text-white'
                : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
            )}
          >
            <Store className="w-3.5 h-3.5" />
            By Betshop
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={toggleCurrency}>
          <DollarSign className="w-4 h-4" />
          {currency === 'Q' ? 'Show in USD' : 'Show in Q'}
        </Button>
      </div>

      {/* Charts + breakdown tables */}
      {canShowCharts && (
        <>
          {/* Breakdown tables first — only shown when a specific view is selected, not on Totals */}
          {viewFilter === 'cashier' && (
            <ComparisonBreakdownTable
              title="Cashier breakdown"
              icon="cashier"
              dataA={byEntityA.byCashier}
              dataB={byEntityB.byCashier}
              labelA={labelA}
              labelB={labelB}
            />
          )}
          {viewFilter === 'betshop' && (
            <ComparisonBreakdownTable
              title="Betshop breakdown"
              icon="betshop"
              dataA={byEntityA.byBetshop}
              dataB={byEntityB.byBetshop}
              labelA={labelA}
              labelB={labelB}
            />
          )}

          {/* Charts */}
          {showCashier && (
            <div className="space-y-4">
              {viewFilter === 'totals' && (
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">By Cashier</h3>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Money In — Cashiers"    dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['deposits', 'bets']}        labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Money Out — Cashiers"   dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['payouts', 'withdrawals']}  labelA={labelA} labelB={labelB} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Bets — Cashiers"        dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['bets']}        labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Deposits — Cashiers"    dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['deposits']}    labelA={labelA} labelB={labelB} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Payouts — Cashiers"     dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['payouts']}     labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Withdrawals — Cashiers" dataA={byEntityA.byCashier} dataB={byEntityB.byCashier} metricKeys={['withdrawals']} labelA={labelA} labelB={labelB} />
              </div>
            </div>
          )}

          {showBetshop && (
            <div className="space-y-4">
              {viewFilter === 'totals' && (
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">By Betshop</h3>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Money In — Betshops"    dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['deposits', 'bets']}        labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Money Out — Betshops"   dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['payouts', 'withdrawals']}  labelA={labelA} labelB={labelB} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Bets — Betshops"        dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['bets']}        labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Deposits — Betshops"    dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['deposits']}    labelA={labelA} labelB={labelB} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Payouts — Betshops"     dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['payouts']}     labelA={labelA} labelB={labelB} />
                <ComparisonBarChart title="Winnings — Betshops"    dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['winnings']}    labelA={labelA} labelB={labelB} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ComparisonBarChart title="Withdrawals — Betshops" dataA={byEntityA.byBetshop} dataB={byEntityB.byBetshop} metricKeys={['withdrawals']} labelA={labelA} labelB={labelB} />
              </div>
            </div>
          )}
        </>
      )}

      {(hasA || hasB) && !canShowCharts && (isLoadingA || isLoadingB) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Activity Audit — hourly distribution */}
      {canShowCharts && (hasAuditDataA || hasAuditDataB) && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Hourly activity audit
            </h3>
            {/* Amount / Count toggle */}
            <div className="flex gap-1">
              <button
                onClick={() => setAuditMode('amount')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  auditMode === 'amount'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
                )}
              >
                Amount
              </button>
              <button
                onClick={() => setAuditMode('count')}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  auditMode === 'count'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
                )}
              >
                Count
              </button>
            </div>
          </div>

          {/* Transaction type filter */}
          <div className="flex gap-1.5 flex-wrap">
            {AUDIT_TYPES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setAuditType(key)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                  auditType === key
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Heatmaps side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {hasAuditDataA ? (
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">{labelA}</p>
                <ActivityHeatmap
                  byDayHour={byDayHourA}
                  metricKey={auditType}
                  valueMode={auditMode}
                  label="Day × hour heatmap"
                />
                <DayOverlayChart
                  byDayHour={byDayHourA}
                  metricKey={auditType}
                  valueMode={auditMode}
                  label="Days overlaid by hour"
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center h-40">
                <p className="text-sm text-gray-400 text-center">
                  {labelA}: no hourly data for this period
                </p>
              </div>
            )}

            {hasAuditDataB ? (
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">{labelB}</p>
                <ActivityHeatmap
                  byDayHour={byDayHourB}
                  metricKey={auditType}
                  valueMode={auditMode}
                  label="Day × hour heatmap"
                />
                <DayOverlayChart
                  byDayHour={byDayHourB}
                  metricKey={auditType}
                  valueMode={auditMode}
                  label="Days overlaid by hour"
                />
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-center h-40">
                <p className="text-sm text-gray-400 text-center">
                  {labelB}: no hourly data for this period
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
