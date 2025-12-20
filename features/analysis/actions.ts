'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { JobType, AnalysisResult, UploadResult } from './types'

const STORAGE_BUCKET = 'analysis-uploads'

/**
 * Upload a CSV file to Supabase Storage and create a job record
 */
export async function uploadAndCreateJob(
  formData: FormData,
  jobType: JobType
): Promise<UploadResult> {
  const supabase = await createServerSupabaseClient()
  
  const file = formData.get('file') as File
  if (!file) {
    throw new Error('No file provided')
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

  // TODO: Trigger Modal function here
  // await triggerModalJob(job.id, jobType, path)

  return {
    path,
    jobId: job.id,
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

