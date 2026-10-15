import { useCallback } from 'react'
import { buildReportMetricRows, buildReportsSummaryRows, downloadCsv } from '@/lib/csv'
import type { ReportMeta, ReportMetrics } from '@/types/api'

export function useDownloadReportMetricsCsv(reportId: string) {
  return useCallback(
    (metrics: ReportMetrics, groupBy: 'byCashier' | 'byBetshop') => {
      const rows = buildReportMetricRows(metrics, groupBy)
      const suffix = groupBy === 'byCashier' ? 'by-cashier' : 'by-betshop'
      downloadCsv(rows, `report-${reportId}-${suffix}.csv`)
    },
    [reportId],
  )
}

export function useDownloadReportsSummaryCsv() {
  return useCallback((reports: ReportMeta[]) => {
    const rows = buildReportsSummaryRows(reports)
    downloadCsv(rows, `reports-summary-${new Date().toISOString().slice(0, 10)}.csv`)
  }, [])
}
