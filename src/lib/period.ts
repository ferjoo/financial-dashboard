import type { ReportMeta } from '@/types/api'

/** "Mar 23 – Mar 29, 2026" from a report's covered dates, falling back to its upload date. */
export function formatPeriod(report: Pick<ReportMeta, 'dateFrom' | 'dateTo' | 'createdAt'>): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' }
  const from = report.dateFrom ? new Date(`${report.dateFrom}T00:00:00Z`) : new Date(report.createdAt)
  const to = report.dateTo ? new Date(`${report.dateTo}T00:00:00Z`) : null
  const year = (to ?? from).getUTCFullYear()
  if (!to || report.dateFrom === report.dateTo) {
    return `${from.toLocaleDateString('en-US', opts)}, ${year}`
  }
  return `${from.toLocaleDateString('en-US', opts)} – ${to.toLocaleDateString('en-US', opts)}, ${year}`
}

/** "March 2026" for monthly partner reports (PRT-YYYY-MM); other ids are returned as-is. */
export function formatAffiliatePeriod(reportId: string): string {
  const match = /^PRT-(\d{4})-(\d{2})$/.exec(reportId)
  if (!match) return reportId
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
}
