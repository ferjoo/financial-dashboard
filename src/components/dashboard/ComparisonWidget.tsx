import { GitCompare, Download } from 'lucide-react'
import { fmtQ, fmtUSD, GTQ_RATE } from '@/context/currency'
import { downloadCsv } from '@/components/dashboard/Charts'
import type { ReportMetrics, TransactionTypeTotals } from '@/types/api'

// ─── helpers (exported for reuse) ────────────────────────────────────────────

export type Side = { from: string; to: string }

export type ViewFilter = 'totals' | 'cashier' | 'betshop'

export function aggregateMetrics(
  metricsArr: Array<ReportMetrics | undefined>,
  view: ViewFilter = 'totals',
): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const m of metricsArr) {
    if (!m) continue
    if (view === 'totals' || view === 'cashier') {
      for (const entityTotals of Object.values(m.byCashier)) {
        for (const [key, val] of Object.entries(entityTotals)) {
          if (typeof val === 'number' && !key.endsWith('Count')) {
            totals[key] = (totals[key] ?? 0) + val
          }
        }
      }
    }
    if (view === 'totals') {
      for (const entityTotals of Object.values(m.byBetshop)) {
        if (typeof entityTotals.winnings === 'number') {
          totals.winnings = (totals.winnings ?? 0) + entityTotals.winnings
        }
      }
    }
    if (view === 'betshop') {
      for (const entityTotals of Object.values(m.byBetshop)) {
        for (const [key, val] of Object.entries(entityTotals)) {
          if (typeof val === 'number' && !key.endsWith('Count')) {
            totals[key] = (totals[key] ?? 0) + val
          }
        }
      }
    }
  }
  totals.ggr = (totals.bets ?? 0) - (totals.payouts ?? 0)
  const totalBonuses = 0 // TODO: replace with real bonuses when available
  totals.ngr = totals.ggr - totalBonuses
  return totals
}

export function aggregateByEntity(
  metricsArr: Array<ReportMetrics | undefined>,
): {
  byCashier: Record<string, TransactionTypeTotals>
  byBetshop: Record<string, TransactionTypeTotals>
  byBetshopCashier: Record<string, Record<string, TransactionTypeTotals>>
} {
  const byCashier: Record<string, TransactionTypeTotals> = {}
  const byBetshop: Record<string, TransactionTypeTotals> = {}
  const byBetshopCashier: Record<string, Record<string, TransactionTypeTotals>> = {}
  for (const m of metricsArr) {
    if (!m) continue
    for (const [name, totals] of Object.entries(m.byCashier)) {
      if (!byCashier[name]) byCashier[name] = {}
      for (const [key, val] of Object.entries(totals)) {
        if (typeof val === 'number' && !key.endsWith('Count')) {
          byCashier[name][key] = ((byCashier[name][key] as number) ?? 0) + val
        }
      }
    }
    for (const [name, totals] of Object.entries(m.byBetshop)) {
      if (!byBetshop[name]) byBetshop[name] = {}
      for (const [key, val] of Object.entries(totals)) {
        if (typeof val === 'number' && !key.endsWith('Count')) {
          byBetshop[name][key] = ((byBetshop[name][key] as number) ?? 0) + val
        }
      }
    }
    for (const [betshop, cashiers] of Object.entries(m.byBetshopCashier ?? {})) {
      if (!byBetshopCashier[betshop]) byBetshopCashier[betshop] = {}
      for (const [cashier, totals] of Object.entries(cashiers)) {
        if (!byBetshopCashier[betshop][cashier]) byBetshopCashier[betshop][cashier] = {}
        for (const [key, val] of Object.entries(totals)) {
          if (typeof val === 'number' && !key.endsWith('Count')) {
            byBetshopCashier[betshop][cashier][key] = ((byBetshopCashier[betshop][cashier][key] as number) ?? 0) + val
          }
        }
      }
    }
  }
  return { byCashier, byBetshop, byBetshopCashier }
}

const METRICS = [
  { key: 'bets',         label: 'Bets' },
  { key: 'winnings',     label: 'Wins' },
  { key: 'ggr',          label: 'GGR' },
  { key: 'ngr',          label: 'NGR' },
  { key: 'deposits',     label: 'Deposits' },
  { key: 'withdrawals',  label: 'Withdrawals' },
  { key: 'payouts',      label: 'Payouts' },
]

// ─── sub-components ───────────────────────────────────────────────────────────

export function DateRangePicker({
  label,
  value,
  onChange,
  name,
  onNameChange,
}: {
  label: string
  value: Side
  onChange: (s: Side) => void
  name?: string
  onNameChange?: (n: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        {onNameChange && (
          <input
            type="text"
            value={name ?? ''}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={label}
            aria-label={`${label} name`}
            className="text-xs border border-gray-200 rounded-md px-2 py-0.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500 w-32"
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">From</span>
          <input
            type="date"
            lang="en"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            aria-label={`${label} from date`}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">To</span>
          <input
            type="date"
            lang="en"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            aria-label={`${label} to date`}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
    </div>
  )
}

function Delta({ a, b }: { a: number; b: number }) {
  if (a === 0 && b === 0) return <span className="text-xs text-gray-300">—</span>
  if (a === 0) return <span className="text-xs font-medium text-emerald-600">+∞</span>
  const pct = ((b - a) / Math.abs(a)) * 100
  if (Math.abs(pct) < 0.05) return <span className="text-xs text-gray-400">0%</span>
  const sign = pct > 0 ? '+' : ''
  return (
    <span className={`text-xs font-medium ${pct > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
      {sign}{pct.toFixed(1)}%
    </span>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface ComparisonWidgetProps {
  sideA: Side
  setSideA: (s: Side) => void
  sideB: Side
  setSideB: (s: Side) => void
  nameA: string
  setNameA: (n: string) => void
  nameB: string
  setNameB: (n: string) => void
  idsA: string[]
  idsB: string[]
  totalsA: Record<string, number>
  totalsB: Record<string, number>
  isLoadingA: boolean
  isLoadingB: boolean
}

export default function ComparisonWidget({
  sideA, setSideA,
  sideB, setSideB,
  nameA, setNameA,
  nameB, setNameB,
  idsA, idsB,
  totalsA, totalsB,
  isLoadingA, isLoadingB,
}: ComparisonWidgetProps) {
  const hasA = idsA.length > 0
  const hasB = idsB.length > 0
  const hasAnySelection = (sideA.from || sideA.to) || (sideB.from || sideB.to)
  const canCompare = hasA && hasB

  const displayA = nameA || 'Period A'
  const displayB = nameB || 'Period B'

  const handleExport = () => {
    const rows = [
      ['Metric', `${displayA} (GTQ)`, `${displayA} (USD)`, `${displayB} (GTQ)`, `${displayB} (USD)`, 'Delta %'],
      ...METRICS.map(({ key, label }) => {
        const valA = totalsA[key] ?? 0
        const valB = totalsB[key] ?? 0
        let delta = '—'
        if (valA !== 0) {
          delta = `${(((valB - valA) / Math.abs(valA)) * 100).toFixed(1)}%`
        } else if (valB !== 0) {
          delta = '+∞'
        }
        return [label, valA.toFixed(2), (valA / GTQ_RATE).toFixed(2), valB.toFixed(2), (valB / GTQ_RATE).toFixed(2), delta]
      }),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCsv('period_comparison.csv', csv)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-gray-400" />
          Period Comparison
        </h3>
        {canCompare && !isLoadingA && !isLoadingB && (
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Export CSV"
            aria-label="Export comparison as CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Date selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div className="space-y-1">
          <DateRangePicker label="Period A" value={sideA} onChange={setSideA} name={nameA} onNameChange={setNameA} />
          {(sideA.from || sideA.to) && (
            <p className="text-xs text-gray-400 pt-1">
              {hasA ? `${idsA.length} report${idsA.length !== 1 ? 's' : ''} matched` : 'No reports in this range'}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <DateRangePicker label="Period B" value={sideB} onChange={setSideB} name={nameB} onNameChange={setNameB} />
          {(sideB.from || sideB.to) && (
            <p className="text-xs text-gray-400 pt-1">
              {hasB ? `${idsB.length} report${idsB.length !== 1 ? 's' : ''} matched` : 'No reports in this range'}
            </p>
          )}
        </div>
      </div>

      {/* Comparison table */}
      {!hasAnySelection ? (
        <p className="text-sm text-gray-400 text-center py-10">
          Select a date range for each period to compare metrics.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                <th className="pb-2 pr-6 text-left font-medium">Metric</th>
                <th className="pb-2 pr-6 text-right font-medium" colSpan={2}>
                  {displayA}
                  {(sideA.from || sideA.to) && (
                    <span className="block font-normal normal-case text-gray-400">
                      {sideA.from || '…'} → {sideA.to || '…'}
                    </span>
                  )}
                </th>
                <th className="pb-2 pr-6 text-right font-medium" colSpan={2}>
                  {displayB}
                  {(sideB.from || sideB.to) && (
                    <span className="block font-normal normal-case text-gray-400">
                      {sideB.from || '…'} → {sideB.to || '…'}
                    </span>
                  )}
                </th>
                <th className="pb-2 text-right font-medium">Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {METRICS.map(({ key, label }) => {
                const valA = totalsA[key] ?? 0
                const valB = totalsB[key] ?? 0
                return (
                  <tr key={key} className="hover:bg-gray-50/50">
                    <td className="py-2.5 pr-6 font-medium text-gray-700">{label}</td>
                    <td className="py-2.5 pr-2 text-right font-mono text-gray-900">
                      {!hasA ? (
                        <span className="text-gray-300">—</span>
                      ) : isLoadingA ? (
                        <span className="text-gray-300">…</span>
                      ) : (
                        fmtQ(valA)
                      )}
                    </td>
                    <td className="py-2.5 pr-6 text-right font-mono text-gray-900">
                      {!hasA ? (
                        <span className="text-gray-300">—</span>
                      ) : isLoadingA ? (
                        <span className="text-gray-300">…</span>
                      ) : (
                        fmtUSD(valA)
                      )}
                    </td>
                    <td className="py-2.5 pr-2 text-right font-mono text-gray-900">
                      {!hasB ? (
                        <span className="text-gray-300">—</span>
                      ) : isLoadingB ? (
                        <span className="text-gray-300">…</span>
                      ) : (
                        fmtQ(valB)
                      )}
                    </td>
                    <td className="py-2.5 pr-6 text-right font-mono text-gray-900">
                      {!hasB ? (
                        <span className="text-gray-300">—</span>
                      ) : isLoadingB ? (
                        <span className="text-gray-300">…</span>
                      ) : (
                        fmtUSD(valB)
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      {canCompare && !isLoadingA && !isLoadingB ? (
                        <Delta a={valA} b={valB} />
                      ) : (
                        <span className="text-gray-200">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
