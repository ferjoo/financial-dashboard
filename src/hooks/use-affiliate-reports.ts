import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type {
  AffiliateReportMeta,
  AffiliateReportData,
  AffiliateSummary,
  AffiliateUploadResponse,
} from '@/types/api'

export function useAffiliateReports() {
  return useQuery({
    queryKey: ['affiliate-reports'],
    queryFn: async () => {
      const { data } = await api.get<{ reports: AffiliateReportMeta[] }>('/reports/affiliates')
      return data.reports
    },
  })
}

export function useAffiliateReport(reportId: string) {
  return useQuery({
    queryKey: ['affiliate-report', reportId],
    queryFn: async () => {
      const { data } = await api.get<AffiliateReportData>(`/reports/affiliates/${reportId}`)
      return data
    },
    enabled: !!reportId,
  })
}

export function useAffiliateSummary() {
  return useQuery({
    queryKey: ['affiliate-summary'],
    queryFn: async () => {
      const { data } = await api.get<AffiliateSummary>('/reports/affiliates/summary')
      return data
    },
  })
}

export function useUploadAffiliateCsv() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<AffiliateUploadResponse>(
        '/reports/upload-affiliate',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-reports'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-summary'] })
    },
  })
}

export function useDeleteAffiliateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reportId: string) => {
      await api.delete(`/reports/affiliates/${reportId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate-reports'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate-summary'] })
    },
  })
}
