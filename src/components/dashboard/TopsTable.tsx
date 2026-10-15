import type { TopEntry } from '@/types/api'
import { Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface TopsTableProps {
  title: string
  entries: TopEntry[]
  type: 'deposits' | 'withdrawals'
}

const rankColors = [
  'bg-yellow-50 text-yellow-700',
  'bg-gray-100 text-gray-600',
  'bg-orange-50 text-orange-700',
]

export default function TopsTable({ title, entries, type }: TopsTableProps) {
  const isDeposits = type === 'deposits'

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        {isDeposits ? (
          <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-purple-600" />
        )}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-5 py-2.5 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-5 py-8 text-center text-sm text-gray-400">
                No data available
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => (
              <tr key={entry.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 whitespace-nowrap">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold ${
                      index < 3 ? rankColors[index] : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {index < 3 ? <Trophy className="w-3.5 h-3.5" /> : index + 1}
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-700 font-medium">
                  {entry.name}
                </td>
                <td className="px-5 py-3 whitespace-nowrap text-right">
                  <span className={`font-mono text-sm font-semibold ${isDeposits ? 'text-green-700' : 'text-purple-700'}`}>
                    {formatCurrency(entry.value)}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {entries.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="text-xs text-gray-400">Total (Top {entries.length})</span>
          <span className={`font-mono text-sm font-semibold ${isDeposits ? 'text-green-700' : 'text-purple-700'}`}>
            {formatCurrency(entries.reduce((sum, e) => sum + e.value, 0))}
          </span>
        </div>
      )}
    </div>
  )
}
