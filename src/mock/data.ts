// Invented sample data for the public demo. Every name, amount and date here is generated;
// none of it comes from real transactions.
import type {
  AffiliateData,
  AffiliateReportData,
  GerenciaMetrics,
  ReportMeta,
  ReportMetrics,
  TransactionTypeTotals,
  UserProfile,
} from '@/types/api'
import { createRandom, round2, type Random } from './random'

// ── Bet shops and cashiers ──────────────────────────────────────────────────

interface Shop {
  name: string
  size: number
}

interface Cashier {
  name: string
  shop: string
  /** Hours the cashier is on shift (inclusive start, exclusive end) */
  shift: [number, number]
}

const SHOPS: Shop[] = [
  { name: 'Zona 1 Centro', size: 1.35 },
  { name: 'Mixco Plaza', size: 1.1 },
  { name: 'Villa Nueva Sur', size: 0.95 },
  { name: 'Antigua Calle Real', size: 0.8 },
  { name: 'Xela Parque Central', size: 1.0 },
  { name: 'Escuintla Terminal', size: 0.7 },
]

const CASHIER_NAMES = [
  'Ana Lucía Pérez', 'Carlos Méndez', 'María José Ruiz', 'Diego Herrera',
  'Sofía Castillo', 'Luis Fernando Ortiz', 'Gabriela Morán', 'Javier Solís',
  'Andrea Cifuentes', 'Kevin Barrios', 'Daniela Recinos', 'Pablo Estrada',
]

const MORNING: [number, number] = [7, 15]
const EVENING: [number, number] = [15, 23]

const CASHIERS: Cashier[] = SHOPS.flatMap((shop, i) => [
  { name: CASHIER_NAMES[i * 2], shop: shop.name, shift: MORNING },
  { name: CASHIER_NAMES[i * 2 + 1], shop: shop.name, shift: EVENING },
])

/** Relative activity by hour of day: quiet mornings, busy evenings */
const HOUR_WEIGHT = [
  0.05, 0.03, 0.02, 0.02, 0.02, 0.03, 0.08, 0.25, 0.35, 0.4, 0.45, 0.5,
  0.6, 0.55, 0.5, 0.55, 0.65, 0.75, 0.9, 1.0, 0.95, 0.85, 0.6, 0.3,
]

/** Monday = 0 … Sunday = 6; weekends and match days are busier */
const WEEKDAY_WEIGHT = [0.8, 0.85, 0.95, 0.9, 1.1, 1.35, 1.3]

// ── Transaction cells: one per report × day × hour × cashier ────────────────

interface Cell {
  reportId: string
  date: string
  hour: string
  cashier: string
  shop: string
  totals: TransactionTypeTotals
}

interface StoredReport extends ReportMeta {
  cells: Cell[]
}

const DAY_MS = 86_400_000

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function addTotals(target: TransactionTypeTotals, source: TransactionTypeTotals, skip: string[] = []) {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value !== 'number' || skip.includes(key)) continue
    target[key] = round2((target[key] ?? 0) + value)
  }
}

function makeCell(rand: Random, base: { reportId: string; date: string; hour: number; cashier: Cashier }, intensity: number): Cell | null {
  const betsCount = Math.round(intensity * rand.between(3, 9))
  if (betsCount === 0) return null
  const bets = round2(betsCount * rand.between(25, 110))
  const depositsCount = Math.max(0, Math.round(betsCount * rand.between(0.2, 0.45)))
  const withdrawalsCount = Math.round(depositsCount * rand.between(0.3, 0.7))
  const payoutsCount = Math.round(betsCount * rand.between(0.15, 0.4))
  const cancellationsCount = rand.chance(0.06) ? 1 : 0
  const payouts = round2(bets * rand.between(0.55, 1.05))
  const totals: TransactionTypeTotals = {
    bets,
    betsCount,
    deposits: round2(depositsCount * rand.between(90, 260)),
    depositsCount,
    withdrawals: round2(withdrawalsCount * rand.between(120, 320)),
    withdrawalsCount,
    payouts,
    payoutsCount,
    // "Won" rows belong to the bet shop, not the cashier (same as the real CSVs)
    winnings: round2(payouts * rand.between(0.95, 1.05)),
    winningsCount: payoutsCount,
    cancellations: cancellationsCount ? round2(rand.between(20, 150)) : 0,
    cancellationsCount,
  }
  return {
    reportId: base.reportId,
    date: base.date,
    hour: String(base.hour).padStart(2, '0'),
    cashier: base.cashier.name,
    shop: base.cashier.shop,
    totals,
  }
}

/** Builds one weekly report starting on `monday`. */
function generateWeeklyReport(monday: Date, seed: number, withAnomaly: boolean): StoredReport {
  const rand = createRandom(seed)
  const dateFrom = isoDate(monday)
  const reportId = `RPT-${dateFrom}`
  const cells: Cell[] = []

  for (let day = 0; day < 7; day++) {
    const date = isoDate(new Date(monday.getTime() + day * DAY_MS))
    for (const cashier of CASHIERS) {
      const shop = SHOPS.find((s) => s.name === cashier.shop)!
      for (let hour = cashier.shift[0]; hour < cashier.shift[1]; hour++) {
        const intensity = HOUR_WEIGHT[hour] * WEEKDAY_WEIGHT[day] * shop.size * rand.between(0.6, 1.4)
        const cell = makeCell(rand, { reportId, date, hour, cashier }, intensity)
        if (cell) cells.push(cell)
      }
    }
  }

  // A couple of off-hours sessions so the hourly audit heatmap has something to flag
  if (withAnomaly) {
    const cashier = CASHIERS[5]
    const date = isoDate(new Date(monday.getTime() + 3 * DAY_MS))
    for (const hour of [2, 3]) {
      const cell = makeCell(rand, { reportId, date, hour, cashier }, 1.6)
      if (cell) cells.push(cell)
    }
  }

  const uploaded = new Date(monday.getTime() + 7 * DAY_MS + 9 * 3_600_000 + rand.int(0, 50) * 60_000)
  return {
    reportId,
    createdAt: uploaded.toISOString(),
    dateFrom,
    dateTo: isoDate(new Date(monday.getTime() + 6 * DAY_MS)),
    cells,
  }
}

// Eight weekly reports, the latest one covering 23–29 March 2026
const FIRST_MONDAY = Date.UTC(2026, 1, 2)
const WEEKS = 8

const reports: StoredReport[] = Array.from({ length: WEEKS }, (_, i) =>
  generateWeeklyReport(new Date(FIRST_MONDAY + i * 7 * DAY_MS), 1000 + i, i === WEEKS - 2),
)

function toMeta({ reportId, createdAt, dateFrom, dateTo }: StoredReport): ReportMeta {
  return { reportId, createdAt, dateFrom, dateTo }
}

export function listReports(): ReportMeta[] {
  return [...reports].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(toMeta)
}

export function findReport(reportId: string) {
  return reports.find((r) => r.reportId === reportId)
}

export function deleteReport(reportId: string) {
  const index = reports.findIndex((r) => r.reportId === reportId)
  if (index >= 0) reports.splice(index, 1)
  return index >= 0
}

/** Upload simulation: the file is never sent anywhere; we generate the following week instead. */
export function simulateUpload(seed: number): StoredReport {
  const latest = reports.reduce((max, r) => Math.max(max, Date.parse(`${r.dateFrom}T00:00:00Z`)), FIRST_MONDAY - 7 * DAY_MS)
  const report = generateWeeklyReport(new Date(latest + 7 * DAY_MS), seed, false)
  report.createdAt = new Date().toISOString()
  reports.push(report)
  return report
}

function cellsInRange(cells: Cell[], from?: string, to?: string) {
  return cells.filter((c) => (!from || c.date >= from) && (!to || c.date <= to))
}

export function computeMetrics(cells: Cell[], from?: string, to?: string): ReportMetrics {
  const byCashier: Record<string, TransactionTypeTotals> = {}
  const byBetshop: Record<string, TransactionTypeTotals> = {}
  const byBetshopCashier: Record<string, Record<string, TransactionTypeTotals>> = {}
  const byDayHour: Record<string, Record<string, TransactionTypeTotals>> = {}
  const cashierOnly = ['winnings', 'winningsCount']

  for (const cell of cellsInRange(cells, from, to)) {
    addTotals((byCashier[cell.cashier] ??= {}), cell.totals, cashierOnly)
    addTotals((byBetshop[cell.shop] ??= {}), cell.totals)
    addTotals(((byBetshopCashier[cell.shop] ??= {})[cell.cashier] ??= {}), cell.totals, cashierOnly)
    addTotals(((byDayHour[cell.date] ??= {})[cell.hour] ??= {}), cell.totals)
  }
  return { byCashier, byBetshop, byBetshopCashier, byDayHour }
}

export function computeGerencia(): GerenciaMetrics {
  const reportCount = reports.length
  const all = computeMetrics(reports.flatMap((r) => r.cells))
  const totals: Record<string, number> = {}
  for (const t of Object.values(all.byCashier)) addTotals(totals, t)
  for (const t of Object.values(all.byBetshop)) {
    totals.winnings = round2((totals.winnings ?? 0) + (t.winnings ?? 0))
    totals.winningsCount = (totals.winningsCount ?? 0) + (t.winningsCount ?? 0)
  }
  totals.ggr = round2((totals.bets ?? 0) - (totals.payouts ?? 0))
  totals.ngr = totals.ggr

  const average = (t: Record<string, number>) =>
    Object.fromEntries(Object.entries(t).map(([k, v]) => [k, reportCount ? round2(v / reportCount) : 0]))
  const withAverages = (group: Record<string, TransactionTypeTotals>) =>
    Object.fromEntries(
      Object.entries(group).map(([name, t]) => {
        const clean = t as Record<string, number>
        return [name, { totals: clean, averages: average(clean) }]
      }),
    )

  return {
    reportCount,
    totals,
    averages: average(totals),
    byCashier: withAverages(all.byCashier),
    byBetshop: withAverages(all.byBetshop),
    byBetshopCashier: all.byBetshopCashier as Record<string, Record<string, Record<string, number>>>,
    betshopCount: Object.keys(all.byBetshop).length,
    cashierCount: Object.keys(all.byCashier).length,
  }
}

// ── Affiliates ──────────────────────────────────────────────────────────────

const AFFILIATE_HANDLES = [
  'quetzal_bets', 'volcan_tips', 'tikal_picks', 'ceiba_media', 'atitlan_promo', 'pacaya_sports',
  'jaguar_odds', 'maya_streams', 'izabal_fans', 'peten_gol', 'quetzal_tipster', 'lago_azul_tv',
  'xela_futbol', 'antigua_social', 'cuchumatanes', 'rio_dulce_bets', 'monterrico_live', 'fuego_picks',
  'santa_ana_media', 'copan_gaming', 'zacapa_deportes', 'coban_news', 'retalhuleu_fm', 'mazate_tips',
  'jutiapa_promo', 'flores_live', 'huehue_streams', 'sacate_bets', 'salama_social', 'chiqui_tips',
]

interface Affiliate {
  affiliateId: string
  username: string
  status: string
  reach: number
}

const AFFILIATES: Affiliate[] = (() => {
  const rand = createRandom(77)
  return AFFILIATE_HANDLES.map((username, i) => ({
    affiliateId: String(48210 + i * 7),
    username,
    status: rand.chance(0.15) ? 'Inactive' : 'Active',
    // A few big affiliates, a long tail of small ones
    reach: Math.pow(rand.next(), 2.2) * 3 + 0.1,
  }))
})()

interface StoredAffiliateReport {
  reportId: string
  createdAt: string
  affiliates: Record<string, AffiliateData>
  totals: { ftdCount: number; ftdAmount: number }
}

function generateAffiliateReport(year: number, month: number, seed: number): StoredAffiliateReport {
  const rand = createRandom(seed)
  const affiliates: Record<string, AffiliateData> = {}
  let ftdCount = 0
  let ftdAmount = 0

  for (const aff of AFFILIATES) {
    const active = aff.status === 'Active' || rand.chance(0.2)
    const playerRegistrations = active ? Math.round(aff.reach * rand.between(4, 22)) : 0
    const ftd = Math.round(playerRegistrations * rand.between(0.18, 0.42))
    const ftdValue = round2(ftd * rand.between(80, 240))
    const depositCount = Math.round(ftd * rand.between(1.8, 4.5))
    const depositAmount = round2(depositCount * rand.between(90, 260))
    const ngr = round2(depositAmount * rand.between(-0.1, 0.35))
    affiliates[aff.affiliateId] = {
      affiliateId: aff.affiliateId,
      username: aff.username,
      status: aff.status,
      playerRegistrations,
      ftdCount: ftd,
      ftdAmount: ftdValue,
      depositCount,
      depositAmount,
      ngr,
      totalEarning: round2(Math.max(0, ngr * 0.3)),
    }
    ftdCount += ftd
    ftdAmount += ftdValue
  }

  const createdAt = new Date(Date.UTC(year, month + 1, 2, 15, 30)).toISOString()
  return {
    reportId: `AFF-${year}-${String(month + 1).padStart(2, '0')}`,
    createdAt,
    affiliates,
    totals: { ftdCount, ftdAmount: round2(ftdAmount) },
  }
}

const affiliateReports: StoredAffiliateReport[] = [
  generateAffiliateReport(2025, 11, 501),
  generateAffiliateReport(2026, 0, 502),
  generateAffiliateReport(2026, 1, 503),
]

export function listAffiliateReports() {
  return [...affiliateReports]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(({ reportId, createdAt }) => ({ reportId, createdAt }))
}

export function findAffiliateReport(reportId: string): AffiliateReportData | undefined {
  return affiliateReports.find((r) => r.reportId === reportId)
}

export function deleteAffiliateReport(reportId: string) {
  const index = affiliateReports.findIndex((r) => r.reportId === reportId)
  if (index >= 0) affiliateReports.splice(index, 1)
  return index >= 0
}

export function simulateAffiliateUpload(seed: number): StoredAffiliateReport {
  const latest = affiliateReports.reduce((max, r) => (r.reportId > max ? r.reportId : max), 'AFF-2026-02')
  const [, y, m] = latest.split('-').map(Number)
  const report = generateAffiliateReport(m === 12 ? y + 1 : y, m % 12, seed)
  report.createdAt = new Date().toISOString()
  affiliateReports.push(report)
  return report
}

export function computeAffiliateSummary() {
  const affiliates: Record<string, AffiliateData> = {}
  let ftdCount = 0
  let ftdAmount = 0
  for (const report of affiliateReports) {
    for (const a of Object.values(report.affiliates)) {
      const acc = (affiliates[a.affiliateId] ??= { ...a, ftdCount: 0, ftdAmount: 0, playerRegistrations: 0, depositCount: 0, depositAmount: 0, ngr: 0, totalEarning: 0 })
      acc.ftdCount += a.ftdCount
      acc.ftdAmount = round2(acc.ftdAmount + a.ftdAmount)
      acc.playerRegistrations += a.playerRegistrations
      acc.depositCount += a.depositCount
      acc.depositAmount = round2(acc.depositAmount + a.depositAmount)
      acc.ngr = round2(acc.ngr + a.ngr)
      acc.totalEarning = round2(acc.totalEarning + a.totalEarning)
    }
    ftdCount += report.totals.ftdCount
    ftdAmount += report.totals.ftdAmount
  }
  return { affiliates, totals: { ftdCount, ftdAmount: round2(ftdAmount) }, reportCount: affiliateReports.length }
}

// ── Users ───────────────────────────────────────────────────────────────────

export const users: UserProfile[] = [
  { _id: 'u-01', email: 'demo.superadmin@example.com', role: 'superadmin', firstName: 'Demo', lastName: 'Superadmin', createdAt: '2025-11-03T15:00:00.000Z' },
  { _id: 'u-02', email: 'finanzas@example.com', role: 'offline_admin', firstName: 'Rocío', lastName: 'Aguilar', createdAt: '2025-11-05T16:20:00.000Z' },
  { _id: 'u-03', email: 'gerencia@example.com', role: 'offline_viewer', firstName: 'Mario', lastName: 'Fuentes', createdAt: '2025-11-10T14:05:00.000Z' },
  { _id: 'u-04', email: 'auditoria@example.com', role: 'offline_viewer', firstName: 'Lucía', lastName: 'Monzón', createdAt: '2025-12-01T17:45:00.000Z' },
  { _id: 'u-05', email: 'online.ops@example.com', role: 'online_admin', firstName: 'Esteban', lastName: 'Girón', createdAt: '2026-01-12T13:30:00.000Z' },
  { _id: 'u-06', email: 'marketing@example.com', role: 'online_viewer', firstName: 'Valeria', lastName: 'Pineda', createdAt: '2026-02-02T18:10:00.000Z' },
]
