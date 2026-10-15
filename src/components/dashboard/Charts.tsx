import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, Download } from 'lucide-react'
import type { TransactionTypeTotals } from '@/types/api'
import { useCurrency, GTQ_RATE } from '@/context/currency'

const COLORS = {
  primary: '#16a34a',
  accent: '#c026d3',
  blue: '#2563eb',
  orange: '#ea580c',
  purple: '#7c3aed',
  cyan: '#0891b2',
}

function XAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const name = payload?.value ?? ''
  const display = name.length > 12 ? name.slice(0, 11) + '…' : name
  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="end"
        fill="#6b7280"
        fontSize={11}
        transform="rotate(-35)"
      >
        {display}
      </text>
    </g>
  )
}

function fmtCompact(value: number, mode: 'Q' | 'USD'): string {
  const v = mode === 'USD' ? value / GTQ_RATE : value
  const sym = mode === 'USD' ? '$' : 'Q'
  if (v >= 1_000_000) return `${sym}${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${sym}${(v / 1_000).toFixed(1)}K`
  return `${sym}${v.toFixed(0)}`
}

function downloadCsv(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── ByEntityBarChart (existing, for dashboard/report pages) ─────────────────

type MetricKey =
  | 'deposits'
  | 'withdrawals'
  | 'deposits_withdrawals'
  | 'bets'
  | 'payouts'
  | 'bets_payouts'
  | 'winnings'
  | 'all'

interface ByEntityChartProps {
  title: string
  data: Record<string, TransactionTypeTotals>
  metricKey?: MetricKey
}

export function ByEntityBarChart({ title, data, metricKey = 'deposits' }: ByEntityChartProps) {
  const { currency, fmt } = useCurrency()
  const showDeposits  = metricKey === 'deposits'  || metricKey === 'deposits_withdrawals' || metricKey === 'all'
  const showWithdrawals = metricKey === 'withdrawals' || metricKey === 'deposits_withdrawals' || metricKey === 'all'
  const showBets      = metricKey === 'bets'      || metricKey === 'bets_payouts'         || metricKey === 'all'
  const showPayouts   = metricKey === 'payouts'   || metricKey === 'bets_payouts'         || metricKey === 'all'
  const showWinnings  = metricKey === 'winnings'  || metricKey === 'all'

  const chartData = Object.entries(data)
    .map(([name, totals]) => ({
      name,
      deposits:    totals.deposits    ?? 0,
      withdrawals: totals.withdrawals ?? 0,
      bets:        totals.bets        ?? 0,
      payouts:     totals.payouts     ?? 0,
      winnings:    totals.winnings    ?? 0,
    }))
    .filter(d =>
      (showDeposits    && d.deposits    > 0) ||
      (showWithdrawals && d.withdrawals > 0) ||
      (showBets        && d.bets        > 0) ||
      (showPayouts     && d.payouts     > 0) ||
      (showWinnings    && d.winnings    > 0),
    )

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          {title}
        </h3>
        <p className="text-gray-400 text-sm text-center py-12">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-gray-400" />
        {title}
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={<XAxisTick />}
              interval={0}
              height={72}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(v: number) => fmtCompact(v, currency)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm">
                    <p className="font-medium text-gray-900 mb-1">{label}</p>
                    {payload.map((entry, i) => (
                      <p key={i} style={{ color: entry.color as string }}>
                        {entry.name}: {fmt(entry.value as number)}
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend />
            {showDeposits    && <Bar dataKey="deposits"    name="Payments in"    fill={COLORS.primary} radius={[4, 4, 0, 0]} />}
            {showWithdrawals && <Bar dataKey="withdrawals" name="Payments out" fill={COLORS.accent}  radius={[4, 4, 0, 0]} />}
            {showBets        && <Bar dataKey="bets"        name="Sales"        fill={COLORS.blue}    radius={[4, 4, 0, 0]} />}
            {showPayouts     && <Bar dataKey="payouts"     name="Refunds"     fill={COLORS.orange}  radius={[4, 4, 0, 0]} />}
            {showWinnings    && <Bar dataKey="winnings"    name="Returns"    fill={COLORS.cyan}    radius={[4, 4, 0, 0]} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── ComparisonBarChart (A vs B per entity, single metric) ───────────────────

interface ComparisonBarChartProps {
  title: string
  dataA: Record<string, TransactionTypeTotals>
  dataB: Record<string, TransactionTypeTotals>
  metricKeys: string[]
  labelA?: string
  labelB?: string
}

export function ComparisonBarChart({
  title,
  dataA,
  dataB,
  metricKeys,
  labelA = 'Period A',
  labelB = 'Period B',
}: ComparisonBarChartProps) {
  const { currency, fmt } = useCurrency()

  const getValue = (entity: TransactionTypeTotals) =>
    metricKeys.reduce((sum, key) => sum + ((entity[key] as number) ?? 0), 0)

  const allNames = new Set([...Object.keys(dataA), ...Object.keys(dataB)])
  const chartData = Array.from(allNames)
    .map((name) => ({
      name,
      periodA: getValue(dataA[name] ?? {}),
      periodB: getValue(dataB[name] ?? {}),
    }))
    .filter((d) => d.periodA > 0 || d.periodB > 0)
    .sort((a, b) => b.periodA + b.periodB - (a.periodA + a.periodB))

  const handleExport = () => {
    const rows = [
      ['Entity', `${labelA} (GTQ)`, `${labelA} (USD)`, `${labelB} (GTQ)`, `${labelB} (USD)`],
      ...chartData.map((d) => [
        d.name,
        d.periodA.toFixed(2),
        (d.periodA / GTQ_RATE).toFixed(2),
        d.periodB.toFixed(2),
        (d.periodB / GTQ_RATE).toFixed(2),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCsv(`${title.replace(/\s+/g, '_').toLowerCase()}.csv`, csv)
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            {title}
          </h3>
        </div>
        <p className="text-gray-400 text-sm text-center py-12">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          {title}
        </h3>
        <button
          onClick={handleExport}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Export CSV"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              tick={<XAxisTick />}
              interval={0}
              height={72}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(v: number) => fmtCompact(v, currency)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm">
                    <p className="font-medium text-gray-900 mb-1">{label}</p>
                    {payload.map((entry, i) => (
                      <p key={i} style={{ color: entry.color as string }}>
                        {entry.name}: {fmt(entry.value as number)}
                      </p>
                    ))}
                  </div>
                )
              }}
            />
            <Legend />
            <Bar dataKey="periodA" name={labelA} fill={COLORS.blue}   radius={[4, 4, 0, 0]} />
            <Bar dataKey="periodB" name={labelB} fill={COLORS.orange} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── DistributionPieChart ────────────────────────────────────────────────────

interface PieDataItem {
  name: string
  value: number
  color: string
}

export function DistributionPieChart({ title, data }: { title: string; data: PieDataItem[] }) {
  const { currency } = useCurrency()
  const filteredData = data.filter((item) => item.value > 0)

  if (filteredData.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
          <PieChartIcon className="w-4 h-4 text-gray-400" />
          {title}
        </h3>
        <p className="text-gray-400 text-sm text-center py-12">No data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2 mb-4">
        <PieChartIcon className="w-4 h-4 text-gray-400" />
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) =>
                `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
              labelLine={{ stroke: '#d1d5db' }}
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => fmtCompact(Number(value ?? 0), currency)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── CSV export helper (re-exported for use in ComparisonWidget) ─────────────

export { downloadCsv }
