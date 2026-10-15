// In-browser stand-in for the NestJS API. Axios hands every request here instead of the network,
// so the hooks and pages keep calling the same endpoints they used against the real backend.
import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { RequestUser, TopEntry, UserProfile } from '@/types/api'
import {
  computeAffiliateSummary,
  computeGerencia,
  computeMetrics,
  deleteAffiliateReport,
  deleteReport,
  findAffiliateReport,
  findReport,
  listAffiliateReports,
  listReports,
  simulateAffiliateUpload,
  simulateUpload,
  users,
} from './data'

export type DemoRole = UserProfile['role']

export const DEMO_ROLES: { role: DemoRole; label: string }[] = [
  { role: 'superadmin', label: 'Superadmin' },
  { role: 'offline_admin', label: 'In-store admin' },
  { role: 'offline_viewer', label: 'In-store viewer' },
  { role: 'online_admin', label: 'Online admin' },
  { role: 'online_viewer', label: 'Online viewer' },
]

const ROLE_KEY = 'demo-role'

export function getDemoRole(): DemoRole {
  try {
    const saved = localStorage.getItem(ROLE_KEY)
    if (DEMO_ROLES.some((r) => r.role === saved)) return saved as DemoRole
  } catch {
    // storage unavailable (private mode): fall back to the default role
  }
  return 'superadmin'
}

export function setDemoRole(role: DemoRole) {
  try {
    localStorage.setItem(ROLE_KEY, role)
  } catch {
    // ignore: the role still applies until the page reloads
  }
  currentRole = role
}

let currentRole: DemoRole = getDemoRole()

function demoUser(): RequestUser {
  const label = DEMO_ROLES.find((r) => r.role === currentRole)?.label ?? 'Demo'
  return {
    userId: `demo-${currentRole}`,
    email: `demo.${currentRole.replace('_', '.')}@example.com`,
    role: currentRole,
    firstName: 'Demo',
    lastName: label,
  }
}

type Result = { status: number; data: unknown }

const ok = (data: unknown): Result => ({ status: 200, data })
const notFound = (what: string): Result => ({ status: 404, data: { message: `${what} not found` } })

function seedFrom(text: string) {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
  return h >>> 0
}

function parseBody(data: unknown): Record<string, unknown> {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return (data as Record<string, unknown>) ?? {}
}

function uploadedName(data: unknown) {
  const file = data instanceof FormData ? data.get('file') : null
  return file instanceof File ? `${file.name}:${file.size}` : String(Date.now())
}

function tops(entities: Record<string, Record<string, number | undefined>>, type: string, limit: number): TopEntry[] {
  return Object.entries(entities)
    .map(([name, t]) => ({ name, value: t[type] ?? 0 }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

function route(method: string, path: string, params: Record<string, string>, data: unknown): Result {
  const parts = path.split('/').filter(Boolean)

  // ── Auth ──
  if (path === '/auth/me' && method === 'get') return ok(demoUser())
  if (path === '/auth/login' && method === 'post') return ok({ access_token: 'demo-token', ...demoUser() })
  if (path === '/auth/logout') return ok({})

  // ── Users ──
  if (parts[0] === 'users') {
    const id = parts[1]
    if (!id && method === 'get') return ok({ users })
    if (!id && method === 'post') {
      const body = parseBody(data)
      const user: UserProfile = {
        _id: `u-${Date.now()}`,
        email: String(body.email ?? ''),
        role: (body.role as DemoRole) ?? 'offline_viewer',
        firstName: String(body.firstName ?? ''),
        lastName: String(body.lastName ?? ''),
        createdAt: new Date().toISOString(),
      }
      users.push(user)
      return ok(user)
    }
    const index = users.findIndex((u) => u._id === id)
    if (index < 0) return notFound('User')
    if (method === 'put') {
      const body = parseBody(data)
      delete body.password
      users[index] = { ...users[index], ...(body as Partial<UserProfile>) }
      return ok(users[index])
    }
    if (method === 'delete') {
      users.splice(index, 1)
      return ok({})
    }
  }

  // ── Partner reports (must match before /reports/:id) ──
  if (parts[0] === 'reports' && parts[1] === 'upload-affiliate' && method === 'post') {
    const report = simulateAffiliateUpload(seedFrom(uploadedName(data)))
    return ok({ reportId: report.reportId, affiliates: report.affiliates, totals: report.totals })
  }
  if (parts[0] === 'reports' && parts[1] === 'affiliates') {
    const id = parts[2]
    if (!id) return ok({ reports: listAffiliateReports() })
    if (id === 'summary') return ok(computeAffiliateSummary())
    if (method === 'delete') return deleteAffiliateReport(id) ? ok({}) : notFound('Report')
    const report = findAffiliateReport(id)
    return report ? ok(report) : notFound('Report')
  }

  // ── Financial reports ──
  if (parts[0] === 'reports') {
    const id = parts[1]
    if (!id && method === 'get') return ok({ reports: listReports() })
    if (id === 'gerencia') return ok(computeGerencia())
    if (id === 'summary') {
      const g = computeGerencia()
      const flatten = (group: typeof g.byCashier) =>
        Object.fromEntries(Object.entries(group).map(([k, v]) => [k, v.totals]))
      return ok({ byCashier: flatten(g.byCashier), byBetshop: flatten(g.byBetshop), reportCount: g.reportCount })
    }
    if (id === 'upload' && method === 'post') {
      const report = simulateUpload(seedFrom(uploadedName(data)))
      const m = computeMetrics(report.cells)
      return ok({ reportId: report.reportId, byCashier: m.byCashier, byBetshop: m.byBetshop })
    }
    if (method === 'delete') return deleteReport(id) ? ok({}) : notFound('Report')

    const report = findReport(id)
    if (!report) return notFound('Report')
    const metrics = computeMetrics(report.cells, params.from, params.to)
    if (parts[2] === 'metrics') return ok(metrics)
    if (parts[2] === 'tops') {
      const type = params.type ?? 'deposits'
      const limit = Number(params.limit ?? 10)
      const by = params.by ?? 'both'
      return ok({
        ...(by !== 'betshop' && { cashier: tops(metrics.byCashier, type, limit) }),
        ...(by !== 'cashier' && { betshop: tops(metrics.byBetshop, type, limit) }),
      })
    }
    return ok({ reportId: report.reportId, createdAt: report.createdAt, byCashier: metrics.byCashier, byBetshop: metrics.byBetshop })
  }

  return notFound(`Endpoint ${method.toUpperCase()} ${path}`)
}

export const mockAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  // A short, variable delay so loading states are visible, like a real API
  await new Promise((resolve) => setTimeout(resolve, 180 + Math.random() * 320))

  const url = new URL(config.url ?? '/', 'https://demo.local')
  const params: Record<string, string> = {}
  url.searchParams.forEach((v, k) => (params[k] = v))
  for (const [k, v] of Object.entries(config.params ?? {})) {
    if (v !== undefined && v !== null) params[k] = String(v)
  }

  const { status, data } = route((config.method ?? 'get').toLowerCase(), url.pathname, params, config.data)
  const response: AxiosResponse = { data, status, statusText: status === 200 ? 'OK' : 'Not Found', headers: {}, config, request: {} }
  if (status >= 400) {
    throw new AxiosError((data as { message: string }).message, String(status), config, null, response)
  }
  return response
}
