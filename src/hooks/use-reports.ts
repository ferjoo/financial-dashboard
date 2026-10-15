import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  ReportsListResponse,
  ReportData,
  ReportMetrics,
  ReportSummary,
  GerenciaMetrics,
  TopsResponse,
  UploadResponse,
} from '@/types/api'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await api.get<ReportsListResponse>('/reports')
      return data.reports
    },
  })
}

export function useReport(reportId: string) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: async () => {
      const { data } = await api.get<ReportData>(`/reports/${reportId}`)
      return data
    },
    enabled: !!reportId,
  })
}

export function useReportMetrics(reportId: string) {
  return useQuery({
    queryKey: ['report-metrics', reportId],
    queryFn: async () => {
      const { data } = await api.get<ReportMetrics>(
        `/reports/${reportId}/metrics`,
      )
      return data
    },
    enabled: !!reportId,
  })
}

export function useReportTops(
  reportId: string,
  params?: { type?: string; limit?: number; by?: 'cashier' | 'betshop' | 'both' },
) {
  return useQuery({
    queryKey: ['report-tops', reportId, params],
    queryFn: async () => {
      const { data } = await api.get<TopsResponse>(
        `/reports/${reportId}/tops`,
        { params },
      )
      return data
    },
    enabled: !!reportId,
  })
}

export function useReportsSummary() {
  return useQuery({
    queryKey: ['reports-summary'],
    queryFn: async () => {
      const { data } = await api.get<ReportSummary>('/reports/summary')
      return data
    },
  })
}

export function useGerencia() {
  return useQuery({
    queryKey: ['gerencia'],
    queryFn: async () => {
      const { data } = await api.get<GerenciaMetrics>('/reports/gerencia')
      return data
    },
  })
}

export function useMultipleReportMetrics(
  reportIds: string[],
  dateRange?: { from: string; to: string },
) {
  return useQueries({
    queries: reportIds.map((id) => ({
      queryKey: ['report-metrics', id, dateRange?.from, dateRange?.to] as const,
      queryFn: async () => {
        const params: Record<string, string> = {}
        if (dateRange?.from) params.from = dateRange.from
        if (dateRange?.to) params.to = dateRange.to
        const { data } = await api.get<ReportMetrics>(`/reports/${id}/metrics`, {
          params: Object.keys(params).length ? params : undefined,
        })
        return data
      },
      enabled: !!id,
    })),
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/reports/${reportId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['gerencia'] })
    },
  })
}

export function useUploadCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<UploadResponse>(
        '/reports/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['reports-summary'] })
      queryClient.invalidateQueries({ queryKey: ['gerencia'] })
    },
  })
}
