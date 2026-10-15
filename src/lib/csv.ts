import Papa from 'papaparse'
import type { ReportMeta, ReportMetrics } from '@/types/api'

export function downloadCsv(rows: object[], filename: string): void {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function buildReportMetricRows(
  metrics: ReportMetrics,
  groupBy: 'byCashier' | 'byBetshop',
): object[] {
  const data = metrics[groupBy] ?? {}
  return Object.entries(data).map(([name, totals]) => ({
    name,
    deposits: totals.deposits ?? 0,
    withdrawals: totals.withdrawals ?? 0,
    bets: totals.bets ?? 0,
    payouts: totals.payouts ?? 0,
    winnings: totals.winnings ?? 0,
    betsCount: totals.betsCount ?? 0,
    depositsCount: totals.depositsCount ?? 0,
    withdrawalsCount: totals.withdrawalsCount ?? 0,
  }))
}

export function buildReportsSummaryRows(reports: ReportMeta[]): object[] {
  return reports.map((r) => ({
    reportId: r.reportId,
    createdAt: r.createdAt,
  }))
}
