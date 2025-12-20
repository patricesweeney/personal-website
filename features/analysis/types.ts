import type { Database } from '@/lib/supabase/database.types'

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobStatus = Job['status']

export type JobType = 
  | 'poisson_factorization'
  | 'survival_analysis'
  | 'nrr_decomposition'
  | 'propensity_model'

export interface AnalysisResult {
  jobId: string
  status: JobStatus
  progress: number
  result?: unknown
  error?: string
}

export interface UploadResult {
  path: string
  jobId: string
}

