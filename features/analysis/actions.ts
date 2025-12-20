'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { JobType, AnalysisResult, UploadResult } from './types'

const STORAGE_BUCKET = 'analysis-uploads'
const MAX_DAILY_JOBS = 50
const MAX_FILE_SIZE_MB = 10
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

  // File size limit
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`)
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
 * Trigger the Edge Function to process a job
 * Fire-and-forget: we don't await the result, the UI polls for status
 */
async function triggerProcessing(jobId: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/process-job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({ jobId }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Edge function failed: ${error}`)
  }
}

/**
 * Poll job status
 */
export async function getJobStatus(jobId: string): Promise<AnalysisResult> {
  const supabase = await createServerSupabaseClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, status, result, error_message')
    .eq('id', jobId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch job: ${error.message}`)
  }

  return {
    jobId: job.id,
    status: job.status,
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

