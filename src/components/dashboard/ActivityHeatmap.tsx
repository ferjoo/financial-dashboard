import { useMemo, useState } from 'react'
import type { TransactionTypeTotals } from '@/types/api'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))

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

function cellColor(value: number, max: number): string {
  if (max === 0 || value === 0) return '#f3f4f6' // gray-100
  const ratio = value / max
  // Blue scale: low → light blue, high → deep blue
  const r = Math.round(239 - ratio * 175)
  const g = Math.round(246 - ratio * 174)
  const b = Math.round(255 - ratio * 55)
  return `rgb(${r},${g},${b})`
}

export default function ActivityHeatmap({ byDayHour, metricKey, valueMode, label }: Props) {
  const [tooltip, setTooltip] = useState<{ date: string; hour: string; value: number } | null>(null)

  const sortedDays = useMemo(() => Object.keys(byDayHour).sort(), [byDayHour])

  const { matrix, max } = useMemo(() => {
    let max = 0
    const matrix: Record<string, Record<string, number>> = {}
    for (const date of sortedDays) {
      matrix[date] = {}
      for (const hour of HOURS) {
        const v = getValue(byDayHour[date]?.[hour], metricKey, valueMode)
        matrix[date][hour] = v
        if (v > max) max = v
      }
    }
    return { matrix, max }
  }, [byDayHour, sortedDays, metricKey, valueMode])

  if (sortedDays.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-gray-400">
        No hourly data available
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Hour labels */}
          <div className="flex ml-20 mb-0.5">
            {HOURS.map((h) => (
              <div key={h} className="w-7 text-center text-[10px] text-gray-400 leading-none">
                {parseInt(h) % 3 === 0 ? h : ''}
              </div>
            ))}
          </div>

          {/* Rows: one per day */}
          {sortedDays.map((date) => (
            <div key={date} className="flex items-center mb-0.5">
              <div className="w-20 text-[11px] text-gray-500 pr-2 text-right shrink-0 tabular-nums">
                {date.slice(5)} {/* MM-DD */}
              </div>
              {HOURS.map((hour) => {
                const value = matrix[date][hour]
                const bg = cellColor(value, max)
                return (
                  <div
                    key={hour}
                    className="w-7 h-5 rounded-[2px] cursor-default transition-opacity hover:opacity-80 relative"
                    style={{ backgroundColor: bg, marginRight: 1 }}
                    title={`${date} ${hour}:00 · ${valueMode === 'amount' ? `Q${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `${value} txn`}`}
                    onMouseEnter={() => setTooltip({ date, hour, value })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                )
              })}
            </div>
          ))}

          {/* Hour axis labels bottom */}
          <div className="flex ml-20 mt-0.5">
            {HOURS.map((h) => (
              <div key={h} className="w-7 text-center text-[10px] text-gray-400 leading-none">
                {parseInt(h) % 6 === 0 ? h + 'h' : ''}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-md">
          <span className="font-medium">{tooltip.date}</span>
          <span className="text-gray-400">·</span>
          <span>{tooltip.hour}:00–{tooltip.hour}:59</span>
          <span className="text-gray-400">·</span>
          <span className="font-medium tabular-nums">
            {valueMode === 'amount'
              ? `Q${tooltip.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `${tooltip.value} txn`}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((r) => (
            <div
              key={r}
              className="w-4 h-3 rounded-[1px]"
              style={{ backgroundColor: cellColor(r * max, max) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
