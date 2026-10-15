export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  userId: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export interface RequestUser {
  userId: string
  email: string
  role: string
  firstName: string
  lastName: string
}

export interface UserProfile {
  _id: string
  email: string
  role: 'superadmin' | 'offline_admin' | 'online_admin' | 'offline_viewer' | 'online_viewer'
  firstName: string
  lastName: string
  createdAt: string
}

export interface CreateUserRequest {
  email: string
  password: string
  role: string
  firstName: string
  lastName: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  role?: string
  firstName?: string
  lastName?: string
}

export interface TransactionTypeTotals {
  deposits?: number
  depositsCount?: number
  withdrawals?: number
  withdrawalsCount?: number
  bets?: number
  betsCount?: number
  payouts?: number
  payoutsCount?: number
  winnings?: number
  winningsCount?: number
  cancellations?: number
  cancellationsCount?: number
  ggr?: number
  ngr?: number
  [key: string]: number | undefined
}

export interface ReportMeta {
  reportId: string
  createdAt: string
  /** Earliest transaction date in the CSV (YYYY-MM-DD) */
  dateFrom?: string
  /** Latest transaction date in the CSV (YYYY-MM-DD) */
  dateTo?: string
}

export interface ReportsListResponse {
  reports: ReportMeta[]
}

export interface ReportData {
  reportId: string
  createdAt: string
  byCashier?: Record<string, TransactionTypeTotals>
  byBetshop?: Record<string, TransactionTypeTotals>
  [key: string]: unknown
}

export interface ReportMetrics {
  byCashier: Record<string, TransactionTypeTotals>
  byBetshop: Record<string, TransactionTypeTotals>
  /** Cashiers grouped by betshop: betshopName -> cashierName -> totals */
  byBetshopCashier?: Record<string, Record<string, TransactionTypeTotals>>
  /** date -> hour ("00"-"23") -> transaction type totals. Available on reports uploaded after this feature was deployed. */
  byDayHour?: Record<string, Record<string, TransactionTypeTotals>>
}

export interface ReportSummary {
  byCashier: Record<string, Record<string, number>>
  byBetshop: Record<string, Record<string, number>>
  reportCount: number
}

export interface GerenciaMetrics {
  reportCount: number
  /** Includes deposits, withdrawals, bets, payouts, winnings, *Count variants, ggr, ngr */
  totals: Record<string, number>
  averages: Record<string, number>
  byCashier: Record<string, { totals: Record<string, number>; averages: Record<string, number> }>
  byBetshop: Record<string, { totals: Record<string, number>; averages: Record<string, number> }>
  /** betshopName -> cashierName -> aggregated totals */
  byBetshopCashier?: Record<string, Record<string, Record<string, number>>>
  betshopCount?: number
  cashierCount?: number
}

export interface TopEntry {
  name: string
  value: number
}

export interface TopsResponse {
  cashier?: TopEntry[]
  betshop?: TopEntry[]
}

export interface UploadResponse {
  reportId: string
  byCashier: Record<string, TransactionTypeTotals>
  byBetshop: Record<string, TransactionTypeTotals>
}

// ── Affiliate Reports ──

export interface AffiliateData {
  affiliateId: string
  username: string
  status: string
  ftdCount: number
  ftdAmount: number
  playerRegistrations: number
  depositCount: number
  depositAmount: number
  ngr: number
  totalEarning: number
}

export interface AffiliateReportMeta {
  reportId: string
  createdAt: string
}

export interface AffiliateReportData {
  reportId: string
  createdAt: string
  affiliates: Record<string, AffiliateData>
  totals: { ftdCount: number; ftdAmount: number }
}

export interface AffiliateSummary {
  affiliates: Record<string, AffiliateData>
  totals: { ftdCount: number; ftdAmount: number }
  reportCount: number
}

export interface AffiliateUploadResponse {
  reportId: string
  affiliates: Record<string, AffiliateData>
  totals: { ftdCount: number; ftdAmount: number }
}
