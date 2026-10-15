import { Fragment } from 'react'
import { useCurrency } from '@/context/currency'
import { Download, Users, Store } from 'lucide-react'
import { downloadCsv } from '@/components/dashboard/Charts'
import { GTQ_RATE } from '@/context/currency'
import type { TransactionTypeTotals } from '@/types/api'

interface Props {
  title: string
  icon: 'cashier' | 'betshop'
  dataA: Record<string, TransactionTypeTotals>
  dataB: Record<string, TransactionTypeTotals>
  labelA: string
  labelB: string
}

interface Row {
  name: string
  depositsA: number; depositsB: number
  betsA: number; betsB: number
  payoutsA: number; payoutsB: number
  withdrawalsA: number; withdrawalsB: number
}

const GROUPS = [
  { key: 'bets', label: 'Sales', colorA: 'text-blue-700', colorB: 'text-blue-500' },
  { key: 'deposits', label: 'Payments in', colorA: 'text-green-700', colorB: 'text-green-500' },
  { key: 'payouts', label: 'Refunds', colorA: 'text-orange-700', colorB: 'text-orange-500' },
  { key: 'withdrawals', label: 'Payments out', colorA: 'text-purple-700', colorB: 'text-purple-500' },
] as const

export default function ComparisonBreakdownTable({ title, icon, dataA, dataB, labelA, labelB }: Props) {
  const { fmt } = useCurrency()
  const Icon = icon === 'cashier' ? Users : Store

  const allNames = new Set([...Object.keys(dataA), ...Object.keys(dataB)])
  const rows: Row[] = Array.from(allNames)
    .map((name) => {
      const a = dataA[name] ?? {}
      const b = dataB[name] ?? {}
      return {
        name,
        depositsA: (a.deposits as number) ?? 0, depositsB: (b.deposits as number) ?? 0,
        betsA: (a.bets as number) ?? 0, betsB: (b.bets as number) ?? 0,
        payoutsA: (a.payouts as number) ?? 0, payoutsB: (b.payouts as number) ?? 0,
        withdrawalsA: (a.withdrawals as number) ?? 0, withdrawalsB: (b.withdrawals as number) ?? 0,
      }
    })
    .sort((a, b) => (b.betsA + b.betsB) - (a.betsA + a.betsB))

  const totals = rows.reduce<Omit<Row, 'name'>>(
    (acc, r) => ({
      depositsA: acc.depositsA + r.depositsA, depositsB: acc.depositsB + r.depositsB,
      betsA: acc.betsA + r.betsA, betsB: acc.betsB + r.betsB,
      payoutsA: acc.payoutsA + r.payoutsA, payoutsB: acc.payoutsB + r.payoutsB,
      withdrawalsA: acc.withdrawalsA + r.withdrawalsA, withdrawalsB: acc.withdrawalsB + r.withdrawalsB,
    }),
    { depositsA: 0, depositsB: 0, betsA: 0, betsB: 0, payoutsA: 0, payoutsB: 0, withdrawalsA: 0, withdrawalsB: 0 },
  )

  const handleExport = () => {
    const header = [
      'Entity',
      ...GROUPS.flatMap((g) => [`${g.label} ${labelA} (GTQ)`, `${g.label} ${labelA} (USD)`, `${g.label} ${labelB} (GTQ)`, `${g.label} ${labelB} (USD)`]),
    ]
    const csvRows = rows.map((r) => [
      r.name,
      ...GROUPS.flatMap((g) => {
        const valA = r[`${g.key}A` as keyof Row] as number
        const valB = r[`${g.key}B` as keyof Row] as number
        return [valA.toFixed(2), (valA / GTQ_RATE).toFixed(2), valB.toFixed(2), (valB / GTQ_RATE).toFixed(2)]
      }),
    ])
    const csv = [header, ...csvRows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    downloadCsv(`${title.replace(/\s+/g, '_').toLowerCase()}.csv`, csv)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        </div>
        {rows.length > 0 && (
          <button
            onClick={handleExport}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" rowSpan={2}>
                Name
              </th>
              {GROUPS.map((g) => (
                <th
                  key={g.key}
                  className={`px-4 py-2 text-center text-xs font-medium uppercase tracking-wider border-l border-gray-100 ${
                    g.key === 'deposits' ? 'text-green-500' :
                    g.key === 'bets' ? 'text-blue-500' :
                    g.key === 'payouts' ? 'text-orange-500' : 'text-purple-500'
                  }`}
                  colSpan={2}
                >
                  {g.label}
                </th>
              ))}
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {GROUPS.map((g) => (
                <Fragment key={g.key}>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-100">
                    {labelA.length > 8 ? 'A' : labelA}
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {labelB.length > 8 ? 'B' : labelB}
                  </th>
                </Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">{r.name}</td>
                  {GROUPS.map((g) => {
                    const valA = r[`${g.key}A` as keyof Row] as number
                    const valB = r[`${g.key}B` as keyof Row] as number
                    return (
                      <Fragment key={g.key}>
                        <td className={`px-4 py-2.5 text-right font-mono ${g.colorA} tabular-nums whitespace-nowrap border-l border-gray-100`}>
                          {fmt(valA)}
                        </td>
                        <td className={`px-4 py-2.5 text-right font-mono ${g.colorB} tabular-nums whitespace-nowrap`}>
                          {fmt(valB)}
                        </td>
                      </Fragment>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-gray-700">Total</td>
                {GROUPS.map((g) => {
                  const valA = totals[`${g.key}A` as keyof typeof totals]
                  const valB = totals[`${g.key}B` as keyof typeof totals]
                  return (
                    <Fragment key={g.key}>
                      <td className={`px-4 py-2.5 text-right font-mono ${g.colorA} tabular-nums whitespace-nowrap border-l border-gray-100`}>
                        {fmt(valA)}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-mono ${g.colorB} tabular-nums whitespace-nowrap`}>
                        {fmt(valB)}
                      </td>
                    </Fragment>
                  )
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

