'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { JobType, AnalysisResult, UploadResult } from './types'

const STORAGE_BUCKET = 'analysis-uploads'
const MAX_DAILY_JOBS = 50
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'leo'

/**
 * Upload a CSV file to Supabase Storage and create a job record
 */
export async function uploadAndCreateJob(
  formData: FormData,
  jobType: JobType
): Promise<UploadResult> {
  const supabase = await createServerSupabaseClient()

  // Password gate
  const password = formData.get('password') as string
  if (password !== DEMO_PASSWORD) {
    throw new Error('Invalid access code')
  }
  
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
  }

  // Rate limit: max jobs per day (public demo protection)
  const today = new Date().toISOString().split('T')[0]
  const { count } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', today)

  if ((count ?? 0) >= MAX_DAILY_JOBS) {
    throw new Error('Daily limit reached. Try again tomorrow.')
  }

  // Generate unique path
  const timestamp = Date.now()
  const path = `${jobType}/${timestamp}_${file.name}`

  // Upload to Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file)

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Create job record
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      job_type: jobType,
      input_file_path: path,
      status: 'pending',
    })
    .select('id')
    .single()

  if (jobError) {
    throw new Error(`Job creation failed: ${jobError.message}`)
  }

  // Trigger Edge Function to process the job (fire and forget)
  triggerProcessing(job.id).catch((err) => {
    console.error('Failed to trigger processing:', err)
  })

  return {
    path,
    jobId: job.id,
  }
}

/**
 * Trigger Modal to process the job
 * Fire-and-forget: we don't await the result, the UI polls for status
 */
async function triggerProcessing(jobId: string): Promise<void> {
  const modalUrl = process.env.MODAL_WEBHOOK_URL

  if (!modalUrl) {
    throw new Error('Missing MODAL_WEBHOOK_URL environment variable')
  }

  const response = await fetch(modalUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ jobId }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Modal trigger failed: ${error}`)
  }
}

// Jobs stuck in pending/running for more than this are considered stale
const STALE_JOB_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Poll job status with progress
 * 
 * Detects stale jobs that have been pending/running too long (likely due to
 * Modal failing to reach Supabase to update status)
 */
export async function getJobStatus(jobId: string): Promise<AnalysisResult> {
  const supabase = await createServerSupabaseClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, status, progress, result, error_message, created_at, updated_at')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  // Detect stale jobs: pending/running for too long with no progress
  const isStale =
    (job.status === 'pending' || job.status === 'running') &&
    job.progress === 0 &&
    Date.now() - new Date(job.updated_at ?? job.created_at).getTime() > STALE_JOB_TIMEOUT_MS

  if (isStale) {
    return {
      jobId: job.id,
      status: 'error',
      progress: 0,
      result: undefined,
      error: 'Job timed out. The processing server may be unreachable. Please try again.',
    }
  }

  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress ?? 0,
    result: job.result ?? undefined,
    error: job.error_message ?? undefined,
  }
}

/**
 * Get a signed URL for downloading results or viewing uploaded file
 */
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete the uploaded file for a job (call after processing completes)
 * This should be called by the processing backend (Modal) after job completion.
 */
export async function cleanupJobFile(jobId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()

  // Get the file path from the job
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select('input_file_path')
    .eq('id', jobId)
    .single()

  if (fetchError || !job?.input_file_path) {
    // Job not found or no file path - nothing to clean up
    return
  }

  // Delete the file from storage
  const { error: deleteError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([job.input_file_path])

  if (deleteError) {
    console.error(`Failed to delete file for job ${jobId}:`, deleteError.message)
    // Don't throw - cleanup failure shouldn't break the flow
  }

  // Clear the file path from the job record
  await supabase
    .from('jobs')
    .update({ input_file_path: null })
    .eq('id', jobId)
}

