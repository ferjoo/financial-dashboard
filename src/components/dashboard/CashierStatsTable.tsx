import { fmtQ, fmtUSD } from '@/context/currency'
import type { TransactionTypeTotals } from '@/types/api'
import { Users, type LucideIcon } from 'lucide-react'

interface CashierStatsTableProps {
  data: Record<string, TransactionTypeTotals>
  title?: string
  entityLabel?: string
  icon?: LucideIcon
}

interface Row {
  name: string
  depositsCount: number
  deposits: number
  betsCount: number
  bets: number
  payoutsCount: number
  payouts: number
  withdrawalsCount: number
  withdrawals: number
}

export default function CashierStatsTable({ data, title = 'Agent breakdown', entityLabel = 'Agent', icon: Icon = Users }: CashierStatsTableProps) {
  const rows: Row[] = Object.entries(data)
    .map(([name, t]) => ({
      name,
      depositsCount: t.depositsCount ?? 0,
      deposits: t.deposits ?? 0,
      betsCount: t.betsCount ?? 0,
      bets: t.bets ?? 0,
      payoutsCount: t.payoutsCount ?? 0,
      payouts: t.payouts ?? 0,
      withdrawalsCount: t.withdrawalsCount ?? 0,
      withdrawals: t.withdrawals ?? 0,
    }))
    .sort((a, b) => b.bets - a.bets)

  const totals = rows.reduce<Row>(
    (acc, r) => ({
      name: 'Total',
      depositsCount: acc.depositsCount + r.depositsCount,
      deposits: acc.deposits + r.deposits,
      betsCount: acc.betsCount + r.betsCount,
      bets: acc.bets + r.bets,
      payoutsCount: acc.payoutsCount + r.payoutsCount,
      payouts: acc.payouts + r.payouts,
      withdrawalsCount: acc.withdrawalsCount + r.withdrawalsCount,
      withdrawals: acc.withdrawals + r.withdrawals,
    }),
    { name: 'Total', depositsCount: 0, deposits: 0, betsCount: 0, bets: 0, payoutsCount: 0, payouts: 0, withdrawalsCount: 0, withdrawals: 0 },
  )

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {/* group headers */}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider" rowSpan={2}>
                {entityLabel}
              </th>
              <th
                className="px-4 py-2 text-center text-xs font-medium text-blue-500 uppercase tracking-wider border-l border-gray-100"
                colSpan={3}
              >
                Tickets
              </th>
              <th
                className="px-4 py-2 text-center text-xs font-medium text-green-500 uppercase tracking-wider border-l border-gray-100"
                colSpan={3}
              >
                Payments in
              </th>
              <th
                className="px-4 py-2 text-center text-xs font-medium text-orange-500 uppercase tracking-wider border-l border-gray-100"
                colSpan={3}
              >
                Refunds
              </th>
              <th
                className="px-4 py-2 text-center text-xs font-medium text-purple-500 uppercase tracking-wider border-l border-gray-100"
                colSpan={3}
              >
                Payments out
              </th>
            </tr>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {/* Tickets */}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-100">#</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">GTQ</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">$</th>

              {/* Payments in */}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-100">#</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">GTQ</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">$</th>

              {/* Refunds */}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-100">#</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">GTQ</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">$</th>

              {/* Payments out */}
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider border-l border-gray-100">#</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">GTQ</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">$</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">{r.name}</td>

                  <td className="px-4 py-2.5 text-right text-gray-500 tabular-nums border-l border-gray-100">
                    {r.betsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-blue-700 tabular-nums whitespace-nowrap">
                    {fmtQ(r.bets)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-blue-500 tabular-nums whitespace-nowrap">
                    {fmtUSD(r.bets)}
                  </td>

                  <td className="px-4 py-2.5 text-right text-gray-500 tabular-nums border-l border-gray-100">
                    {r.depositsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-green-700 tabular-nums whitespace-nowrap">
                    {fmtQ(r.deposits)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-green-500 tabular-nums whitespace-nowrap">
                    {fmtUSD(r.deposits)}
                  </td>

                  <td className="px-4 py-2.5 text-right text-gray-500 tabular-nums border-l border-gray-100">
                    {r.payoutsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-orange-700 tabular-nums whitespace-nowrap">
                    {fmtQ(r.payouts)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-orange-500 tabular-nums whitespace-nowrap">
                    {fmtUSD(r.payouts)}
                  </td>

                  <td className="px-4 py-2.5 text-right text-gray-500 tabular-nums border-l border-gray-100">
                    {r.withdrawalsCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-purple-700 tabular-nums whitespace-nowrap">
                    {fmtQ(r.withdrawals)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-purple-500 tabular-nums whitespace-nowrap">
                    {fmtUSD(r.withdrawals)}
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <td className="px-4 py-2.5 text-gray-700">Total</td>

                <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums border-l border-gray-100">
                  {totals.betsCount.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-blue-700 tabular-nums whitespace-nowrap">
                  {fmtQ(totals.bets)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-blue-500 tabular-nums whitespace-nowrap">
                  {fmtUSD(totals.bets)}
                </td>

                <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums border-l border-gray-100">
                  {totals.depositsCount.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-green-700 tabular-nums whitespace-nowrap">
                  {fmtQ(totals.deposits)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-green-500 tabular-nums whitespace-nowrap">
                  {fmtUSD(totals.deposits)}
                </td>

                <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums border-l border-gray-100">
                  {totals.payoutsCount.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-orange-700 tabular-nums whitespace-nowrap">
                  {fmtQ(totals.payouts)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-orange-500 tabular-nums whitespace-nowrap">
                  {fmtUSD(totals.payouts)}
                </td>

                <td className="px-4 py-2.5 text-right text-gray-600 tabular-nums border-l border-gray-100">
                  {totals.withdrawalsCount.toLocaleString()}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-purple-700 tabular-nums whitespace-nowrap">
                  {fmtQ(totals.withdrawals)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-purple-500 tabular-nums whitespace-nowrap">
                  {fmtUSD(totals.withdrawals)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
