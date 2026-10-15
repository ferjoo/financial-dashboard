import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { TransactionTypeTotals } from '@/types/api'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

// 12 distinct colors for days
const DAY_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
  '#a78bfa', '#fb923c',
]

interface Props {
  byDayHour: Record<string, Record<string, TransactionTypeTotals>>
  metricKey: string
  valueMode: 'amount' | 'count'
  label: string
}

function getValue(totals: TransactionTypeTotals | undefined, metricKey: string, valueMode: 'amount' | 'count'): number {
  if (!totals) return 0
  if (valueMode === 'count') {
    return (totals[`${metricKey}Count`] as number | undefined) ?? 0
  }
  return (totals[metricKey] as number | undefined) ?? 0
}

function formatValue(value: number, valueMode: 'amount' | 'count'): string {
  if (valueMode === 'amount') {
    return `Q${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }
  return `${value} txn`
}

export default function DayOverlayChart({ byDayHour, metricKey, valueMode, label }: Props) {
  const sortedDays = useMemo(() => Object.keys(byDayHour).sort(), [byDayHour])

  const chartData = useMemo(() => {
    return HOURS.map((hour) => {
      const point: Record<string, number | string> = { hour: `${parseInt(hour)}h` }
      for (const date of sortedDays) {
        point[date] = getValue(byDayHour[date]?.[hour], metricKey, valueMode)
      }
      return point
    })
  }, [byDayHour, sortedDays, metricKey, valueMode])

  if (sortedDays.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-gray-400">
        No hourly data available
      </div>
    )
  }

  const shortDate = (d: string) => d.slice(5) // "MM-DD"

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: number) => valueMode === 'amount' ? `Q${(v / 1000).toFixed(0)}k` : String(v)}
            width={48}
          />
          <Tooltip
            formatter={(value, name) => [formatValue(Number(value), valueMode), shortDate(String(name))]}
            labelStyle={{ fontWeight: 600, fontSize: 12 }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            formatter={(value: string) => shortDate(value)}
            wrapperStyle={{ fontSize: 11 }}
          />
          {sortedDays.map((date, i) => (
            <Line
              key={date}
              type="monotone"
              dataKey={date}
              stroke={DAY_COLORS[i % DAY_COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
