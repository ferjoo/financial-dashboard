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
    paymentsIn: totals.deposits ?? 0,
    paymentsOut: totals.withdrawals ?? 0,
    sales: totals.bets ?? 0,
    refunds: totals.payouts ?? 0,
    returns: totals.winnings ?? 0,
    salesCount: totals.betsCount ?? 0,
    paymentsInCount: totals.depositsCount ?? 0,
    paymentsOutCount: totals.withdrawalsCount ?? 0,
  }))
}

export function buildReportsSummaryRows(reports: ReportMeta[]): object[] {
  return reports.map((r) => ({
    reportId: r.reportId,
    createdAt: r.createdAt,
  }))
}
